'use client';

import { useAuthStore } from './stores/authStore';
import { Deposit } from './components/deposit/Deposit';
import { useState } from 'react';
import { Wallet, Zap } from 'lucide-react';

export default function CoinFlip() {
    const { publicKey } = useAuthStore();
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

    if (!publicKey) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">Create Coin Flip</h2>

                <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-orange-500/25 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>

                    {/* Button content */}
                    <div className="relative flex items-center gap-3">
                        <Wallet className="w-6 h-6" />
                        <span>Deposit & Create Game</span>
                        <Zap className="w-5 h-5 opacity-80" />
                    </div>
                </button>

                <Deposit nOfPlayers={2} isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
            </div>
        </div>
    );
}
