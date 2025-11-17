import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateMultisig() {
  const [signers, setSigners] = useState<string[]>([""]);
  const [threshold, setThreshold] = useState(1);
  const { toast } = useToast();

  const addSigner = () => {
    setSigners([...signers, ""]);
  };

  const removeSigner = (index: number) => {
    if (signers.length > 1) {
      const newSigners = signers.filter((_, i) => i !== index);
      setSigners(newSigners);
      if (threshold > newSigners.length) {
        setThreshold(newSigners.length);
      }
    }
  };

  const updateSigner = (index: number, value: string) => {
    const newSigners = [...signers];
    newSigners[index] = value;
    setSigners(newSigners);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validSigners = signers.filter(s => s.trim() !== "");
    
    if (validSigners.length < 1) {
      toast({
        title: "Error",
        description: "Please add at least one signer",
        variant: "destructive",
      });
      return;
    }

    if (threshold < 1 || threshold > validSigners.length) {
      toast({
        title: "Error",
        description: "Threshold must be between 1 and the number of signers",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Multisig Created",
      description: `Created multisig with ${validSigners.length} signers and threshold of ${threshold}`,
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Create Multisig Account</h1>
        <p className="text-muted-foreground">Set up a new multisignature account on Stellar</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Multisig Configuration</CardTitle>
          <CardDescription>
            Add signers and set the required threshold for transaction approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Signers</Label>
                <Button type="button" onClick={addSigner} size="sm" variant="outline" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Add Signer
                </Button>
              </div>

              {signers.map((signer, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Stellar public key (G...)"
                      value={signer}
                      onChange={(e) => updateSigner(index, e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  {signers.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeSigner(index)}
                      size="icon"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-base font-semibold">
                Signature Threshold
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="threshold"
                  type="number"
                  min={1}
                  max={signers.length}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-32"
                />
                <p className="text-sm text-muted-foreground">
                  out of {signers.length} signer{signers.length !== 1 ? "s" : ""} required
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                The minimum number of signatures required to execute a transaction
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full">
                Create Multisig Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
