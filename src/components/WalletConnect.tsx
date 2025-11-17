import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/context/WalletContext";

export function WalletConnect() {
  const { walletAddress, network, loading, connect, disconnect } = useWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "Wallet Connected",
        description: walletAddress
          ? `Connected to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} (${network})`
          : "Connected",
      });
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: "Please make sure Freighter is installed and unlocked.",
      });
    }
  };

  return walletAddress ? (
    <div className="flex items-center gap-3">
      <div className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-secondary-foreground">
        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}{" "}
        <span className="ml-2 text-xs opacity-70">[{network}]</span>
      </div>
      <Button variant="outline" size="icon" onClick={disconnect}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    <Button onClick={handleConnect} disabled={loading} className="gap-2">
      <Wallet className="w-4 h-4" />
      {loading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
