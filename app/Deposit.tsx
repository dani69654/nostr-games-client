'use client';

import { useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { nip19 } from 'nostr-tools';
import { CashuMint, CashuWallet, MintQuoteState, getEncodedToken } from '@cashu/cashu-ts';
import QrCode from './QrCode';
import { ECASH_MINT_URL } from './lib/ecash.lib';

const N_OF_DEPOSITS = 2;
const BE_URL = 'http://localhost:4000';

interface AmountStepProps {
    amount: string;
    setAmount: (amount: string) => void;
    loading: boolean;
    onGenerateInvoice: () => void;
}

const AmountStep = ({ amount, setAmount, loading, onGenerateInvoice }: AmountStepProps) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Amount (sats)</label>
        <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in satoshis"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
            min="1"
        />

        <button
            onClick={onGenerateInvoice}
            disabled={loading || !amount}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Invoice...
                </span>
            ) : (
                'Generate Invoice'
            )}
        </button>
    </div>
);

interface InvoiceStepProps {
    invoice: string;
    amount: string;
    onReset: () => void;
}

const InvoiceStep = ({ invoice, amount, onReset }: InvoiceStepProps) => (
    <div className="space-y-6">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Waiting for Payment</h3>
            <p className="text-slate-400 mb-4">Scan QR code or copy invoice to pay with Lightning</p>
            <div className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white px-4 py-2 rounded-lg inline-block font-semibold">
                {amount} sats
            </div>
        </div>

        <QrCode invoice={invoice} />

        <div className="bg-slate-900/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Lightning Invoice</label>
            <textarea
                value={invoice}
                readOnly
                className="w-full h-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs font-mono resize-none"
            />
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button
                onClick={() => navigator.clipboard.writeText(invoice)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
                Copy Invoice
            </button>

            <button
                onClick={() => {
                    const lightningUrl = `lightning:${invoice}`;
                    window.open(lightningUrl, '_blank');
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.11 23L16.89 14H12.5L13.89 1L8.11 10H12.5L11.11 23Z" />
                </svg>
                Open Wallet
            </button>
        </div>

        <button onClick={onReset} className="w-full px-4 py-2 text-slate-400 hover:text-white transition-colors">
            Cancel
        </button>
    </div>
);

export default function Deposit() {
    const { publicKey } = useAuthStore();
    const [amount, setAmount] = useState('');
    const [invoice, setInvoice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mint, setMint] = useState<CashuMint | null>(null);
    const [wallet, setWallet] = useState<CashuWallet | null>(null);
    const [step, setStep] = useState('amount'); // 'amount', 'invoice', 'completed'

    const initializeCashu = async () => {
        try {
            console.log('Initializing Cashu mint and wallet...');
            const cashuMint = new CashuMint(ECASH_MINT_URL);
            const cashuWallet = new CashuWallet(cashuMint);
            await cashuWallet.loadMint(); // Load mint keys

            setMint(cashuMint);
            setWallet(cashuWallet);

            console.log('Cashu initialized successfully');
            return { cashuMint, cashuWallet };
        } catch (err) {
            console.error('Error initializing Cashu:', err);
            throw new Error('Failed to initialize Cashu wallet');
        }
    };

    const processPubkey = (pubkey: string): string => {
        let pubkeyHex = pubkey.trim();

        // Convert npub to hex if needed
        if (pubkeyHex.startsWith('npub')) {
            try {
                const decoded = nip19.decode(pubkeyHex);
                if (decoded.type === 'npub') {
                    pubkeyHex = decoded.data;
                }
            } catch {
                throw new Error('Invalid npub format');
            }
        }

        // Validate hex pubkey (should be 64 characters for x-only pubkey)
        if (!/^[0-9a-fA-F]{64}$/.test(pubkeyHex)) {
            throw new Error('Invalid pubkey format. Must be 64-character hex or valid npub.');
        }

        return `02${pubkeyHex}`;
    };

    const generateInvoice = async () => {
        if (!amount || parseInt(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        try {
            setLoading(true);
            setError('');

            let processedPubkey: string | null = null;

            const response = await fetch(`${BE_URL}/vaults`, {
                method: 'POST',
                body: JSON.stringify({
                    maxNOfDeposits: N_OF_DEPOSITS,
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
                processedPubkey = processPubkey(data.publicKey);
                console.log('Processed pubkey for locking:', processedPubkey);
            }

            console.log('Generating Lightning invoice for', amount, 'sats');

            // Initialize Cashu if not already done
            let cashuMint = mint;
            let cashuWallet = wallet;

            if (!cashuMint || !cashuWallet) {
                const initialized = await initializeCashu();
                cashuMint = initialized.cashuMint;
                cashuWallet = initialized.cashuWallet;
            }

            // Request mint quote (creates Lightning invoice)
            console.log('Requesting mint quote...');
            const mintQuote = await cashuWallet.createMintQuote(parseInt(amount));
            console.log('Mint quote received:', mintQuote);

            setInvoice(mintQuote.request); // The Lightning invoice
            setStep('invoice');

            // Start polling for payment
            const maxAttempts = 60; // 5 minutes with 5-second intervals
            let attempts = 0;

            const checkPayment = async (vaultId: string) => {
                try {
                    console.log('Checking payment status...');
                    const quoteStatus = await cashuWallet.checkMintQuote(mintQuote.quote);

                    if (quoteStatus.state === MintQuoteState.PAID) {
                        console.log('Payment confirmed! Minting tokens...');

                        // Mint P2PK locked tokens if pubkey is available
                        const proofs = await cashuWallet.mintProofs(parseInt(amount), mintQuote.quote, {
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
                        setTimeout(() => checkPayment(vaultId), 5000); // Check every 5 seconds
                    } else {
                        setError('Payment timeout - please try again');
                        setStep('amount');
                    }
                } catch (err) {
                    console.error('Error checking payment status:', err);
                    setError(err instanceof Error ? err.message : 'Failed to check payment status');
                    setStep('amount');
                }
            };

            // Start polling
            setTimeout(() => checkPayment(data.id), 5000);
        } catch (err) {
            console.error('Error generating invoice:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate invoice');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setAmount('');
        setInvoice('');
        setError('');
        setStep('amount');
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">Deposit Funds</h2>

                {step === 'amount' && (
                    <AmountStep
                        amount={amount}
                        setAmount={setAmount}
                        loading={loading}
                        onGenerateInvoice={generateInvoice}
                    />
                )}

                {step === 'invoice' && invoice && <InvoiceStep invoice={invoice} amount={amount} onReset={reset} />}

                {step === 'completed' && (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-green-400">Deposit Successful!</h3>
                        <p className="text-slate-300">Your Cashu tokens have been added to the vault.</p>
                        <button
                            onClick={reset}
                            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                        >
                            Make Another Deposit
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
