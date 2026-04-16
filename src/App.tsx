import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WalletConnect } from "@/components/WalletConnect";
import NewTransaction from "./pages/NewTransaction";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";
import MultisigPage from "./pages/MultisigPage";
import TransactionDetail from "./pages/TransactionDetail";
import "@near-wallet-selector/modal-ui/styles.css";
import { SetupParams, WalletSelectorProvider } from "@near-wallet-selector/react-hook";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";

const config: SetupParams = {
  network: "mainnet",
  modules: [setupMeteorWallet()],
  createAccessKeyFor: import.meta.env.VITE_MULTISIG_CONTRACT,
};

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <SidebarTrigger />
          <WalletConnect />
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<MultisigPage />} />
            <Route path="/new-transaction" element={<NewTransaction />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:proposalId" element={<TransactionDetail />} />
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </WalletSelectorProvider>
  </QueryClientProvider>
);

export default App;
