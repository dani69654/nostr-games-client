export interface DepositProps {
    nOfPlayers: number;
}

export interface AmountStepProps {
    amount: string;
    setAmount: (amount: string) => void;
    loading: boolean;
    onGenerateInvoice: () => void;
}

export interface InvoiceStepProps {
    invoice: string;
    amount: string;
    onReset: () => void;
}

export interface CompletedStepProps {
    amount: string;
    onReset: () => void;
}
