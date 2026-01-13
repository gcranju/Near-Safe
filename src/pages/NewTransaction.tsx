import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

// Import your NEAR SDK functions
import {
  prepareAddProposal,
  createTransferProposal,
  createAddMemberProposal,
  createRemoveMemberProposal,
  createFunctionCallProposal,
  type ProposalInput,
  getPolicy,
  createChangeThresholdProposal
} from "@/context/Near";

export default function NewTransaction() {
  const [proposalType, setProposalType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { callFunction } = useWalletSelector();

  // Transfer fields
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenId, setTokenId] = useState("");

  // Member fields
  const [memberId, setMemberId] = useState("");
  const [role, setRole] = useState("council");

  // Function call fields
  const [contractId, setContractId] = useState("");
  const [methodName, setMethodName] = useState("");
  const [methodArgs, setMethodArgs] = useState("");
  const [deposit, setDeposit] = useState("0");
  const [gas, setGas] = useState("100000000000000");
  const [signers, setSigners] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(0);
  const [thresholdPercent, setThresholdPercent] = useState(50)

  useEffect(() => {
    // getProposals()
    getPolicy().then((metadata) => {
      if (!metadata) return;

      const councilRole = metadata.roles.find(
        (role: any) => role.name === "council"
      );
      //@ts-ignore
      const signers: string[] = councilRole?.kind?.Group ?? [];

      const threshold = metadata.default_vote_policy?.threshold;
      const thresholdPercent = (threshold[0] * 100) / threshold[1];
      const calculatedThreshold =
        threshold && signers.length > 0
          ? Math.ceil(((threshold[0] + 1) * signers.length) / threshold[1])
          : 0;


      setSigners(Array.from(signers));
      setThreshold(calculatedThreshold);
      setThresholdPercent(thresholdPercent);
    });
  }, []);

  const membersCount = signers.length;
  const proposalTypes = [
    { value: "transfer", label: "Transfer NEAR/Tokens" },
    { value: "add_member", label: "Add Council Member" },
    { value: "remove_member", label: "Remove Council Member" },
    { value: "function_call", label: "Function Call" },
    { value: "change_threshold", label: "Change Threshold" },
  ];

  const createProposal = (): ProposalInput | null => {
    switch (proposalType) {
      case "transfer":
        if (!receiverId || !amount) {
          setError("Please provide receiver and amount");
          return null;
        }
        return createTransferProposal(
          description,
          receiverId,
          formatNearAmount(amount),
          tokenId || ""
        );

      case "add_member":
        if (!memberId) {
          setError("Please provide member account ID");
          return null;
        }

        const isExistingSigner = signers.includes(memberId.trim());
        //revert if existing signer
        if (isExistingSigner) {
          setError("This member is already a signer");
          return null;
        }
        return createAddMemberProposal(description, memberId, role);

      case "remove_member":
        if (!memberId) {
          setError("Please provide member account ID");
          return null;
        }
        return createRemoveMemberProposal(description, memberId, role);

      case "change_threshold":
        if (!thresholdPercent) {
          setError("Please provide threshold percent");
          return null;
        }
        return createChangeThresholdProposal(description, thresholdPercent);
      case "function_call":
        if (!contractId || !methodName) {
          setError("Please provide contract ID and method name");
          return null;
        }

        let parsedArgs = {};
        if (methodArgs.trim()) {
          try {
            parsedArgs = JSON.parse(methodArgs);
          } catch (error) {
            setError("Method arguments must be valid JSON");
            return null;
          }
        }

        return createFunctionCallProposal(
          description,
          contractId,
          methodName,
          btoa(JSON.stringify(parsedArgs)),
          deposit || "0",
          gas || "100000000000000"
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!proposalType) {
      setError("Please select a proposal type");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a description");
      return;
    }

    setIsSubmitting(true);

    try {
      const proposal = createProposal();
      if (!proposal) {
        setIsSubmitting(false);
        return;
      }

      const txData = prepareAddProposal(proposal, '0');
      const tx = await callFunction(txData);
      console.log("Transaction Data:", txData, "Transaction:", tx);
      console.log("Proposal:", proposal);

      setSuccess("Proposal created successfully!");

      // Reset form after 2 seconds
      setTimeout(() => {
        setProposalType("");
        setDescription("");
        setReceiverId("");
        setAmount("");
        setTokenId("");
        setMemberId("");
        setRole("council");
        setContractId("");
        setMethodName("");
        setMethodArgs("");
        setDeposit("0");
        setGas("100000000000000");
        setSuccess(null);
      }, 2000);

    } catch (error) {
      console.error("Error creating proposal:", error);
      setError(error instanceof Error ? error.message : "Failed to create proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>New DAO Proposal</CardTitle>
          <CardDescription>
            Create a new proposal for the NEAR DAO multisig contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Proposal Type */}
            <div className="space-y-2">
              <Label>Proposal Type *</Label>
              <Select value={proposalType} onValueChange={setProposalType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select proposal type" />
                </SelectTrigger>
                <SelectContent>
                  {proposalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the purpose of this proposal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {/* Transfer Fields */}
            {proposalType === "transfer" && (
              <>
                <div className="space-y-2">
                  <Label>Receiver Account *</Label>
                  <Input
                    placeholder="receiver.near"
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="font-mono"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount (NEAR) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount in NEAR tokens (will be converted to yoctoNEAR)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Token ID (optional)</Label>
                  <Input
                    placeholder="Leave empty for NEAR, or token.near for FT"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    className="font-mono"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for native NEAR transfers
                  </p>
                </div>
              </>
            )}

            {/* Add/Remove Member Fields */}
            {/* Add/Remove Member Fields */}
            {proposalType === "add_member" && (
              <>
                <div className="space-y-2">
                  <Label>Member Account *</Label>
                  <Input
                    placeholder="member.near"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="font-mono"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Input
                    placeholder="council"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: council
                  </p>
                </div>
              </>
            )}

            {proposalType === "remove_member" && (
              <>
                <div className="space-y-2">
                  <Label>Member to Remove *</Label>
                  <Select
                    value={memberId}
                    onValueChange={setMemberId}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="font-mono">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {signers.map((signer) => (
                        <SelectItem key={signer} value={signer}>
                          {signer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Input
                    value={role}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Fixed for removal
                  </p>
                </div>
              </>
            )}

            {proposalType === "change_threshold" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Approval Quorum *</Label>

                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={thresholdPercent}
                    onChange={(e) => setThresholdPercent(Number(e.target.value))}
                    disabled={isSubmitting}
                    className="w-full"
                  />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="rounded-md border p-3 text-sm">
                  <strong>{thresholdPercent}%</strong> approval required
                  <div className="text-muted-foreground mt-1">
                    Equals{" "}
                    <strong>
                      {Math.max(
                        1,
                        Math.ceil(((thresholdPercent + 1) / 100) * membersCount)
                      )}
                    </strong>{" "}
                    of {membersCount} members
                  </div>
                </div>
              </div>
            )}



            {/* Function Call Fields */}
            {proposalType === "function_call" && (
              <>
                <div className="space-y-2">
                  <Label>Contract ID *</Label>
                  <Input
                    placeholder="contract.near"
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    className="font-mono"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Method Name *</Label>
                  <Input
                    placeholder="method_name"
                    value={methodName}
                    onChange={(e) => setMethodName(e.target.value)}
                    className="font-mono"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Method Arguments (JSON)</Label>
                  <Textarea
                    placeholder='{"arg1": "value1", "arg2": 123}'
                    value={methodArgs}
                    onChange={(e) => setMethodArgs(e.target.value)}
                    className="font-mono text-sm"
                    disabled={isSubmitting}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be valid JSON. Leave empty if no arguments needed.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Deposit (yoctoNEAR)</Label>
                    <Input
                      placeholder="0"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="font-mono text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Default: 0
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Gas</Label>
                    <Input
                      placeholder="100000000000000"
                      value={gas}
                      onChange={(e) => setGas(e.target.value)}
                      className="font-mono text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Default: 100 TGas
                    </p>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isSubmitting || !proposalType}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Proposal...
                </>
              ) : (
                "Create Proposal"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">About Proposals</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Transfer:</strong> Send NEAR or fungible tokens to an account
          </p>
          <p>
            <strong>Add/Remove Member:</strong> Manage DAO council membership
          </p>
          <p>
            <strong>Function Call:</strong> Execute any method on any NEAR contract
          </p>
          <p className="text-xs mt-4">
            All proposals require approval from council members before execution.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
function formatNearAmount(amount: string): string {
  const [whole, frac = ""] = amount.split(".");
  const fracPadded = frac.padEnd(24, "0").slice(0, 24);
  return (BigInt(whole + fracPadded)).toString();
};
