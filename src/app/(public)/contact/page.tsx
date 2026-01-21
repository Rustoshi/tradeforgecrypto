"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "support@standardbroker.com",
    description: "We respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
    description: "Mon-Fri, 9am-6pm EST",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "350 Fifth Avenue, Suite 4200",
    description: "New York, NY 10118",
  },
  {
    icon: Clock,
    title: "Business Hours",
    value: "Monday - Friday",
    description: "9:00 AM - 6:00 PM EST",
  },
];

interface FormState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ status: "loading", message: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    // Client-side validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      setFormState({
        status: "error",
        message: "Please fill in all fields.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setFormState({
        status: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }

      setFormState({
        status: "success",
        message: "Thank you for your message. We'll get back to you within 24 hours.",
      });

      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-6 text-xl text-text-secondary leading-relaxed">
              Have questions about our platform or investment plans? 
              Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Contact Information */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                Get in Touch
              </h2>
              <p className="mt-4 text-text-secondary">
                Reach out through any of the channels below, or fill out the 
                contact form and we&apos;ll respond within 24 hours.
              </p>
              
              <div className="mt-8 space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{item.title}</p>
                      <p className="text-text-secondary">{item.value}</p>
                      <p className="text-sm text-text-muted">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-border bg-surface p-6 lg:p-8">
                <h2 className="font-heading text-xl font-semibold text-text-primary">
                  Send us a Message
                </h2>
                
                {formState.status === "success" ? (
                  <div className="mt-6 flex items-start gap-3 rounded-lg bg-success/10 p-4">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-success">Message Sent</p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {formState.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {formState.status === "error" && (
                      <div className="flex items-start gap-3 rounded-lg bg-error/10 p-4">
                        <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                        <p className="text-sm text-error">{formState.message}</p>
                      </div>
                    )}
                    
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="h-11"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="How can we help?"
                        required
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Tell us more about your inquiry..."
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={formState.status === "loading"}
                    >
                      {formState.status === "loading" ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 lg:py-24 bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-text-secondary">
              Find quick answers to common questions about our platform, 
              investment process, and account management.
            </p>
            
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="font-medium text-text-primary text-sm">
                  How do I get started?
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Create an account, verify your identity, and make your first deposit 
                  to start investing.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="font-medium text-text-primary text-sm">
                  What is the minimum investment?
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Our Starter plan begins at $500. Higher tiers offer enhanced 
                  returns and features.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="font-medium text-text-primary text-sm">
                  How do withdrawals work?
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Request withdrawals anytime. Processing time depends on your 
                  account tier and payment method.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="font-medium text-text-primary text-sm">
                  Is my investment secure?
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  We use bank-grade security, cold storage for digital assets, 
                  and regular third-party audits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
