import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getFilteredProposals, Proposal } from "@/context/Near";
import { ProposalCard } from "./ProposalCard";

export default function Transactions() {
  const { toast } = useToast();
  const [data, setData] = useState<{
    approved: Proposal[];
    pending: Proposal[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

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
  }, [location.key, toast]);

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
        <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {(data?.pending.length ?? 0) + (data?.approved.length ?? 0)} total proposals
        </p>
      </div>

      <Tabs defaultValue="queue">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="queue" className="text-sm">
            Queue
            {(data?.pending.length ?? 0) > 0 && (
              <span className="ml-1.5 bg-primary/10 text-primary text-[11px] px-1.5 py-0.5 rounded-full font-medium">
                {data?.pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            History
            <span className="ml-1.5 text-muted-foreground text-[11px]">
              {data?.approved.length ?? 0}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4 space-y-3">
          {data?.pending.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No pending proposals"
              subtitle="All clear — nothing awaiting approval"
            />
          ) : (
            data?.pending.map((p) => <ProposalCard key={p.id} proposal={p} />)
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {data?.approved.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No history yet"
              subtitle="Completed proposals will appear here"
            />
          ) : (
            data?.approved.map((p) => <ProposalCard key={p.id} proposal={p} />)
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
      <CardContent className="text-center py-16 text-muted-foreground">
        <Icon className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
