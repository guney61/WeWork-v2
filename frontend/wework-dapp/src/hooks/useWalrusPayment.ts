// SUI Testnet Payment Hook for Walrus Storage
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

export interface PaymentResult {
    success: boolean;
    digest?: string;
    error?: string;
}

export function useWalrusPayment() {
    const suiClient = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const [isPaying, setIsPaying] = useState(false);

    /**
     * Pay storage fee to platform (transfers SUI to treasury/fee address)
     * In production, this would go to your platform's treasury address
     */
    const payStorageFee = async (amountSui: number, recipientAddress?: string): Promise<PaymentResult> => {
        setIsPaying(true);

        try {
            // Platform treasury address (replace with actual address in production)
            const treasuryAddress = recipientAddress || '0x0000000000000000000000000000000000000000000000000000000000000001';

            // Convert SUI to MIST (1 SUI = 1e9 MIST)
            const amountMist = BigInt(Math.floor(amountSui * 1_000_000_000));

            const tx = new Transaction();

            // Split coins and transfer to treasury
            const [coin] = tx.splitCoins(tx.gas, [amountMist]);
            tx.transferObjects([coin], treasuryAddress);

            console.log(`Paying ${amountSui} SUI (${amountMist} MIST) to ${treasuryAddress}`);

            const result = await signAndExecute({
                transaction: tx,
            });

            console.log('Payment successful:', result.digest);

            // Wait for transaction confirmation
            await suiClient.waitForTransaction({
                digest: result.digest,
            });

            setIsPaying(false);
            return {
                success: true,
                digest: result.digest,
            };
        } catch (error) {
            console.error('Payment failed:', error);
            setIsPaying(false);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment failed',
            };
        }
    };

    return {
        payStorageFee,
        isPaying,
    };
}

/**
 * Format MIST to SUI for display
 */
export function mistToSui(mist: bigint | number): number {
    return Number(mist) / 1_000_000_000;
}

/**
 * Format SUI amount for display
 */
export function formatSui(amount: number): string {
    if (amount < 0.001) {
        return `${(amount * 1000).toFixed(3)} mSUI`;
    }
    return `${amount.toFixed(3)} SUI`;
}
