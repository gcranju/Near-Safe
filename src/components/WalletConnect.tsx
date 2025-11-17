import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Freighter wallet type definitions
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      requestAccess: () => Promise<void>;
    };
  }
}

export function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.freighter) {
        const connected = await window.freighter.isConnected();
        if (connected) {
          const publicKey = await window.freighter.getPublicKey();
          setWalletAddress(publicKey);
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!window.freighter) {
        throw new Error("Freighter not installed");
      }
      
      await window.freighter.requestAccess();
      const publicKey = await window.freighter.getPublicKey();
      setWalletAddress(publicKey);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please install Freighter wallet extension",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  if (walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-secondary-foreground">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
        <Button variant="outline" size="icon" onClick={disconnectWallet}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} disabled={loading} className="gap-2">
      <Wallet className="w-4 h-4" />
      {loading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
