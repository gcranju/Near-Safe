import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Shield, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your multisignature accounts and transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Total Multisigs</CardTitle>
            <CardDescription>Active multisig accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">0</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <CardTitle>Pending Transactions</CardTitle>
            <CardDescription>Awaiting signatures</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">0</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-success" />
            </div>
            <CardTitle>Total Signers</CardTitle>
            <CardDescription>Across all multisigs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Create your first multisig account or transaction</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate("/create-multisig")} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Create Multisig
          </Button>
          <Button onClick={() => navigate("/new-transaction")} variant="outline" className="gap-2">
            New Transaction
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Your Multisig Accounts</CardTitle>
          <CardDescription>Manage and view your multisignature accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No multisig accounts yet</p>
            <p className="text-sm mb-6">Create your first multisig account to get started</p>
            <Button onClick={() => navigate("/create-multisig")} variant="outline">
              Create Multisig Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
