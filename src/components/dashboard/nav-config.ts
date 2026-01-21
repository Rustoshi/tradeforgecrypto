import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileCheck,
  Settings,
  User,
  Shield,
  Repeat,
  LineChart,
  Layers,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// Main sidebar navigation items
export const sidebarNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Portfolio overview",
  },
  {
    title: "Deposit",
    href: "/dashboard/deposit",
    icon: ArrowDownToLine,
    description: "Fund your account",
  },
  {
    title: "Withdraw",
    href: "/dashboard/withdraw",
    icon: ArrowUpFromLine,
    description: "Withdraw funds",
  },
  {
    title: "Plans",
    href: "/dashboard/plans",
    icon: Layers,
    description: "Investment plans",
  },
  {
    title: "Investments",
    href: "/dashboard/investments",
    icon: TrendingUp,
    description: "Active & past investments",
  },
  {
    title: "Trades",
    href: "/dashboard/trades",
    icon: LineChart,
    description: "Trading history",
  },
  {
    title: "Swap",
    href: "/dashboard/swap",
    icon: Repeat,
    description: "Convert between assets",
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
    description: "Deposits, withdrawals, profits",
  },
  {
    title: "KYC",
    href: "/dashboard/kyc",
    icon: FileCheck,
    description: "Identity verification",
  },
  {
    title: "Referrals",
    href: "/dashboard/referrals",
    icon: Users,
    description: "Invite friends & earn",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Profile & security",
  },
];

// Mobile bottom navigation - primary actions only
export const bottomNavItems: NavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Deposit",
    href: "/dashboard/deposit",
    icon: ArrowDownToLine,
  },
  {
    title: "Plans",
    href: "/dashboard/plans",
    icon: Layers,
  },
  {
    title: "Trades",
    href: "/dashboard/trades",
    icon: LineChart,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// User dropdown menu items
export const userMenuItems: NavItem[] = [
  {
    title: "Profile",
    href: "/dashboard/settings",
    icon: User,
  },
  {
    title: "Security",
    href: "/dashboard/settings#security",
    icon: Shield,
  },
];
