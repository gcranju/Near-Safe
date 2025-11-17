import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function NewTransaction() {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transaction Created",
      description: "Transaction has been submitted for signatures",
    });

    setDestination("");
    setAmount("");
    setMemo("");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">New Transaction</h1>
        <p className="text-muted-foreground">Create a new multisig transaction for approval</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Enter the transaction details. This will be submitted for signatures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="destination" className="text-base font-semibold">
                Destination Address *
              </Label>
              <Input
                id="destination"
                placeholder="Stellar public key (G...)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="font-mono"
                required
              />
              <p className="text-sm text-muted-foreground">
                The recipient's Stellar address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-semibold">
                Amount (XLM) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.0000001"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Amount to send in XLM
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo" className="text-base font-semibold">
                Memo (Optional)
              </Label>
              <Textarea
                id="memo"
                placeholder="Add a note for this transaction..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Add an optional memo to this transaction
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Transaction Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium text-foreground">{amount || "0"} XLM</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Fee:</span>
                  <span className="font-medium text-foreground">~0.00001 XLM</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full">
                Create Transaction
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
