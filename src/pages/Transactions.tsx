import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getFilteredProposals, Proposal } from "@/context/Near";
import { ProposalCard } from "./ProposalCard";

export default function Transactions() {
  const { address } = useParams();
  const { toast } = useToast();
  const [data, setData] = useState<{
    approved: Proposal[];
    pending: Proposal[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getFilteredProposals();
        setData(res);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load proposals",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [address, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold">Multisig Transactions</h1>
        <p className="text-muted-foreground font-mono text-sm">{address}</p>
      </header>

      <Tabs defaultValue="queue">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue">
            Queue ({data?.pending.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({data?.approved.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-6 space-y-4">
          {data?.pending.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No pending proposals"
              subtitle="Nothing awaiting execution"
            />
          ) : (
            data?.pending.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          {data?.approved.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No executed proposals"
              subtitle="Executed proposals will appear here"
            />
          ) : (
            data?.approved.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="text-center py-12 text-muted-foreground">
        <Icon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">{title}</p>
        <p className="text-sm">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
