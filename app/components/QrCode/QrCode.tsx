/* eslint-disable @next/next/no-img-element */
import { generateQRCode } from '../../utils/qrCode.utils';

export const QrCode = ({ invoice }: { invoice: string }) => {
    return (
        <div className="flex justify-center">
            <div className="bg-white p-4 rounded-xl shadow-lg">
                <img
                    src={generateQRCode(invoice, 200)}
                    alt="Lightning Invoice QR Code"
                    className="w-48 h-48 rounded-lg"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const nextSibling = target.nextSibling as HTMLElement;
                        if (nextSibling) {
                            nextSibling.style.display = 'block';
                        }
                    }}
                />
                <div className="w-48 h-48 bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-400 text-sm text-center hidden">
                    QR Code failed to load
                </div>
            </div>
        </div>
    );
};
