import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User, Clock, Vote } from "lucide-react";
import { Proposal } from "@/context/Near";
import { useNavigate } from "react-router-dom";

function formatDate(nanoTimestamp: string) {
  const ms = Number(nanoTimestamp) / 1_000_000;
  const diff = Date.now() - ms;

  if (diff < 0) return "Just now";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Approved: "bg-accent/10 text-accent border-accent/20",
    Rejected: "bg-destructive/10 text-destructive border-destructive/20",
    Expired: "bg-warning/10 text-warning border-warning/20",
    InProgress: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${styles[status] ?? styles.InProgress}`}>
      {status}
    </span>
  );
}

function proposalKindLabel(kind: any): string {
  const key = Object.keys(kind)[0];
  const labels: Record<string, string> = {
    Transfer: "Transfer",
    AddMemberToRole: "Add Member",
    RemoveMemberFromRole: "Remove Member",
    FunctionCall: "Function Call",
    ChangePolicy: "Policy Change",
    ChangePolicyAddOrUpdateRole: "Role Update",
    ChangePolicyUpdateDefaultVotePolicy: "Vote Policy",
    ChangePolicyUpdateParameters: "Parameters",
  };
  return labels[key] ?? key;
}

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const navigate = useNavigate();
  const voteCount = proposal.votes ? Object.keys(proposal.votes).length : 0;

  return (
    <Card
      className="group cursor-pointer hover:border-primary/30 transition-colors"
      onClick={() => navigate(`/transactions/${proposal.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">#{proposal.id}</span>
              <StatusBadge status={proposal.status} />
              <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                {proposalKindLabel(proposal.kind)}
              </span>
            </div>

            <p className="text-sm text-muted-foreground truncate mb-2">
              {proposal.description || "No description"}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-mono">
                <User className="w-3 h-3" />
                {proposal.proposer}
              </span>
              <span className="flex items-center gap-1">
                <Vote className="w-3 h-3" />
                {voteCount} votes
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(proposal.submission_time)}
              </span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
