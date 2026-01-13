import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useMatch, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WalletConnect } from "@/components/WalletConnect";
import NewTransaction from "./pages/NewTransaction";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { WalletProvider } from "@/context/WalletContext";
import MultisigPage from "./pages/MultisigPage";
import { StellarProvider } from "./context/StellarContext";
import TransactionDetail from "./pages/TransactionDetail";
import { Wallet } from "lucide-react";
import "@near-wallet-selector/modal-ui/styles.css";
import { SetupParams, WalletSelectorProvider } from "@near-wallet-selector/react-hook";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";

// import other wallets you want to support

const config: SetupParams = {
  network: "mainnet",
  modules: [
    setupMeteorWallet()
    // add other setup functions
    ],
  createAccessKeyFor: "social.near",
};
const queryClient = new QueryClient();


const AppContent = () => {
  const location = useLocation();

  // Show sidebar only if the route starts with /multisig
  const showSidebar = true


  return (
    <div className="min-h-screen flex w-full bg-background">
      {showSidebar && <AppSidebar />}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          {showSidebar ? <SidebarTrigger />: <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
              <div>
                <h2 className="font-semibold text-lg text-foreground">Near Safe</h2>
                <p className="text-xs text-muted-foreground">Multisig Wallet</p>
              </div>
          </div>
        </div>}

          <WalletConnect/>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<MultisigPage />} />
            <Route path="/new-transaction" element={<NewTransaction />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:proposalId" element={<TransactionDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletSelectorProvider config={config}>
    <WalletProvider>
        <StellarProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SidebarProvider>
                <AppContent />
              </SidebarProvider>
            </BrowserRouter>
          </TooltipProvider>
        </StellarProvider>
    </WalletProvider>
    </WalletSelectorProvider>
  </QueryClientProvider>
);

export default App;


