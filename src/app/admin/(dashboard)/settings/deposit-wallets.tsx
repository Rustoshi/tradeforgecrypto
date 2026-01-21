"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAppSettings } from "@/lib/actions/settings";

interface DepositWallet {
  id?: string;
  name: string;
  address: string;
  network: string;
  isActive: boolean;
}

interface DepositWalletsManagerProps {
  wallets: DepositWallet[];
}

const networks = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT-TRC20", label: "USDT (TRC20)" },
  { value: "USDT-ERC20", label: "USDT (ERC20)" },
  { value: "USDC", label: "USD Coin (USDC)" },
  { value: "BNB", label: "BNB Chain" },
  { value: "LTC", label: "Litecoin (LTC)" },
  { value: "XRP", label: "Ripple (XRP)" },
  { value: "SOL", label: "Solana (SOL)" },
  { value: "DOGE", label: "Dogecoin (DOGE)" },
];

export function DepositWalletsManager({ wallets: initialWallets }: DepositWalletsManagerProps) {
  const router = useRouter();
  const [wallets, setWallets] = useState<DepositWallet[]>(initialWallets);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWallet, setNewWallet] = useState<DepositWallet>({
    name: "",
    address: "",
    network: "",
    isActive: true,
  });

  async function saveWallets(updatedWallets: DepositWallet[]) {
    setIsLoading(true);
    try {
      await updateAppSettings({ depositWallets: updatedWallets });
      setWallets(updatedWallets);
      toast.success("Wallets updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update wallets");
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddWallet() {
    if (!newWallet.name || !newWallet.address || !newWallet.network) {
      toast.error("Please fill in all fields");
      return;
    }

    const walletWithId = {
      ...newWallet,
      id: crypto.randomUUID(),
    };

    const updatedWallets = [...wallets, walletWithId];
    saveWallets(updatedWallets);
    setNewWallet({ name: "", address: "", network: "", isActive: true });
    setIsDialogOpen(false);
  }

  function handleDeleteWallet(index: number) {
    const updatedWallets = wallets.filter((_, i) => i !== index);
    saveWallets(updatedWallets);
  }

  function handleToggleActive(index: number) {
    const updatedWallets = wallets.map((wallet, i) =>
      i === index ? { ...wallet, isActive: !wallet.isActive } : wallet
    );
    saveWallets(updatedWallets);
  }

  return (
    <Card className="border-border-default bg-surface">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-text-primary">Deposit Wallets</CardTitle>
          <CardDescription className="text-text-muted">
            Configure deposit wallet addresses for different cryptocurrencies
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border-border-default">
            <DialogHeader>
              <DialogTitle className="text-text-primary">Add New Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-text-secondary">Wallet Name</Label>
                <Input
                  placeholder="e.g., Main BTC Wallet"
                  className="border-border-default bg-surface"
                  value={newWallet.name}
                  onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-text-secondary">Network</Label>
                <Select
                  value={newWallet.network}
                  onValueChange={(value) => setNewWallet({ ...newWallet, network: value })}
                >
                  <SelectTrigger className="border-border-default bg-surface">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value}>
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-text-secondary">Wallet Address</Label>
                <Input
                  placeholder="Enter wallet address"
                  className="border-border-default bg-surface font-mono text-sm"
                  value={newWallet.address}
                  onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-text-secondary">Active</Label>
                <Switch
                  checked={newWallet.isActive}
                  onCheckedChange={(checked) => setNewWallet({ ...newWallet, isActive: checked })}
                />
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
                onClick={handleAddWallet}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {!isLoading && wallets.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-text-muted">No wallets configured</p>
            <p className="text-sm text-text-muted mt-1">
              Click &quot;Add Wallet&quot; to add your first deposit wallet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {wallets.map((wallet, index) => (
              <div
                key={wallet.id || index}
                className="flex items-center justify-between rounded-md border border-border-default p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary">{wallet.name}</p>
                    <span className="rounded bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                      {wallet.network}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-text-muted mt-1 break-all">
                    {wallet.address}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <Switch
                    checked={wallet.isActive}
                    onCheckedChange={() => handleToggleActive(index)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-error hover:text-error hover:bg-error/10"
                    onClick={() => handleDeleteWallet(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
