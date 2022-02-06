import {PublicKey, Transaction} from "@solana/web3.js";

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
    | "connect"
    | "disconnect"
    | "signTransaction"
    | "signAllTransactions"
    | "signMessage";

interface ConnectOpts {
    onlyIfTrusted: boolean;
}

export interface PhantomProvider {
    publicKey: PublicKey | undefined;
    isConnected: boolean | null;
    signAndSendTransaction: (transaction: Transaction) => Promise<{publicKey: string, signature: string}>;
    signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
    signMessage: (
        message: Uint8Array | string,
        display?: DisplayEncoding
    ) => Promise<any>;
    connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: PhantomEvent, handler: (args: any) => void) => void;
    request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */
export const getProvider = (): PhantomProvider | undefined => {
    if ("solana" in window) {
        // @ts-ignore
        const provider = window.solana as any;
        if (provider.isPhantom) return provider as PhantomProvider;
    }
};