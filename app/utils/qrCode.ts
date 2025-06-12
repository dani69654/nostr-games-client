/**
 * Generate a QR code for a given text
 * @param text - The text to encode in the QR code
 * @param size - The size of the QR code
 * @returns The URL of the QR code
 */
export const generateQRCode = (text: string, size = 256): string => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
        text
    )}&format=png&margin=10`;
};
