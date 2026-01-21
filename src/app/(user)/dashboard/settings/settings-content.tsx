"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Check,
  KeyRound,
} from "lucide-react";
import {
  updateUserProfile,
  changeUserPassword,
  changeTransactionPin,
} from "@/lib/actions/users";

interface UserData {
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  hasPin: boolean;
  lastLogin?: Date;
}

interface SettingsContentProps {
  user: UserData;
}

export function SettingsContent({ user }: SettingsContentProps) {
  const router = useRouter();
  
  // Profile state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user.fullName,
    phone: user.phone || "",
    country: user.country || "",
    city: user.city || "",
    address: user.address || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // PIN state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinData, setPinData] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // Handle profile update
  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const result = await updateUserProfile(profileData);
      if (result.success) {
        toast.success("Profile updated successfully");
        setShowProfileModal(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    setIsUpdatingPassword(true);
    try {
      const result = await changeUserPassword(passwordData);
      if (result.success) {
        toast.success("Password changed successfully");
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(result.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle PIN change
  const handleChangePin = async () => {
    setIsUpdatingPin(true);
    try {
      const result = await changeTransactionPin(pinData);
      if (result.success) {
        toast.success(user.hasPin ? "PIN changed successfully" : "PIN set successfully");
        setShowPinModal(false);
        setPinData({ currentPin: "", newPin: "", confirmPin: "" });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to change PIN");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdatingPin(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile Settings */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Profile</h2>
              <p className="text-sm text-text-muted">Personal information</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-sm text-text-muted">Full Name</span>
              <span className="text-sm font-medium text-text-primary">{user.fullName}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-text-muted">Email</span>
              <span className="text-sm font-medium text-text-primary">{user.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-text-muted">Phone</span>
              <span className="text-sm font-medium text-text-primary">{user.phone || "Not set"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-text-muted">Country</span>
              <span className="text-sm font-medium text-text-primary">{user.country || "Not set"}</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowProfileModal(true)}
            className="mt-4 w-full"
          >
            Edit Profile
          </Button>
        </div>

        {/* Security Settings */}
        <div className="rounded-xl border border-border bg-surface p-6" id="security">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Security</h2>
              <p className="text-sm text-text-muted">Password & PIN</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-muted">Password</span>
              <span className="text-sm font-medium text-text-primary">••••••••</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-muted">Transaction PIN</span>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                user.hasPin 
                  ? "bg-success/10 text-success" 
                  : "bg-warning/10 text-warning"
              )}>
                {user.hasPin ? "Set" : "Not Set"}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
              className="w-full"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPinModal(true)}
              className="w-full"
            >
              <KeyRound className="h-4 w-4 mr-2" />
              {user.hasPin ? "Change PIN" : "Set PIN"}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Edit Profile</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Update your personal information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profileData.country}
                onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                placeholder="Enter your country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                placeholder="Enter your city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                placeholder="Enter your address"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowProfileModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile || !profileData.fullName.trim()}
              className="flex-1"
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Change Password</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-text-muted">Minimum 8 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                isUpdatingPassword ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                passwordData.newPassword.length < 8 ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
              className="flex-1"
            >
              {isUpdatingPassword ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change PIN Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              {user.hasPin ? "Change Transaction PIN" : "Set Transaction PIN"}
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              {user.hasPin 
                ? "Enter your current PIN and choose a new one"
                : "Set a 4-digit PIN for transactions"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {user.hasPin && (
              <div className="space-y-2">
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input
                  id="currentPin"
                  type="password"
                  maxLength={4}
                  value={pinData.currentPin}
                  onChange={(e) => setPinData({ ...pinData, currentPin: e.target.value.replace(/\D/g, "") })}
                  placeholder="Enter current PIN"
                  className="text-center text-2xl tracking-widest"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPin">New PIN</Label>
              <Input
                id="newPin"
                type="password"
                maxLength={4}
                value={pinData.newPin}
                onChange={(e) => setPinData({ ...pinData, newPin: e.target.value.replace(/\D/g, "") })}
                placeholder="Enter 4-digit PIN"
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-text-muted text-center">Must be exactly 4 digits</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                maxLength={4}
                value={pinData.confirmPin}
                onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value.replace(/\D/g, "") })}
                placeholder="Confirm PIN"
                className="text-center text-2xl tracking-widest"
              />
              {pinData.newPin && pinData.confirmPin && pinData.newPin === pinData.confirmPin && (
                <div className="flex items-center justify-center gap-1 text-success text-sm">
                  <Check className="h-4 w-4" />
                  PINs match
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowPinModal(false);
                setPinData({ currentPin: "", newPin: "", confirmPin: "" });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePin}
              disabled={
                isUpdatingPin ||
                (user.hasPin && !pinData.currentPin) ||
                pinData.newPin.length !== 4 ||
                pinData.newPin !== pinData.confirmPin
              }
              className="flex-1"
            >
              {isUpdatingPin ? "Saving..." : user.hasPin ? "Change PIN" : "Set PIN"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
