import { Shield, Target, Eye, AlertTriangle } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "We prioritize the protection of your assets above all else, employing bank-grade security measures and regular third-party audits.",
  },
  {
    icon: Target,
    title: "Transparency",
    description: "Clear communication about fees, risks, and performance. No hidden costs, no surprises.",
  },
  {
    icon: Eye,
    title: "Accountability",
    description: "We take responsibility for our recommendations and maintain open channels for feedback and concerns.",
  },
];

const milestones = [
  { year: "2019", event: "Company founded with a focus on accessible investment solutions" },
  { year: "2020", event: "Reached $100M in assets under management" },
  { year: "2021", event: "Expanded to serve clients in 45+ countries" },
  { year: "2022", event: "Launched cryptocurrency investment options" },
  { year: "2023", event: "Surpassed 50,000 active investors" },
  { year: "2024", event: "Achieved $2B+ in total assets under management" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              About Standard Broker
            </h1>
            <p className="mt-6 text-xl text-text-secondary leading-relaxed">
              We are a professional investment platform committed to helping individuals 
              grow their wealth through disciplined, transparent, and secure investment strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
                Our Story
              </h2>
              <div className="mt-6 space-y-4 text-text-secondary leading-relaxed">
                <p>
                  Standard Broker was founded in 2019 by a team of financial professionals 
                  who saw a gap in the market: quality investment services were largely 
                  inaccessible to everyday investors.
                </p>
                <p>
                  We set out to change that by building a platform that combines 
                  institutional-grade investment strategies with a straightforward, 
                  user-friendly experience.
                </p>
                <p>
                  Today, we serve over 50,000 investors across 45+ countries, managing 
                  more than $2 billion in assets. Our growth is a testament to our 
                  commitment to delivering consistent results while maintaining the 
                  highest standards of security and transparency.
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
                Our Approach
              </h2>
              <div className="mt-6 space-y-4 text-text-secondary leading-relaxed">
                <p>
                  We employ a diversified investment strategy that balances risk and 
                  reward across multiple asset classes. Our team of experienced analysts 
                  continuously monitors market conditions to optimize portfolio performance.
                </p>
                <p>
                  Unlike many platforms that promise unrealistic returns, we focus on 
                  sustainable growth. Our target returns of 12-18% annually reflect a 
                  realistic assessment of what disciplined investing can achieve.
                </p>
                <p>
                  Every investment decision is backed by rigorous research and risk 
                  assessment. We believe that informed investors make better decisions, 
                  which is why we provide detailed reporting and educational resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24 bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="rounded-xl border border-border bg-surface p-8 lg:p-10">
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                Our Mission
              </h2>
              <p className="mt-4 text-text-secondary leading-relaxed">
                To democratize access to professional investment management, enabling 
                individuals from all backgrounds to build long-term wealth through 
                transparent, secure, and disciplined investment strategies.
              </p>
            </div>
            
            <div className="rounded-xl border border-border bg-surface p-8 lg:p-10">
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                Our Vision
              </h2>
              <p className="mt-4 text-text-secondary leading-relaxed">
                To become the most trusted investment platform globally, known for 
                our unwavering commitment to investor success, operational excellence, 
                and ethical business practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Our Core Values
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              The principles that guide every decision we make.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((value, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-surface p-6 lg:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-text-primary">
                  {value.title}
                </h3>
                <p className="mt-3 text-text-secondary leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24 bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Our Journey
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Key milestones in our growth story.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start"
                >
                  <div className="shrink-0 w-16 text-right">
                    <span className="font-heading text-lg font-bold text-primary">
                      {milestone.year}
                    </span>
                  </div>
                  <div className="shrink-0 w-px bg-border relative">
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-text-secondary">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-8 lg:p-10">
            <div className="flex gap-4">
              <div className="shrink-0">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-text-primary">
                  Risk Disclosure
                </h2>
                <div className="mt-4 space-y-3 text-text-secondary text-sm leading-relaxed">
                  <p>
                    All investments carry risk. The value of your investment can go down 
                    as well as up, and you may receive less than you originally invested. 
                    Past performance is not a reliable indicator of future results.
                  </p>
                  <p>
                    The returns mentioned on this website are targets based on historical 
                    performance and market analysis. They are not guaranteed and actual 
                    results may vary significantly.
                  </p>
                  <p>
                    Before investing, please ensure you understand the risks involved and 
                    consider seeking independent financial advice. Only invest money you 
                    can afford to lose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
