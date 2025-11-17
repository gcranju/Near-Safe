import {
    isConnected,
    requestAccess,
    getAddress,
    getNetwork,
} from "@stellar/freighter-api";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Horizon } from "stellar-sdk";

interface WalletContextType {
    walletAddress: string | null;
    network: string | null;
    loading: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    signerAccounts: string[];
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => useContext(WalletContext)!;

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [signerAccounts, setSignerAccounts] = useState<string[]>([]);

    useEffect(() => {
        // check if already connected
        (async () => {
            const connected = await isConnected();
            if (connected) {
                const { address } = await getAddress();
                const { network: currentNetwork } = await getNetwork();
                const signerAccounts = await fetchSignerAccounts(address);
                setSignerAccounts(signerAccounts);
                setWalletAddress(address);
                setNetwork(currentNetwork);
            }
        })();
    }, []);

    const fetchSignerAccounts = async (walletAddress: string) => {
        const serverURL =
            import.meta.env.VITE_HORIZON_URL ||
            "https://horizon-testnet.stellar.org";
        const server = new Horizon.Server(serverURL);

        try {
            const response = await server
                .accounts()
                .forSigner(walletAddress)
                .call();
            return response.records.map((a) => a.account_id).filter((id) => id !== walletAddress);
        } catch (error) {
            console.error("Error fetching accounts for signer:", error);
            return [];
        }
    };


    const connect = async () => {
        setLoading(true);
        try {
            await requestAccess();
            const { address } = await getAddress();
            const { network: currentNetwork } = await getNetwork();
            setWalletAddress(address);
            setNetwork(currentNetwork);
        } finally {
            setLoading(false);
        }
    };

    const disconnect = () => {
        setWalletAddress(null);
        setNetwork(null);
    };

    return (
        <WalletContext.Provider value={{ walletAddress, network, signerAccounts, loading, connect, disconnect }}>
            {children}
        </WalletContext.Provider>
    );
};
