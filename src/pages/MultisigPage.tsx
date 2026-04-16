import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Loader2, Shield, Users, Clock } from "lucide-react";
import { getPolicy, getFilteredProposals } from '@/context/Near';

export default function MultisigPage() {
  const [multisigData, setMultisigData] = useState<{
    signers: string[];
    threshold: number;
    thresholdPercent: number;
    pending: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const multisigContract = import.meta.env.VITE_MULTISIG_CONTRACT;

  useEffect(() => {
    Promise.all([getPolicy(), getFilteredProposals()]).then(([metadata, proposals]) => {
      if (!metadata) return;

      const councilRole = metadata.roles.find((role) => role.name === "council");
      const kind = councilRole?.kind;
      const signers: string[] = typeof kind === 'object' && 'Group' in kind ? kind.Group : [];

      const roleVotePolicy = councilRole?.vote_policy;
      const firstPolicy = roleVotePolicy ? Object.values(roleVotePolicy)[0] : null;
      const threshold = firstPolicy?.threshold ?? metadata.default_vote_policy?.threshold;

      const calculatedThreshold =
        threshold && signers.length > 0
          ? Math.ceil((threshold[0] * signers.length) / threshold[1])
          : 0;

      setMultisigData({
        signers,
        threshold: calculatedThreshold,
        thresholdPercent: Math.round((threshold[0] * 100) / threshold[1]),
        pending: proposals.pending.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">{multisigContract}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wider">Threshold</CardDescription>
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {multisigData?.threshold ?? 0}
              <span className="text-base font-normal text-muted-foreground ml-1">
                / {multisigData?.signers.length ?? 0}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {multisigData?.thresholdPercent}% required to approve
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wider">Signers</CardDescription>
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {multisigData?.signers?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Council members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wider">Pending</CardDescription>
              <Clock className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {multisigData?.pending ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Council Members</CardTitle>
          <CardDescription className="text-xs">Addresses authorized to sign proposals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {multisigData?.signers.map((signer: string) => (
              <div
                key={signer}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xs font-semibold">
                    {signer.charAt(0).toUpperCase()}
                  </span>
                </div>
                <code className="text-sm font-mono text-foreground">{signer}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
