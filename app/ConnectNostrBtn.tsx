'use client';

import { useState } from 'react';
import { getPublicKey, nip19 } from 'nostr-tools';
import { useAuthStore } from './stores/authStore';

export default function ConnectNostrBtn() {
    const { nostrKey: storeNostrKey, publicKey: storeNostrPubkey } = useAuthStore();
    const [nostrKey, setNostrKey] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [error, setError] = useState('');

    const handleConnect = () => {
        try {
            setError('');
            let secretKey;

            // Check if input is nsec format
            if (nostrKey.startsWith('nsec')) {
                const decoded = nip19.decode(nostrKey);
                if (decoded.type === 'nsec') {
                    secretKey = decoded.data;
                } else {
                    throw new Error('Invalid nsec format');
                }
            }
            // Check if input is hex format (64 characters)
            else if (nostrKey.length === 64 && /^[0-9a-fA-F]+$/.test(nostrKey)) {
                const matches = nostrKey.match(/.{1,2}/g);
                if (!matches) {
                    throw new Error('Invalid hex format');
                }
                secretKey = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
            }
            // Invalid format
            else {
                throw new Error('Please enter a valid secret key (hex format or nsec)');
            }

            // Generate public key
            const pubKey = getPublicKey(secretKey);
            const npub = nip19.npubEncode(pubKey);

            setPublicKey(npub);
            console.log('Public key:', npub);
            console.log('Public key hex:', pubKey);

            // save to auth store
            useAuthStore.setState({ nostrKey, publicKey: npub });
        } catch (error) {
            console.error('Error generating keys:', error);

            if (error instanceof Error) {
                setError(error.message);
            }
            setPublicKey('');
        }
    };

    if (storeNostrKey && storeNostrPubkey) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
            <input
                value={nostrKey}
                onChange={(e) => setNostrKey(e.target.value)}
                placeholder="Enter your secret key (hex or nsec)..."
                className="px-6 py-4 w-96 bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-purple-500/30 rounded-xl text-white placeholder:text-slate-400 font-medium text-lg shadow-lg shadow-purple-500/10 backdrop-blur-sm"
            />

            {error && (
                <div className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
                    {error}
                </div>
            )}

            {publicKey && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 w-96">
                    <p className="text-green-400 text-sm font-medium mb-2">Public Key (npub):</p>
                    <p className="text-white text-sm font-mono break-all">{publicKey}</p>
                </div>
            )}

            <button
                onClick={handleConnect}
                disabled={!nostrKey.trim()}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out border border-purple-500/20 hover:border-purple-400/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    CONNECT WITH NOSTR
                </span>
            </button>
        </div>
    );
}
