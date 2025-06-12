'use client';

import Modal from 'react-modal';
import { DepositAmountStep } from './DepositAmountStep';
import { DepositInvoiceStep } from './DepositInvoiceStep';
import { useDeposit } from '../../hooks/useDeposit';
import { X, Wallet, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface DepositProps {
    nOfPlayers: number;
    isOpen: boolean;
    onClose: () => void;
}

// Stili custom per react-modal con scrollbar nascosta
const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        position: 'relative' as const,
        top: 'auto',
        left: 'auto',
        right: 'auto',
        bottom: 'auto',
        border: 'none',
        background: 'transparent',
        padding: 0,
        margin: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const,
        msOverflowStyle: 'none' as const, // IE e Edge
        scrollbarWidth: 'none' as const, // Firefox
    },
};

const ProgressIndicator = ({ currentStep }: { currentStep: string }) => {
    const steps = [
        { id: 'amount', label: 'Amount', icon: Wallet },
        { id: 'invoice', label: 'Payment', icon: Zap },
        { id: 'completed', label: 'Complete', icon: CheckCircle },
    ];

    const getCurrentStepIndex = () => {
        return steps.findIndex((step) => step.id === currentStep);
    };

    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = getCurrentStepIndex() > index;
                const isLast = index === steps.length - 1;

                return (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 ${
                                isCompleted
                                    ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25'
                                    : isActive
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25 scale-110'
                                    : 'bg-slate-800 border-slate-600 text-slate-400'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            {isActive && (
                                <div className="absolute inset-0 rounded-full border-2 border-orange-300 animate-ping" />
                            )}
                        </div>
                        <div className="flex flex-col items-center mx-2">
                            <span
                                className={`text-xs font-medium transition-colors ${
                                    isCompleted ? 'text-green-400' : isActive ? 'text-orange-400' : 'text-slate-500'
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {!isLast && (
                            <div
                                className={`w-12 h-0.5 mx-2 rounded transition-all duration-500 ${
                                    isCompleted ? 'bg-green-500' : 'bg-slate-600'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const Deposit = ({ nOfPlayers, isOpen, onClose }: DepositProps) => {
    const { handleGenereteDepositInvoice, amount, error, isLoading, invoice, step, setAmount, reset } = useDeposit({
        maxNOfDeposits: nOfPlayers,
    });

    const handleReset = () => {
        reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <>
            {/* CSS per nascondere la scrollbar WebKit */}
            <style jsx global>{`
                .ReactModal__Content::-webkit-scrollbar {
                    display: none;
                }
                .ReactModal__Content {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <Modal
                isOpen={isOpen}
                onRequestClose={handleClose}
                style={customStyles}
                contentLabel="Deposit Funds"
                ariaHideApp={false}
            >
                {/* Modal Content */}
                <div className="relative bg-slate-900/98 backdrop-blur-xl border border-orange-500/30 rounded-2xl shadow-2xl shadow-black/50">
                    {/* Animated border glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 via-yellow-500/30 to-orange-500/30 rounded-2xl blur-sm" />

                    <div className="relative bg-slate-900 rounded-2xl p-8 md:p-10">
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors hover:bg-slate-800/50 p-2 rounded-xl z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                                Deposit Funds
                            </h2>
                            <p className="text-slate-400 text-lg mt-3">
                                Add Bitcoin Lightning funds to your gaming vault ({nOfPlayers} players max)
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        <ProgressIndicator currentStep={step} />

                        {/* Content */}
                        <div className="max-w-2xl mx-auto">
                            {step === 'amount' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <DepositAmountStep
                                            amount={amount}
                                            setAmount={setAmount}
                                            loading={isLoading}
                                            onGenerateInvoice={handleGenereteDepositInvoice}
                                        />
                                    </div>
                                    <div className="hidden lg:flex items-center justify-center">
                                        <div className="text-center space-y-6">
                                            <div className="w-24 h-24 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-orange-500/10">
                                                <Wallet className="w-12 h-12 text-orange-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">
                                                    Fund Your Vault
                                                </h3>
                                                <p className="text-slate-400">
                                                    Deposit Lightning sats to start playing coinflip games
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 'invoice' && invoice && (
                                <DepositInvoiceStep invoice={invoice} amount={amount} onReset={handleReset} />
                            )}

                            {step === 'completed' && (
                                <div className="text-center space-y-8">
                                    {/* Success animation */}
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/25 animate-bounce">
                                            <CheckCircle className="w-12 h-12 text-white" />
                                        </div>
                                        {/* Success ripples */}
                                        <div className="absolute inset-0 w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                                            <div className="absolute inset-2 bg-green-500/10 rounded-full animate-ping animation-delay-75" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-bold text-green-400">Deposit Successful! 🎉</h3>
                                        <p className="text-slate-300 text-lg">
                                            Your Cashu tokens have been securely added to the vault.
                                        </p>
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                            <p className="text-green-400 font-semibold">
                                                ✅ {(amount || '0').toLocaleString()} sats deposited successfully
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={handleReset}
                                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-500/25 transform hover:scale-105"
                                        >
                                            Make Another Deposit
                                        </button>
                                        <button
                                            onClick={handleClose}
                                            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all duration-200"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-6 bg-red-900/30 border border-red-500/40 rounded-xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                        <p className="text-red-400 font-medium">{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};
