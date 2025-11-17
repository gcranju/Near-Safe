import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";

const mockTransactions = [
  {
    id: "1",
    destination: "GCDNW7...EXAMPLE",
    amount: "100.00",
    signatures: 1,
    required: 2,
    status: "pending",
    created: "2 hours ago",
  },
  {
    id: "2",
    destination: "GCBXYZ...EXAMPLE",
    amount: "50.50",
    signatures: 2,
    required: 2,
    status: "ready",
    created: "1 day ago",
  },
];

export default function Transactions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Pending Transactions</h1>
        <p className="text-muted-foreground">Review and sign pending multisig transactions</p>
      </div>

      {mockTransactions.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="text-center py-12 text-muted-foreground">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No pending transactions</p>
            <p className="text-sm">All transactions have been executed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockTransactions.map((tx) => (
            <Card key={tx.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">Payment Transaction</CardTitle>
                      <Badge variant={tx.status === "ready" ? "default" : "secondary"}>
                        {tx.status === "ready" ? "Ready to Execute" : "Awaiting Signatures"}
                      </Badge>
                    </div>
                    <CardDescription>{tx.created}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{tx.amount} XLM</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">To:</span>
                    <code className="px-2 py-1 bg-muted rounded text-foreground font-mono">
                      {tx.destination}
                    </code>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {tx.status === "ready" ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Clock className="w-5 h-5 text-warning" />
                      )}
                      <div>
                        <p className="font-semibold text-sm">
                          {tx.signatures} of {tx.required} signatures collected
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.status === "ready"
                            ? "Transaction ready to execute"
                            : `${tx.required - tx.signatures} more signature${
                                tx.required - tx.signatures !== 1 ? "s" : ""
                              } needed`}
                        </p>
                      </div>
                    </div>
                    <Button variant={tx.status === "ready" ? "default" : "outline"} className="gap-2">
                      {tx.status === "ready" ? "Execute" : "Sign"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
