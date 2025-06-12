import { CashuMint, CashuWallet } from '@cashu/cashu-ts';
import { ECASH_MINT_URL } from '../lib/ecash.lib';
import { nip19 } from 'nostr-tools';

/**
 * Initialize the Cashu mint and wallet
 * @returns the cashu mint and wallet
 */
export const initializeEcashWallet = async (): Promise<{ cashuMint: CashuMint; cashuWallet: CashuWallet }> => {
    try {
        const cashuMint = new CashuMint(ECASH_MINT_URL);
        const cashuWallet = new CashuWallet(cashuMint);
        await cashuWallet.loadMint();
        return { cashuMint, cashuWallet };
    } catch (err) {
        console.error('Error initializing Cashu:', err);
        throw new Error('Failed to initialize Cashu wallet');
    }
};

/**
 * Process the pubkey to a locking pubkey
 * @param pubkey - The pubkey to process
 * @returns The locking pubkey
 */
export const pubkeyToLockingPubkey = (pubkey: string): string => {
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
