import { useCallback, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { initializeEcashWallet, pubkeyToLockingPubkey } from '../utils/ecash.utils';
import { CashuMint, CashuWallet, getEncodedToken, MintQuoteResponse, MintQuoteState } from '@cashu/cashu-ts';
import { ECASH_MINT_URL } from '../lib/ecash.lib';

const BE_URL = 'http://localhost:4000';

export const useDeposit = ({ maxNOfDeposits }: { maxNOfDeposits: number }) => {
    const { publicKey } = useAuthStore();
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [mint, setMint] = useState<CashuMint | null>(null);
    const [wallet, setWallet] = useState<CashuWallet | null>(null);
    const [invoice, setInvoice] = useState('');
    const [step, setStep] = useState('amount'); // 'amount', 'invoice', 'completed'

    const handleInitializeEcashWallet = useCallback(async () => {
        const { cashuMint, cashuWallet } = await initializeEcashWallet();
        setMint(cashuMint);
        setWallet(cashuWallet);
        return { cashuMint, cashuWallet };
    }, []);

    const checkPayment = useCallback(
        async ({
            vaultId,
            mintQuote,
            processedPubkey,
            cashuWallet,
            maxAttempts,
        }: {
            vaultId: string;
            mintQuote: MintQuoteResponse;
            processedPubkey: string;
            cashuWallet: CashuWallet;
            maxAttempts: number;
        }): Promise<void> => {
            try {
                let attempts = 0;
                console.log('Checking payment status...');
                const quoteStatus = await cashuWallet.checkMintQuote(mintQuote.quote);

                if (quoteStatus.state === MintQuoteState.PAID) {
                    console.log('Payment confirmed! Minting tokens...');

                    // Mint P2PK locked tokens if pubkey is available
                    const proofs = await cashuWallet.mintProofs(amount, mintQuote.quote, {
                        keysetId: undefined, // Let wallet choose
                        counter: undefined, // Let wallet manage counter
                        pubkey: processedPubkey || undefined, // This creates P2PK locked proofs if pubkey is available
                    });

                    console.log('🔒 P2PK locked tokens minted successfully:', proofs);

                    // Create Cashu token
                    const cashuToken = getEncodedToken({
                        mint: ECASH_MINT_URL,
                        proofs,
                        unit: 'sat',
                        memo: '🔒 Coin Flip Deposit',
                    });

                    console.log('🎉 Cashu token created:', cashuToken);

                    // Add token to vault
                    const addTokenResponse = await fetch(`${BE_URL}/vaults/${vaultId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            cashuToken,
                        }),
                    });

                    if (!addTokenResponse.ok) {
                        const errorText = await addTokenResponse.text();
                        console.error('Failed to add token to vault:', errorText);
                        throw new Error(`Failed to add token to vault: ${errorText}`);
                    }

                    console.log('✅ Token added to vault successfully');
                    setStep('completed');
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(
                        () =>
                            checkPayment({
                                vaultId,
                                mintQuote,
                                processedPubkey,
                                cashuWallet,
                                maxAttempts,
                            }),
                        5000
                    ); // Check every 5 seconds
                } else {
                    setError('Payment timeout - please try again');
                    setStep('amount');
                }
            } catch (err) {
                console.error('Error checking payment status:', err);
                setError(err instanceof Error ? err.message : 'Failed to check payment status');
                setStep('amount');
            }
        },
        [amount]
    );

    const handleGenereteDepositInvoice = useCallback(async () => {
        if (!amount) {
            setError('Please enter a valid amount');
            return;
        }

        try {
            setLoading(true);
            setError('');

            let processedPubkey: string | null = null;

            // Request vault creation
            const response = await fetch(`${BE_URL}/vaults`, {
                method: 'POST',
                body: JSON.stringify({
                    maxNOfDeposits,
                    depositorPubkey: publicKey,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to create vault');
            }

            const data = await response.json();

            if (data.publicKey.trim()) {
                processedPubkey = pubkeyToLockingPubkey(data.publicKey);
                console.log('Processed pubkey for locking:', processedPubkey);
            }

            // Initialize Cashu if not already done
            let cashuMint = mint;
            let cashuWallet = wallet;

            if (!cashuMint || !cashuWallet) {
                const initialized = await handleInitializeEcashWallet();
                cashuMint = initialized.cashuMint;
                cashuWallet = initialized.cashuWallet;
            }

            // Request mint quote (creates Lightning invoice)
            console.log('Requesting mint quote...');
            const mintQuote = await cashuWallet.createMintQuote(amount);
            console.log('Mint quote received:', mintQuote);

            setInvoice(mintQuote.request); // The Lightning invoice
            setStep('invoice');

            // Start polling for payment
            const maxAttempts = 60; // 5 minutes with 5-second intervals

            setTimeout(
                () =>
                    checkPayment({
                        vaultId: data.id,
                        mintQuote,
                        processedPubkey: processedPubkey!,
                        cashuWallet,
                        maxAttempts,
                    }),
                5000
            );
        } catch (err) {
            console.error('Error generating invoice:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate invoice');
        } finally {
            setLoading(false);
        }
    }, [amount, maxNOfDeposits, publicKey, mint, wallet, handleInitializeEcashWallet, checkPayment]);

    const reset = useCallback(() => {
        setAmount(0);
        setError('');
        setInvoice('');
        setStep('amount');
    }, []);

    return {
        handleGenereteDepositInvoice,
        amount,
        error,
        isLoading,
        invoice,
        step,
        setAmount,
        reset,
    };
};
