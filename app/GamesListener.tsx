'use client';

import { useEffect, useState } from 'react';
import { Coins, Users, Zap, Trophy, Play } from 'lucide-react';
import { NDKKind } from '@nostr-dev-kit/ndk';
import { connectNDK } from './User';

interface CoinFlipGameReq {
    nOfPlayers: number;
    createdBy: string;
    depositAmount: number;
    lockedCashuToken: string;
    gameId?: string;
    createdAt?: number;
}

export default function CoinFlipGamesUI() {
    const [games, setGames] = useState<CoinFlipGameReq[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock data per la demo
    useEffect(() => {
        connectNDK().then((ndk) => {
            const sub = ndk.subscribe({
                kinds: [NDKKind.Text],
                '#t': ['nostr-game=cf'],
                since: Math.floor(Date.now() / 1000),
            });

            sub.on('event', (event: { content: string }) => {
                setGames((prev) => [...prev, JSON.parse(event.content)]);
            });

            sub.start();
        });

        setIsLoading(false);
    }, []);

    const truncateNpub = (npub: string) => {
        return `${npub.slice(0, 8)}...${npub.slice(-4)}`;
    };

    const joinGame = (gameId: string) => {
        // Implementa la logica per unirsi al gioco
        console.log('Joining game:', gameId);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-4">
                            <Coins className="w-8 h-8 text-yellow-400 animate-spin" />
                            <span className="text-xl text-white">Caricamento giochi...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full">
                            <Coins className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                        CoinFlip Arena
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Giochi di testa o croce decentralizzati su Bitcoin Lightning
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center space-x-3">
                            <Trophy className="w-8 h-8 text-yellow-400" />
                            <div>
                                <div className="text-2xl font-bold text-white">{games.length}</div>
                                <div className="text-gray-300">Giochi Totali</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center space-x-3">
                            <Zap className="w-8 h-8 text-orange-400" />
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {games.reduce((sum, game) => sum + game.depositAmount, 0).toLocaleString()}
                                </div>
                                <div className="text-gray-300">Sats in Gioco</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista Giochi */}

                {!games.length ? (
                    <div className="text-center py-12">
                        <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">Nessun gioco trovato</h3>
                        <p className="text-gray-400">Non ci sono giochi al momento.</p>
                    </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => (
                        <div
                            key={game.gameId}
                            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:scale-105"
                        >
                            {/* Dettagli del gioco */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-5 h-5 text-blue-400" />
                                        <span className="text-white font-medium">{game.nOfPlayers} Giocatori</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400">Max</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        <span className="text-white font-medium">
                                            {game.depositAmount.toLocaleString()} sats
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400">Deposito</div>
                                    </div>
                                </div>

                                <div className="border-t border-white/20 pt-4">
                                    <div className="text-sm text-gray-400 mb-1">Creato da</div>
                                    <div className="text-white font-mono text-sm">{truncateNpub(game.createdBy)}</div>
                                </div>
                            </div>

                            {/* Azioni */}
                            <div className="mt-6">
                                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                                    <Play className="w-4 h-4" />
                                    <span>Unisciti al Gioco</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
