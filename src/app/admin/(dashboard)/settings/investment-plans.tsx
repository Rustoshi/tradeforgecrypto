"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { investmentPlanSchema, type InvestmentPlanInput } from "@/lib/validations/settings";
import {
  createInvestmentPlan,
  updateInvestmentPlan,
  deleteInvestmentPlan,
} from "@/lib/actions/settings";

interface Plan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
  isActive: boolean;
  _count: { users: number; investments: number };
}

interface InvestmentPlansManagerProps {
  plans: Plan[];
}

export function InvestmentPlansManager({ plans }: InvestmentPlansManagerProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InvestmentPlanInput>({
    resolver: zodResolver(investmentPlanSchema),
    defaultValues: {
      name: "",
      minAmount: 0,
      maxAmount: 0,
      roiPercentage: 0,
      durationDays: 0,
      isActive: true,
    },
  });

  function openCreateDialog() {
    setEditingPlan(null);
    form.reset({
      name: "",
      minAmount: 0,
      maxAmount: 0,
      roiPercentage: 0,
      durationDays: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(plan: Plan) {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      minAmount: plan.minAmount,
      maxAmount: plan.maxAmount,
      roiPercentage: plan.roiPercentage,
      durationDays: plan.durationDays,
      isActive: plan.isActive,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(data: InvestmentPlanInput) {
    setIsLoading(true);

    try {
      if (editingPlan) {
        await updateInvestmentPlan(editingPlan.id, data);
        toast.success("Plan updated successfully");
      } else {
        await createInvestmentPlan(data);
        toast.success("Plan created successfully");
      }
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingPlan) return;

    setIsLoading(true);
    try {
      await deleteInvestmentPlan(deletingPlan.id);
      toast.success("Plan deleted successfully");
      setDeletingPlan(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border-default bg-surface">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-text-primary">Investment Plans</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Starter Plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="minAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="roiPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ROI (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border border-border-default p-3">
                      <FormLabel className="cursor-pointer">Active</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary-hover"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingPlan ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <p className="text-center text-text-muted">No investment plans configured</p>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between rounded-md border border-border-default p-4"
              >
                <div>
                  <p className="font-medium text-text-primary">{plan.name}</p>
                  <p className="text-sm text-text-muted">
                    ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()} |{" "}
                    {plan.roiPercentage}% ROI | {plan.durationDays} days
                  </p>
                  <p className="text-xs text-text-muted">
                    {plan._count.users} users | {plan._count.investments} investments
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${plan.isActive ? "text-success" : "text-text-muted"}`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-error hover:text-error"
                    onClick={() => setDeletingPlan(plan)}
                    disabled={plan._count.users > 0 || plan._count.investments > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingPlan?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error text-white hover:bg-error/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
