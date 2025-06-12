'use client';

import { useAuthStore } from './stores/authStore';
import Deposit from './Deposit';

export default function CoinFlip() {
    const { publicKey } = useAuthStore();

    if (!publicKey) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">Create Coin Flip</h2>

                <Deposit />
            </div>
        </div>
    );
}
