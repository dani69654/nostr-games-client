import QrCode from '@/app/QrCode';

export const DepositInvoiceStep = ({
    invoice,
    amount,
    onReset,
}: {
    invoice: string;
    amount: number;
    onReset: () => void;
}) => {
    return (
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
};
