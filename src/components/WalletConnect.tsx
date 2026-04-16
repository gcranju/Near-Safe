import { useState, useRef, useEffect } from 'react';
import { Wallet, Copy, LogOut, ChevronDown } from 'lucide-react';
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { useToast } from "@/hooks/use-toast";

export const WalletConnect = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { signIn, signOut, signedAccountId } = useWalletSelector();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const truncateAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const copyAddress = () => {
    if (!signedAccountId) return;
    navigator.clipboard.writeText(signedAccountId);
    setIsDropdownOpen(false);
    toast({ title: "Copied", description: "Address copied to clipboard" });
  };

  if (!signedAccountId) {
    return (
      <button
        onClick={() => signIn()}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <Wallet className="w-4 h-4" />
        Connect
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium py-2 px-3 rounded-lg transition-colors border border-border"
      >
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary text-[10px] font-bold">
            {signedAccountId.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="font-mono text-xs">{truncateAddress(signedAccountId)}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-border bg-muted/50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Wallet</p>
            <p className="text-xs font-mono text-foreground break-all">{signedAccountId}</p>
          </div>

          <button
            onClick={copyAddress}
            className="w-full px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            Copy Address
          </button>

          <button
            onClick={async () => {
              await signOut();
              setIsDropdownOpen(false);
            }}
            className="w-full px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2 border-t border-border"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
