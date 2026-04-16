import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Users,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getProposal,
  prepareVote,
  Proposal,
  Vote,
} from "@/context/Near";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

function formatNearTime(nano: string) {
  const ms = Number(nano) / 1_000_000;
  return new Date(ms).toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Approved: "bg-accent/10 text-accent border-accent/20",
    Rejected: "bg-destructive/10 text-destructive border-destructive/20",
    Expired: "bg-warning/10 text-warning border-warning/20",
    InProgress: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${styles[status] ?? styles.InProgress}`}>
      {status}
    </span>
  );
}

export default function NearTransactionDetail() {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const { callFunction, signedAccountId } = useWalletSelector();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProposal(Number(proposalId));
        setProposal(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load proposal",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [proposalId, toast]);

  async function handleVote(vote: Vote) {
    if (!proposal) return;

    try {
      setVoting(true);

      const txData = prepareVote(proposal.id, vote);
      await callFunction(txData);

      toast({
        title: "Vote submitted",
        description: `You voted ${vote === Vote.Approve ? 'to approve' : 'to reject'}`,
      });

      const updated = await getProposal(proposal.id);
      setProposal(updated);
    } catch {
      toast({
        title: "Vote failed",
        description: "Unable to submit vote",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center min-h-[300px] items-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!proposal) {
    return <p className="text-muted-foreground text-sm">Proposal not found</p>;
  }

  const votes = proposal.votes ? Object.entries(proposal.votes) : [];
  const hasVoted = proposal.votes && signedAccountId ? signedAccountId in proposal.votes : false;

  function decodeFunctionCallArgs(args: string) {
    try {
      return JSON.parse(atob(args));
    } catch {
      return args;
    }
  }

  const decodedArgs = proposal.kind.FunctionCall
    ? {
        ...proposal.kind,
        FunctionCall: {
          ...proposal.kind.FunctionCall,
          actions: proposal.kind.FunctionCall.actions.map((action: any) => ({
            ...action,
            args: decodeFunctionCallArgs(action.args),
          })),
        },
      }
    : proposal.kind;

  return (
    <div className="space-y-5 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proposal #{proposal.id}</h1>
        <StatusBadge status={proposal.status} />
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        {formatNearTime(proposal.submission_time)}
      </p>

      {/* Description */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">{proposal.description || "No description"}</p>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Proposed Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-auto font-mono leading-relaxed">
            {JSON.stringify(decodedArgs, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Voting */}
      {proposal.status === "InProgress" && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cast Your Vote</CardTitle>
            <CardDescription className="text-xs">
              {hasVoted ? "You have already voted on this proposal" : "Approve or reject this proposal"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              disabled={voting || hasVoted}
              onClick={() => handleVote(Vote.Approve)}
              className="flex-1 gap-2"
              size="sm"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {voting ? "Submitting..." : "Approve"}
            </Button>

            <Button
              disabled={voting || hasVoted}
              variant="destructive"
              onClick={() => handleVote(Vote.Reject)}
              className="flex-1 gap-2"
              size="sm"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {voting ? "Submitting..." : "Reject"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Votes */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Votes
            </CardTitle>
            <span className="text-xs text-muted-foreground">{votes.length} total</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {votes.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No votes yet</p>
          ) : (
            votes.map(([account, vote]) => (
              <div
                key={account}
                className="flex justify-between items-center p-2.5 bg-muted/50 rounded-lg"
              >
                <span className="text-sm font-mono text-foreground">{account}</span>
                <Badge variant={vote === "Approve" ? "default" : "destructive"} className="text-[11px]">
                  {String(vote)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Execution */}
      {proposal.status === "Approved" && (
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="flex items-center gap-2 py-4 text-sm text-accent">
            <CheckCircle2 className="w-4 h-4" />
            Proposal approved and executed
          </CardContent>
        </Card>
      )}
    </div>
  );
}
