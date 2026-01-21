"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  Bitcoin,
  CreditCard,
  Building2,
  Wallet,
  DollarSign,
  Edit2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
  type PaymentMethodInput,
} from "@/lib/actions/settings";
import type { PaymentMethod, PaymentMethodType } from "@/lib/db";

interface PaymentMethodsManagerProps {
  paymentMethods: PaymentMethod[];
}

const paymentTypes: { value: PaymentMethodType; label: string; icon: React.ReactNode }[] = [
  { value: "CRYPTO", label: "Cryptocurrency", icon: <Bitcoin className="h-4 w-4" /> },
  { value: "PAYPAL", label: "PayPal", icon: <Wallet className="h-4 w-4" /> },
  { value: "ZELLE", label: "Zelle", icon: <DollarSign className="h-4 w-4" /> },
  { value: "CASHAPP", label: "Cash App", icon: <DollarSign className="h-4 w-4" /> },
  { value: "VENMO", label: "Venmo", icon: <Wallet className="h-4 w-4" /> },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: <Building2 className="h-4 w-4" /> },
  { value: "WISE", label: "Wise", icon: <CreditCard className="h-4 w-4" /> },
  { value: "SKRILL", label: "Skrill", icon: <CreditCard className="h-4 w-4" /> },
  { value: "OTHER", label: "Other", icon: <CreditCard className="h-4 w-4" /> },
];

const cryptoNetworks = [
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

const getPaymentTypeIcon = (type: PaymentMethodType) => {
  const found = paymentTypes.find(pt => pt.value === type);
  return found?.icon || <CreditCard className="h-4 w-4" />;
};

const getPaymentTypeLabel = (type: PaymentMethodType) => {
  const found = paymentTypes.find(pt => pt.value === type);
  return found?.label || type;
};

export function PaymentMethodsManager({ paymentMethods: initialMethods }: PaymentMethodsManagerProps) {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentMethodInput>({
    type: "CRYPTO",
    name: "",
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      type: "CRYPTO",
      name: "",
      isActive: true,
    });
    setEditingMethod(null);
  };

  const openAddDialog = (type?: PaymentMethodType) => {
    resetForm();
    if (type) {
      setFormData(prev => ({ ...prev, type }));
    }
    setIsDialogOpen(true);
  };

  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      name: method.name,
      isActive: method.isActive,
      network: method.network,
      walletAddress: method.walletAddress,
      email: method.email,
      username: method.username,
      phone: method.phone,
      bankName: method.bankName,
      accountName: method.accountName,
      accountNumber: method.accountNumber,
      routingNumber: method.routingNumber,
      swiftCode: method.swiftCode,
      iban: method.iban,
      bankAddress: method.bankAddress,
      instructions: method.instructions,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Please enter a name");
      return;
    }

    // Validate based on type
    if (formData.type === "CRYPTO" && (!formData.network || !formData.walletAddress)) {
      toast.error("Please enter network and wallet address");
      return;
    }

    if (["PAYPAL", "ZELLE", "VENMO", "WISE", "SKRILL"].includes(formData.type) && !formData.email && !formData.username && !formData.phone) {
      toast.error("Please enter at least one contact method (email, username, or phone)");
      return;
    }

    if (formData.type === "BANK_TRANSFER" && (!formData.bankName || !formData.accountName)) {
      toast.error("Please enter bank name and account name");
      return;
    }

    if (formData.type === "CASHAPP" && !formData.username) {
      toast.error("Please enter Cash App $cashtag");
      return;
    }

    setIsLoading(true);
    try {
      if (editingMethod) {
        const result = await updatePaymentMethod(editingMethod.id, formData);
        if (result.success) {
          toast.success("Payment method updated");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update");
        }
      } else {
        const result = await addPaymentMethod(formData);
        if (result.success && result.paymentMethod) {
          setMethods([...methods, result.paymentMethod]);
          toast.success("Payment method added");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to add");
        }
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    
    setIsLoading(true);
    try {
      const result = await deletePaymentMethod(id);
      if (result.success) {
        setMethods(methods.filter(m => m.id !== id));
        toast.success("Payment method deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const result = await togglePaymentMethodStatus(id);
      if (result.success) {
        setMethods(methods.map(m => 
          m.id === id ? { ...m, isActive: result.isActive! } : m
        ));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to toggle");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const cryptoMethods = methods.filter(m => m.type === "CRYPTO");
  const otherMethods = methods.filter(m => m.type !== "CRYPTO");

  const renderMethodDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case "CRYPTO":
        return (
          <p className="font-mono text-xs text-text-muted mt-1 break-all">
            {method.walletAddress}
          </p>
        );
      case "PAYPAL":
      case "ZELLE":
      case "VENMO":
      case "WISE":
      case "SKRILL":
        return (
          <p className="text-xs text-text-muted mt-1">
            {method.email || method.username || method.phone}
          </p>
        );
      case "CASHAPP":
        return (
          <p className="text-xs text-text-muted mt-1">
            {method.username}
          </p>
        );
      case "BANK_TRANSFER":
        return (
          <div className="text-xs text-text-muted mt-1 space-y-0.5">
            <p>{method.bankName}</p>
            <p>{method.accountName} • {method.accountNumber}</p>
          </div>
        );
      default:
        return method.instructions ? (
          <p className="text-xs text-text-muted mt-1 line-clamp-2">
            {method.instructions}
          </p>
        ) : null;
    }
  };

  return (
    <Card className="border-border-default bg-surface">
      <CardHeader>
        <CardTitle className="text-text-primary">Payment Methods</CardTitle>
        <CardDescription className="text-text-muted">
          Configure deposit payment methods for your users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="crypto" className="space-y-4">
          <TabsList className="bg-surface-muted">
            <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
            <TabsTrigger value="other">Other Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openAddDialog("CRYPTO")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Crypto Wallet
              </Button>
            </div>
            
            {cryptoMethods.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-lg">
                <Bitcoin className="h-8 w-8 mx-auto text-text-muted mb-2" />
                <p className="text-text-muted">No crypto wallets configured</p>
                <p className="text-sm text-text-muted mt-1">
                  Add your first cryptocurrency wallet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cryptoMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                        <Bitcoin className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-text-primary">{method.name}</p>
                          <span className="rounded bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                            {method.network}
                          </span>
                          {!method.isActive && (
                            <span className="rounded bg-error/10 px-2 py-0.5 text-xs text-error">
                              Disabled
                            </span>
                          )}
                        </div>
                        {renderMethodDetails(method)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={method.isActive}
                        onCheckedChange={() => handleToggle(method.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(method)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-error hover:text-error hover:bg-error/10"
                        onClick={() => handleDelete(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openAddDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
            
            {otherMethods.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-lg">
                <CreditCard className="h-8 w-8 mx-auto text-text-muted mb-2" />
                <p className="text-text-muted">No other payment methods configured</p>
                <p className="text-sm text-text-muted mt-1">
                  Add PayPal, Zelle, Bank Transfer, and more
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {otherMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {getPaymentTypeIcon(method.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-text-primary">{method.name}</p>
                          <span className="rounded bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                            {getPaymentTypeLabel(method.type)}
                          </span>
                          {!method.isActive && (
                            <span className="rounded bg-error/10 px-2 py-0.5 text-xs text-error">
                              Disabled
                            </span>
                          )}
                        </div>
                        {renderMethodDetails(method)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={method.isActive}
                        onCheckedChange={() => handleToggle(method.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(method)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-error hover:text-error hover:bg-error/10"
                        onClick={() => handleDelete(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="bg-surface border-border-default max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-text-primary">
                {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Payment Type */}
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: PaymentMethodType) => setFormData({ ...formData, type: value })}
                  disabled={!!editingMethod}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  placeholder={formData.type === "CRYPTO" ? "e.g., Bitcoin Wallet" : "e.g., PayPal Business"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Crypto Fields */}
              {formData.type === "CRYPTO" && (
                <>
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Select
                      value={formData.network || ""}
                      onValueChange={(value) => setFormData({ ...formData, network: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptoNetworks.map((network) => (
                          <SelectItem key={network.value} value={network.value}>
                            {network.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <Input
                      placeholder="Enter wallet address"
                      className="font-mono text-sm"
                      value={formData.walletAddress || ""}
                      onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* PayPal, Zelle, Venmo, Wise, Skrill Fields */}
              {["PAYPAL", "ZELLE", "VENMO", "WISE", "SKRILL"].includes(formData.type) && (
                <>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="payment@example.com"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  {formData.type !== "ZELLE" && (
                    <div className="space-y-2">
                      <Label>Username (optional)</Label>
                      <Input
                        placeholder="@username"
                        value={formData.username || ""}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Phone (optional)</Label>
                    <Input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Cash App Fields */}
              {formData.type === "CASHAPP" && (
                <div className="space-y-2">
                  <Label>$Cashtag</Label>
                  <Input
                    placeholder="$yourcashtag"
                    value={formData.username || ""}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              )}

              {/* Bank Transfer Fields */}
              {formData.type === "BANK_TRANSFER" && (
                <>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      placeholder="e.g., Bank of America"
                      value={formData.bankName || ""}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={formData.accountName || ""}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        placeholder="123456789"
                        value={formData.accountNumber || ""}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Routing Number</Label>
                      <Input
                        placeholder="021000021"
                        value={formData.routingNumber || ""}
                        onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SWIFT Code (optional)</Label>
                      <Input
                        placeholder="BOFAUS3N"
                        value={formData.swiftCode || ""}
                        onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IBAN (optional)</Label>
                      <Input
                        placeholder="US..."
                        value={formData.iban || ""}
                        onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Address (optional)</Label>
                    <Input
                      placeholder="123 Bank Street, City, State"
                      value={formData.bankAddress || ""}
                      onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Other/Custom Instructions */}
              {formData.type === "OTHER" && (
                <div className="space-y-2">
                  <Label>Payment Instructions</Label>
                  <Textarea
                    placeholder="Enter detailed payment instructions..."
                    rows={4}
                    value={formData.instructions || ""}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  />
                </div>
              )}

              {/* Additional Instructions for all types */}
              {formData.type !== "OTHER" && (
                <div className="space-y-2">
                  <Label>Additional Instructions (optional)</Label>
                  <Textarea
                    placeholder="Any additional notes for users..."
                    rows={2}
                    value={formData.instructions || ""}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  />
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingMethod ? "Update" : "Add"} Payment Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
