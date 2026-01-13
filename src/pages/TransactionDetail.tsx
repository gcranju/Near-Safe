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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getProposal,
  prepareVote, // 👈 make sure this exists in your Near context
  Proposal,
  Vote,
} from "@/context/Near";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

/* ---------- Utils ---------- */

function formatNearTime(nano: string) {
  const ms = Number(nano) / 1_000_000;
  return new Date(ms).toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, any> = {
    InProgress: "secondary",
    Approved: "outline",
    Executed: "default",
    Rejected: "destructive",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
}

/* ---------- Component ---------- */

export default function NearTransactionDetail() {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const {  callFunction } = useWalletSelector();

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

      const txData = await prepareVote(proposal.id, vote);
      await callFunction(txData);

      toast({
        title: "Vote submitted",
        description: `You voted ${vote}`,
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
        <Clock className="animate-spin" />
      </div>
    );
  }

  if (!proposal) {
    return <p className="text-muted-foreground">Proposal not found</p>;
  }

  const votes = proposal.votes
    ? Object.entries(proposal.votes)
    : [];

  const hasVoted = false; // 👈 optionally replace with wallet-based check

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
        actions: proposal.kind.FunctionCall.actions.map(action => ({
          ...action,
          args: decodeFunctionCallArgs(action.args),
        })),
      },
    }
  : proposal.kind;


  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Proposal #{proposal.id}
        </h1>
        <StatusBadge status={proposal.status} />
      </div>

      <p className="text-muted-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Created {formatNearTime(proposal.submission_time)}
      </p>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{proposal.description}</p>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Proposed Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(decodedArgs, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Voting Actions */}
      {proposal.status === "InProgress" && (
        <Card>
          <CardHeader>
            <CardTitle>Cast Your Vote</CardTitle>
            <CardDescription>
              Approve or reject this proposal
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              disabled={voting || hasVoted}
              onClick={() => handleVote(Vote.Approve)}
              className="flex-1 gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              {voting ? "Submitting..." : "Approve"}
            </Button>

            <Button
              disabled={voting || hasVoted}
              variant="destructive"
              onClick={() => handleVote(Vote.Reject)}
              className="flex-1 gap-2"
            >
              <ThumbsDown className="w-4 h-4" />
              {voting ? "Submitting..." : "Reject"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Votes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Votes
          </CardTitle>
          <CardDescription>
            {votes.length} total votes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {votes.map(([account, vote]) => (
            <div
              key={account}
              className="flex justify-between p-2 bg-muted rounded text-sm font-mono"
            >
              <span>{account}</span>
              <Badge variant={vote === "Yes" ? "default" : "secondary"}>
                {String(vote)}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Execution */}
      {proposal.status === "Executed" && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center gap-2 py-4">
            <CheckCircle2 className="text-success" />
            Proposal executed successfully
          </CardContent>
        </Card>
      )}
    </div>
  );
}
