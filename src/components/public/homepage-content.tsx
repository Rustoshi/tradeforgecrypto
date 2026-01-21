"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle2,
  Target,
  Eye,
  Heart,
  Zap,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Play,
  Award,
  Globe,
  Lock,
  BarChart3,
  Wallet,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  FadeIn, 
  StaggerContainer, 
  StaggerItem, 
  SlideIn, 
  Counter,
  ScaleOnHover,
  Floating
} from "@/components/public/animations";
import { TickerTape, MarketOverview, MiniChart } from "@/components/public/tradingview-widget";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

import type { PublicInvestmentPlan } from "@/lib/actions/public";

interface AppSettings {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
}

interface HomepageContentProps {
  settings: AppSettings;
  plans: PublicInvestmentPlan[];
}

const stats = [
  { value: 2.4, suffix: "B+", prefix: "$", label: "Assets Under Management" },
  { value: 50000, suffix: "+", prefix: "", label: "Active Investors" },
  { value: 99.9, suffix: "%", prefix: "", label: "Platform Uptime" },
  { value: 847, suffix: "M+", prefix: "$", label: "Total Payouts" },
];

const features = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Multi-layer encryption, cold storage, and 24/7 monitoring protect your assets.",
    image: "/images/security-lock.jpg",
  },
  {
    icon: TrendingUp,
    title: "Consistent Returns",
    description: "Diversified portfolio strategies designed for stable, long-term growth.",
    image: "/images/growth-chart.jpg",
  },
  {
    icon: Clock,
    title: "Flexible Terms",
    description: "Choose investment durations that align with your financial goals.",
    image: "/images/time-clock.jpg",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Personal account managers available around the clock.",
    image: "/images/customer-support.jpg",
  },
];

const highlights = [
  { icon: Award, text: "Regulated and licensed investment platform" },
  { icon: Eye, text: "Transparent fee structure with no hidden costs" },
  { icon: BarChart3, text: "Real-time portfolio tracking and reporting" },
  { icon: Wallet, text: "Instant withdrawals to verified accounts" },
  { icon: Globe, text: "Multi-currency support including crypto" },
  { icon: Lock, text: "Insurance-backed asset protection" },
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "Democratizing access to institutional-grade investment opportunities for everyone.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Complete visibility into fees, performance, and investment strategies.",
  },
  {
    icon: Heart,
    title: "Client-First",
    description: "Every decision we make prioritizes our investors' financial wellbeing.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Leveraging cutting-edge technology to deliver superior investment experiences.",
  },
];

const milestones = [
  { year: "2019", event: "Founded with a vision to democratize investing", highlight: true },
  { year: "2020", event: "Reached $100M in assets under management", highlight: false },
  { year: "2021", event: "Expanded to 25+ countries worldwide", highlight: false },
  { year: "2022", event: "Launched cryptocurrency investment options", highlight: true },
  { year: "2023", event: "Surpassed 50,000 active investors", highlight: false },
  { year: "2024", event: "Achieved $2B+ in total assets managed", highlight: true },
];

// Plan gradient colors based on tier index
const planColors = [
  "from-slate-500 to-slate-600",
  "from-primary to-blue-600", 
  "from-amber-500 to-orange-600",
  "from-purple-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
];

// Plan features based on tier (index)
const tierFeatures = [
  ["Daily profit accrual", "No lock-in period", "Email support"],
  ["Daily profit accrual", "Priority withdrawals", "Phone support", "Personal advisor"],
  ["Daily profit accrual", "Instant withdrawals", "24/7 VIP support", "Dedicated manager"],
  ["Daily profit accrual", "Instant withdrawals", "Private banking", "Wealth management", "Tax optimization"],
  ["Daily profit accrual", "Instant withdrawals", "Concierge service", "Custom strategies", "Priority support"],
  ["All Premium features", "Exclusive opportunities", "VIP events access"],
];

const faqs = [
  {
    question: "How do I get started?",
    answer: "Simply create a free account, complete verification, and make your first deposit. You can start investing with as little as $500.",
  },
  {
    question: "How are returns calculated?",
    answer: "Returns are calculated daily based on your investment plan's ROI percentage. Profits are credited to your account and can be withdrawn or reinvested.",
  },
  {
    question: "Is my investment secure?",
    answer: "Yes. We use bank-grade encryption, cold storage for digital assets, and are fully licensed and regulated. Your funds are protected by our insurance policy.",
  },
  {
    question: "How long does withdrawal take?",
    answer: "Standard withdrawals are processed within 24 hours. Premium and Elite plan holders enjoy instant withdrawals to verified accounts.",
  },
  {
    question: "What markets do you invest in?",
    answer: "We invest across global equities, forex, commodities, and cryptocurrency markets using diversified strategies managed by experienced professionals.",
  },
  {
    question: "Can I track my investments in real-time?",
    answer: "Yes, our platform provides real-time portfolio tracking, detailed analytics, and comprehensive reporting through your personal dashboard.",
  },
];

const testimonials = [
  {
    name: "Michael Chen",
    role: "Private Investor",
    quote: "This platform has transformed how I approach investing. The returns have been consistent and the platform is incredibly professional.",
    returns: "+18.5%",
  },
  {
    name: "Sarah Williams",
    role: "Business Owner",
    quote: "The dedicated support team and transparent reporting give me complete confidence in my investments. Highly recommended.",
    returns: "+22.3%",
  },
  {
    name: "David Park",
    role: "Retired Executive",
    quote: "After trying several platforms, this one stands out for its reliability and consistent performance. My portfolio has grown significantly.",
    returns: "+15.8%",
  },
];

export function HomepageContent({ settings, plans }: HomepageContentProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Mark the most popular plan (second tier or middle plan)
  const popularPlanIndex = plans.length > 1 ? 1 : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const theme = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "dark";
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationId: number;
    const checkTime = () => {
      if (video.duration && video.currentTime >= video.duration - 4) {
        video.currentTime = 0;
        video.play();
      }
      animationId = requestAnimationFrame(checkTime);
    };

    animationId = requestAnimationFrame(checkTime);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
      {/* Hero Section with Background Video */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover bg-black"
          >
            <source src="/bg-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 z-1 opacity-15">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="max-w-xl">
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90 mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                  </span>
                  Live Trading · Markets Open
                </div>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                  Invest with
                  <span className="block text-primary">confidence.</span>
                </h1>
              </FadeIn>
              
              <FadeIn delay={0.3}>
                <p className="mt-6 text-lg text-white/80 leading-relaxed lg:text-xl">
                  A professional investment platform built for serious investors. 
                  Access global markets, transparent returns, and institutional-grade security.
                </p>
              </FadeIn>
              
              <FadeIn delay={0.4}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                      Register
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8 border-white/30 text-white hover:bg-white/10">
                      Login
                    </Button>
                  </Link>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.5}>
                <div className="mt-8 flex items-center gap-6 text-sm text-white/60">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    No minimum lock-in
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    Instant withdrawals
                  </span>
                </div>
              </FadeIn>
            </div>
            
            {/* Stats Cards */}
            <div className="hidden lg:block">
              <FadeIn delay={0.6} direction="left">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <ScaleOnHover key={index}>
                      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 transition-all hover:bg-white/10 hover:border-white/20">
                        <p className="font-heading text-3xl font-bold text-white">
                          {stat.prefix}
                          <Counter to={stat.value} duration={2} />
                          {stat.suffix}
                        </p>
                        <p className="mt-1 text-sm text-white/60">{stat.label}</p>
                      </div>
                    </ScaleOnHover>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <Floating duration={2} distance={8}>
            <div className="flex flex-col items-center gap-2 text-white/40">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-px h-8 bg-linear-to-b from-white/40 to-transparent" />
            </div>
          </Floating>
        </div>
      </section>

      {/* Ticker Tape */}
      <section className="border-y border-border bg-surface py-2">
        {mounted && <TickerTape theme={theme} />}
      </section>

      {/* Trust Indicators */}
      <section className="py-12 lg:py-16 bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm text-text-muted">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">SSL Encrypted</span>
              </span>
              <span className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-medium">Licensed & Regulated</span>
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">50,000+ Investors</span>
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-medium">45+ Countries</span>
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Since 2019</span>
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Live Markets Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">Live Markets</p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                Trade global markets in real-time
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                Access stocks, forex, crypto, and commodities from a single platform.
              </p>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              {mounted && <MarketOverview theme={theme} />}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section with Images */}
      <section className="py-16 lg:py-24 bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">Why Choose Us</p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                Built for serious investors
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                Everything you need to grow your wealth with confidence.
              </p>
            </div>
          </FadeIn>
          
          <StaggerContainer staggerDelay={0.1} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <ScaleOnHover scale={1.03}>
                  <div className="group relative rounded-2xl border border-border bg-surface overflow-hidden h-full">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/50 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                          <feature.icon className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-lg font-semibold text-text-primary">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </ScaleOnHover>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Highlights Section with Image */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <SlideIn direction="left">
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden">
                  <Image
                    src="/images/trading-screens.jpg"
                    alt="Professional trading environment"
                    width={600}
                    height={500}
                    className="object-cover w-full"
                  />
                  <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent" />
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -right-6 lg:-right-12 rounded-xl border border-border bg-surface p-6 shadow-xl">
                  <p className="text-sm text-text-muted">Average Annual Return</p>
                  <p className="font-heading text-3xl font-bold text-success">+16.8%</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-success">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+2.3% this month</span>
                  </div>
                </div>
              </div>
            </SlideIn>
            
            <SlideIn direction="right">
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wide">Our Advantage</p>
                <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                  Why investors choose us
                </h2>
                <p className="mt-4 text-lg text-text-secondary">
                  We combine institutional-grade infrastructure with a user-friendly 
                  experience to deliver consistent results.
                </p>
                
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {highlights.map((item, index) => (
                    <FadeIn key={index} delay={index * 0.1}>
                      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface hover:border-primary/30 transition-colors">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm text-text-secondary leading-relaxed pt-2">
                          {item.text}
                        </span>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 lg:py-24 bg-surface-muted scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <FadeIn>
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wide">About Us</p>
                <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                  Building the future of investing
                </h2>
                <p className="mt-6 text-lg text-text-secondary leading-relaxed">
                  {settings.siteName} was founded in 2019 with a simple mission: to make 
                  professional-grade investing accessible to everyone. We combine 
                  institutional expertise with cutting-edge technology to deliver 
                  consistent, transparent returns.
                </p>
                
                <div className="mt-8 relative rounded-2xl overflow-hidden">
                  <Image
                    src="/images/business-team.jpg"
                    alt="Our professional team"
                    width={600}
                    height={400}
                    className="object-cover w-full"
                  />
                </div>
                
                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl border border-border bg-surface">
                    <p className="font-heading text-2xl font-bold text-primary">
                      <Counter to={45} suffix="+" />
                    </p>
                    <p className="mt-1 text-xs text-text-muted">Countries</p>
                  </div>
                  <div className="text-center p-4 rounded-xl border border-border bg-surface">
                    <p className="font-heading text-2xl font-bold text-primary">
                      $<Counter to={847} suffix="M" />
                    </p>
                    <p className="mt-1 text-xs text-text-muted">Payouts</p>
                  </div>
                  <div className="text-center p-4 rounded-xl border border-border bg-surface">
                    <p className="font-heading text-2xl font-bold text-primary">
                      <Counter to={98} suffix="%" />
                    </p>
                    <p className="mt-1 text-xs text-text-muted">Satisfaction</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <div className="space-y-8">
              <FadeIn delay={0.2}>
                <h3 className="font-heading text-xl font-semibold text-text-primary">Our Values</h3>
                <StaggerContainer staggerDelay={0.1} className="grid gap-4 sm:grid-cols-2">
                  {values.map((value, index) => (
                    <StaggerItem key={index}>
                      <ScaleOnHover>
                        <div className="rounded-xl border border-border bg-surface p-5 h-full">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <value.icon className="h-5 w-5" />
                          </div>
                          <h4 className="mt-3 font-heading font-semibold text-text-primary">
                            {value.title}
                          </h4>
                          <p className="mt-1 text-sm text-text-secondary">
                            {value.description}
                          </p>
                        </div>
                      </ScaleOnHover>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </FadeIn>
              
              {/* Timeline */}
              <FadeIn delay={0.4}>
                <h3 className="font-heading text-xl font-semibold text-text-primary mb-6">Our Journey</h3>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 items-start p-3 rounded-lg transition-colors ${
                        milestone.highlight ? "bg-primary/5 border border-primary/20" : ""
                      }`}
                    >
                      <div className="shrink-0 w-14 text-right">
                        <span className={`font-heading text-lg font-bold ${
                          milestone.highlight ? "text-primary" : "text-text-muted"
                        }`}>
                          {milestone.year}
                        </span>
                      </div>
                      <div className="shrink-0 w-px bg-border relative">
                        <div className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${
                          milestone.highlight ? "bg-primary" : "bg-text-muted"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-text-secondary text-sm">{milestone.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-16 lg:py-24 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">Investment Plans</p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                Choose your investment plan
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                Select a plan that matches your investment goals. All plans include 
                daily profit accrual and flexible withdrawal options.
              </p>
            </div>
          </FadeIn>
          
          {plans.length > 0 ? (
            <StaggerContainer staggerDelay={0.1} className={`grid gap-6 sm:grid-cols-2 ${plans.length >= 4 ? 'lg:grid-cols-4' : plans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
              {plans.map((plan, index) => {
                const isPopular = index === popularPlanIndex;
                const color = planColors[index % planColors.length];
                const features = tierFeatures[Math.min(index, tierFeatures.length - 1)];
                
                return (
                  <StaggerItem key={plan.id}>
                    <ScaleOnHover scale={1.02}>
                      <div
                        className={`relative rounded-2xl border bg-surface overflow-hidden h-full flex flex-col ${
                          isPopular 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-border"
                        }`}
                      >
                        {/* Header with gradient */}
                        <div className={`relative h-24 bg-linear-to-br ${color}`}>
                          {isPopular && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
                                Most Popular
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-surface to-transparent" />
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col -mt-6 relative">
                          <div className="text-center">
                            <h3 className="font-heading text-xl font-bold text-text-primary">
                              {plan.name}
                            </h3>
                            <p className="mt-4 font-heading text-4xl font-bold text-success">
                              {plan.roiPercentage}%
                            </p>
                            <p className="text-sm text-text-muted">ROI per cycle</p>
                            <p className="mt-1 text-sm text-text-secondary">
                              {plan.durationDays} days duration
                            </p>
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs text-text-muted uppercase tracking-wide">Investment Range</p>
                            <p className="font-heading font-semibold text-text-primary">
                              ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}
                            </p>
                          </div>
                          
                          <ul className="mt-6 space-y-3 flex-1">
                            {features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                <span className="text-text-secondary">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="mt-6">
                            <Link href="/register">
                              <Button 
                                className="w-full" 
                                variant={isPopular ? "default" : "outline"}
                                size="lg"
                              >
                                Get Started
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </ScaleOnHover>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12 rounded-2xl border border-border bg-surface">
              <p className="text-text-muted">No investment plans available at the moment.</p>
              <p className="mt-2 text-sm text-text-secondary">Please check back later.</p>
            </div>
          )}
          
          {/* Mini Charts */}
          <FadeIn delay={0.3}>
            <div className="mt-12 lg:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {mounted && (
                <>
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <MiniChart symbol="BITSTAMP:BTCUSD" theme={theme} height={180} />
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <MiniChart symbol="BITSTAMP:ETHUSD" theme={theme} height={180} />
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <MiniChart symbol="FX:EURUSD" theme={theme} height={180} />
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <MiniChart symbol="FOREXCOM:SPXUSD" theme={theme} height={180} />
                  </div>
                </>
              )}
            </div>
          </FadeIn>
          
          {/* Risk Warning */}
          <FadeIn delay={0.4}>
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-5">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary">
                <strong className="text-text-primary">Risk Disclosure:</strong> All investments 
                carry risk. Past performance does not guarantee future results. Only invest 
                what you can afford to lose. Please read our full{" "}
                <Link href="/legal" className="text-primary hover:underline">
                  risk disclosure
                </Link>{" "}
                before investing.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">Testimonials</p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                Trusted by investors worldwide
              </h2>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="relative max-w-3xl mx-auto">
              <div className="rounded-2xl border border-border bg-surface p-8 lg:p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="font-heading text-2xl font-bold">
                      {testimonials[activeTestimonial].name.charAt(0)}
                    </span>
                  </div>
                </div>
                
                <blockquote className="text-xl lg:text-2xl text-text-primary leading-relaxed italic">
                  "{testimonials[activeTestimonial].quote}"
                </blockquote>
                
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="font-heading font-semibold text-text-primary">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-sm text-text-muted">
                    {testimonials[activeTestimonial].role}
                  </p>
                  <div className="mt-2 rounded-full bg-success/10 px-4 py-1.5">
                    <span className="font-heading font-bold text-success">
                      {testimonials[activeTestimonial].returns} returns
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeTestimonial 
                        ? "w-8 bg-primary" 
                        : "bg-text-muted/30 hover:bg-text-muted/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">FAQ</p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                Everything you need to know about investing with {settings.siteName}.
              </p>
            </div>
          </FadeIn>
          
          <div className="max-w-3xl mx-auto">
            <StaggerContainer staggerDelay={0.1} className="divide-y divide-border">
              {faqs.map((faq, index) => (
                <StaggerItem key={index}>
                  <div className="py-6">
                    <h3 className="font-heading font-semibold text-text-primary text-lg">
                      {faq.question}
                    </h3>
                    <p className="mt-3 text-text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 lg:py-24 bg-surface-muted scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <SlideIn direction="left">
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wide">Contact Us</p>
                <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                  Get in touch
                </h2>
                <p className="mt-4 text-lg text-text-secondary">
                  Have questions? Our team is here to help. Reach out through any of 
                  the channels below or fill out the contact form.
                </p>
                
                <div className="mt-8 space-y-6">
                  <ScaleOnHover>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Email</p>
                        <a href={`mailto:${settings.supportEmail}`} className="text-text-secondary hover:text-primary transition-colors">
                          {settings.supportEmail}
                        </a>
                      </div>
                    </div>
                  </ScaleOnHover>
                  
                  <ScaleOnHover>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Phone</p>
                        <a href={`tel:${settings.supportPhone.replace(/[^+\d]/g, '')}`} className="text-text-secondary hover:text-primary transition-colors">
                          {settings.supportPhone}
                        </a>
                        <p className="text-sm text-text-muted">Mon-Fri, 9am-6pm EST</p>
                      </div>
                    </div>
                  </ScaleOnHover>
                  
                  <ScaleOnHover>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Office</p>
                        <p className="text-text-secondary">
                          {settings.address}
                        </p>
                      </div>
                    </div>
                  </ScaleOnHover>
                  
                  <ScaleOnHover>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Live Chat</p>
                        <p className="text-text-secondary">Available 24/7 for Premium members</p>
                      </div>
                    </div>
                  </ScaleOnHover>
                </div>
              </div>
            </SlideIn>
            
            <SlideIn direction="right">
              <div className="rounded-2xl border border-border bg-surface p-6 lg:p-8">
                <h3 className="font-heading text-xl font-semibold text-text-primary">
                  Send us a message
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
                
                <form className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-text-primary mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-text-primary mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-text-primary mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="contact-subject"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="How can we help?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-text-primary mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  
                  <Button type="submit" className="w-full h-12 text-base">
                    Send Message
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/office-building.jpg"
            alt="Modern office building"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Ready to start investing?
              </h2>
              <p className="mt-6 text-xl text-white/80">
                Join thousands of investors who trust {settings.siteName} for their 
                financial growth. Get started in minutes.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base h-14 px-10">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-14 px-10 border-white/30 text-white hover:bg-white/10">
                    Talk to an Advisor
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-white/50">
                No credit card required · Free account setup · Start with $500
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
