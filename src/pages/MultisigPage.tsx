import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Clock, Shield, Users } from "lucide-react";
import { useStellar } from "@/context/StellarContext";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import {
  getPolicy
} from '@/context/Near';


export default function MultisigPage() {
  const [multisigData, setMultisigData] = useState<any>({
    signers: [],
    threshold: 0,
    pending: 0,
  });
  const multisigContract = import.meta.env.VITE_MULTISIG_CONTRACT;


  useEffect(() => {
    // getProposals()
    getPolicy().then((metadata) => {
      if (!metadata) return;

      const councilRole = metadata.roles.find(
        (role: any) => role.name === "council"
      );
      //@ts-ignore
      const signers: string[] = councilRole?.kind?.Group ?? [];

      const threshold = metadata.default_vote_policy?.threshold;
      const calculatedThreshold =
        threshold && signers.length > 0
          ? Math.ceil(((threshold[0] + 1) * signers.length) / threshold[1])
          : 0;

      setMultisigData((prevData: any) => ({
        ...prevData,
        signers,
        threshold: calculatedThreshold,
      }));
    });
  }, []);


  return (

    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {"Dashboard"}
        </h1>
        <p className="text-muted-foreground font-mono text-sm">{"multisig" + ":" + multisigContract}</p>
      </div>

      <Tabs defaultValue="home" className="w-full">

        <TabsContent value="home" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Threshold</CardTitle>
                <CardDescription>Required signatures</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {multisigData?.threshold || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Signers</CardTitle>
                <CardDescription>Total signers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {multisigData?.signers?.length || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Pending</CardTitle>
                <CardDescription>Awaiting signatures</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{multisigData?.pending}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Current Signers</CardTitle>
              <CardDescription>Addresses authorized to sign transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {multisigData?.signers.map((signer: string) => (
                  <div
                    key={signer}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <code className="text-sm font-mono">{signer}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
