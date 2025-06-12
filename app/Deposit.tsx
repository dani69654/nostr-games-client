'use client';

import { DepositAmountStep } from './components/deposit/DepositAmountStep';
import { DepositInvoiceStep } from './components/deposit/DepositInvoiceStep';
import { useDeposit } from './hooks/useDeposit';

export const Deposit = ({ nOfPlayers }: { nOfPlayers: number }) => {
    const { handleGenereteDepositInvoice, amount, error, isLoading, invoice, step, setAmount, reset } = useDeposit({
        maxNOfDeposits: nOfPlayers,
    });

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">Deposit Funds</h2>

                {step === 'amount' && (
                    <DepositAmountStep
                        amount={amount}
                        setAmount={setAmount}
                        loading={isLoading}
                        onGenerateInvoice={handleGenereteDepositInvoice}
                    />
                )}

                {step === 'invoice' && invoice && (
                    <DepositInvoiceStep invoice={invoice} amount={amount} onReset={reset} />
                )}

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
};
