import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Clock, Vote } from "lucide-react";
import { Proposal } from "@/context/Near";

function formatDate(nanoTimestamp: string) {
  const ms = Number(nanoTimestamp) / 1_000_000;
  const diff = Date.now() - ms;

  if (diff < 0) return "Just now";

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}


function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Approved"
      ? "default"
      : status === "Rejected"
      ? "destructive"
      : "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const voteCount = proposal.votes
    ? Object.keys(proposal.votes).length
    : 0;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CardTitle className="text-lg">
                Proposal #{proposal.id}
              </CardTitle>
              <StatusBadge status={proposal.status} />
            </div>
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDate(proposal.submission_time)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          {proposal.description}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono truncate">
              {proposal.proposer}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-muted-foreground" />
            <span>{voteCount} votes</span>
          </div>
        </div>

        {/* Kind summary */}
        {proposal.kind && (
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">
              Proposal Kind
            </p>
            <code className="block p-3 bg-muted rounded text-xs font-mono break-all">
              {JSON.stringify(proposal.kind, null, 2)}
            </code>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              (window.location.href = `/transactions/${proposal.id}`)
            }
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
