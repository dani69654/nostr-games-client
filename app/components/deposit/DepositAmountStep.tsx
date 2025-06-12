export const DepositAmountStep = ({
    amount,
    setAmount,
    loading,
    onGenerateInvoice,
}: {
    amount: number;
    setAmount: (amount: number) => void;
    loading: boolean;
    onGenerateInvoice: () => void;
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Amount (sats)</label>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
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
};
