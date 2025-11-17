import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X, Save, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const [signers, setSigners] = useState<string[]>(["GDJKL...EXAMPLE1", "GHJKL...EXAMPLE2"]);
  const [newSigner, setNewSigner] = useState("");
  const [threshold, setThreshold] = useState(2);
  const { toast } = useToast();

  const addSigner = () => {
    if (!newSigner.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid public key",
        variant: "destructive",
      });
      return;
    }

    if (signers.includes(newSigner)) {
      toast({
        title: "Error",
        description: "This signer already exists",
        variant: "destructive",
      });
      return;
    }

    setSigners([...signers, newSigner]);
    setNewSigner("");
    toast({
      title: "Signer Added",
      description: "New signer will be added after you save changes",
    });
  };

  const removeSigner = (index: number) => {
    if (signers.length <= 1) {
      toast({
        title: "Error",
        description: "Multisig must have at least one signer",
        variant: "destructive",
      });
      return;
    }

    const newSigners = signers.filter((_, i) => i !== index);
    setSigners(newSigners);
    
    if (threshold > newSigners.length) {
      setThreshold(newSigners.length);
    }

    toast({
      title: "Signer Removed",
      description: "Signer will be removed after you save changes",
    });
  };

  const handleSaveChanges = () => {
    if (threshold < 1 || threshold > signers.length) {
      toast({
        title: "Error",
        description: "Threshold must be between 1 and the number of signers",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Changes Saved",
      description: `Updated multisig with ${signers.length} signers and threshold of ${threshold}`,
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Multisig Settings</h1>
        <p className="text-muted-foreground">Manage signers and threshold requirements for your multisig account</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Current Signers
          </CardTitle>
          <CardDescription>
            Signers who can approve transactions for this multisig account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {signers.map((signer, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="flex-1">
                  <p className="font-mono text-sm break-all">{signer}</p>
                </div>
                <Button
                  type="button"
                  onClick={() => removeSigner(index)}
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-semibold">Add New Signer</Label>
            <div className="flex gap-3">
              <Input
                placeholder="Stellar public key (G...)"
                value={newSigner}
                onChange={(e) => setNewSigner(e.target.value)}
                className="font-mono"
              />
              <Button
                type="button"
                onClick={addSigner}
                variant="outline"
                className="gap-2 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Signature Threshold</CardTitle>
          <CardDescription>
            The minimum number of signatures required to execute a transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            Changing the threshold will require approval from the current threshold number of signers
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} size="lg" className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
