import Link from "next/link";

const footerLinks = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/plans", label: "Investment Plans" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/legal", label: "Terms of Service" },
    { href: "/legal#privacy", label: "Privacy Policy" },
    { href: "/legal#risk", label: "Risk Disclosure" },
  ],
  support: [
    { href: "/contact", label: "Help Center" },
    { href: "/contact", label: "Support" },
  ],
};

interface PublicFooterProps {
  siteName: string;
}

export function PublicFooter({ siteName }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">
                    {siteName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="font-heading text-lg font-semibold text-text-primary">
                  {siteName}
                </span>
              </Link>
              <p className="mt-4 text-sm text-text-secondary leading-relaxed max-w-xs">
                Professional investment platform with transparent returns and institutional-grade security.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Company</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Legal</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Support</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-text-muted">
              © {currentYear} {siteName}. All rights reserved.
            </p>
            <p className="text-xs text-text-muted max-w-md text-center sm:text-right">
              Investment involves risk. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
