import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Shield, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Horizon } from "stellar-sdk";
import { useWallet } from "@/context/WalletContext";
import { useEvm } from "@/context/EvmContext";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { walletAddress, network, signerAccounts } = useWallet();
  const { getMultisig } = useEvm();

  const [multisigMetadata, setMultisigMetadata] = useState([]);
  console.log("Signer Address:", signerAccounts);
  console.log("Multisig Accounts:", multisigMetadata);

  useEffect(() => {
    if (walletAddress) {
      for (const account of signerAccounts) {
        getMultisig(account).then((metadata) => {
          if (metadata) {
            setMultisigMetadata((prev) => [
              ...prev,
              {
                address: account,
                name: metadata.name,
                signers: metadata.signers,
                threshold: metadata.threshold,
              },
            ]);
          } else {
            setMultisigMetadata((prev) => [
              ...prev,
              {
                address: account,
                name: "",
                signers: [],
                threshold: 0,
              },
            ]);
          }
        });
      }
    }
  }, [walletAddress,]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your multisignature accounts and transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Total Multisigs</CardTitle>
            <CardDescription>Active multisig accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{signerAccounts.length}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <CardTitle>Pending Transactions</CardTitle>
            <CardDescription>Awaiting signatures</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">0</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-success" />
            </div>
            <CardTitle>Total Signers</CardTitle>
            <CardDescription>Across all multisigs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">0</p>
          </CardContent>
        </Card>
      </div>

      {signerAccounts.length === 0 && walletAddress != null && <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Create your first multisig account or transaction</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate("/create-multisig")} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Create Multisig
          </Button>
          <Button onClick={() => navigate("/new-transaction")} variant="outline" className="gap-2">
            New Transaction
          </Button>
        </CardContent>
      </Card>}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Your Multisig Accounts</CardTitle>
          <CardDescription>Manage and view your multisignature accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {multisigMetadata.map((metadata, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">
                    {metadata.name || `Multisig Account ${index + 1}`}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">{metadata.address}</p>

                  <p className="text-xs mt-1">
                    <strong>Threshold:</strong> {metadata.threshold}
                  </p>

                  <div className="text-xs mt-2">
                    <strong>Signers:</strong>
                    {/* {metadata.signers.length > 0 ? ( */}
                      <ul className="list-disc ml-5 mt-1">
                        {metadata.signers.map((signer, i) => (
                          <li key={i} className="font-mono">
                            {signer}
                          </li>
                        ))}
                      </ul>
                    {/* ) : (
                      <p className="italic text-muted-foreground">No signers defined.</p>
                    )} */}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/multisig/${metadata.address}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}

        </CardContent>
      </Card>
    </div>
  );
}
