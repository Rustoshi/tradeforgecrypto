"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Delete, Check } from "lucide-react";

interface PinNumpadProps {
  length?: number;
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  error?: string;
  loading?: boolean;
  showConfirmButton?: boolean;
}

export function PinNumpad({
  length = 4,
  onComplete,
  onCancel,
  title = "Enter PIN",
  subtitle = "Enter your 4-digit transaction PIN",
  error,
  loading = false,
  showConfirmButton = false,
}: PinNumpadProps) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  // Trigger shake animation on error
  useEffect(() => {
    if (error) {
      setShake(true);
      setPin("");
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleNumberPress = useCallback((num: string) => {
    if (loading) return;
    if (pin.length < length) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-submit when PIN is complete (if no confirm button)
      if (!showConfirmButton && newPin.length === length) {
        setTimeout(() => onComplete(newPin), 150);
      }
    }
  }, [pin, length, onComplete, loading, showConfirmButton]);

  const handleDelete = useCallback(() => {
    if (loading) return;
    setPin(prev => prev.slice(0, -1));
  }, [loading]);

  const handleConfirm = useCallback(() => {
    if (pin.length === length && !loading) {
      onComplete(pin);
    }
  }, [pin, length, onComplete, loading]);

  const handleClear = useCallback(() => {
    if (loading) return;
    setPin("");
  }, [loading]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return;
      
      if (e.key >= "0" && e.key <= "9") {
        handleNumberPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Enter" && pin.length === length) {
        onComplete(pin);
      } else if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNumberPress, handleDelete, onComplete, onCancel, pin, length, loading]);

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-muted mt-1">{subtitle}</p>
      </div>

      {/* PIN Dots */}
      <div 
        className={cn(
          "flex gap-4 mb-8 transition-transform",
          shake && "animate-shake"
        )}
      >
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-150",
              i < pin.length
                ? "bg-primary border-primary scale-110"
                : "bg-transparent border-border",
              error && "border-destructive"
            )}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive mb-4 text-center animate-fade-in">
          {error}
        </p>
      )}

      {/* Numpad Grid */}
      <div className="grid grid-cols-3 gap-3 max-w-[280px]">
        {numbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleNumberPress(num)}
            disabled={loading}
            className={cn(
              "w-20 h-16 rounded-xl text-2xl font-semibold",
              "bg-surface hover:bg-surface-muted active:bg-primary/10",
              "border border-border hover:border-primary/50",
              "text-text-primary transition-all duration-150",
              "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            {num}
          </button>
        ))}

        {/* Bottom Row: Clear, 0, Delete/Confirm */}
        <button
          type="button"
          onClick={handleClear}
          disabled={loading || pin.length === 0}
          className={cn(
            "w-20 h-16 rounded-xl text-sm font-medium",
            "bg-surface hover:bg-surface-muted active:bg-destructive/10",
            "border border-border hover:border-destructive/50",
            "text-text-muted hover:text-destructive transition-all duration-150",
            "active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-destructive/50"
          )}
        >
          Clear
        </button>

        <button
          type="button"
          onClick={() => handleNumberPress("0")}
          disabled={loading}
          className={cn(
            "w-20 h-16 rounded-xl text-2xl font-semibold",
            "bg-surface hover:bg-surface-muted active:bg-primary/10",
            "border border-border hover:border-primary/50",
            "text-text-primary transition-all duration-150",
            "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
        >
          0
        </button>

        {showConfirmButton ? (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || pin.length !== length}
            className={cn(
              "w-20 h-16 rounded-xl flex items-center justify-center",
              "bg-primary hover:bg-primary/90 active:bg-primary/80",
              "border border-primary",
              "text-primary-foreground transition-all duration-150",
              "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Check className="w-6 h-6" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className={cn(
              "w-20 h-16 rounded-xl flex items-center justify-center",
              "bg-surface hover:bg-surface-muted active:bg-destructive/10",
              "border border-border hover:border-destructive/50",
              "text-text-muted hover:text-destructive transition-all duration-150",
              "active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-destructive/50"
            )}
          >
            <Delete className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="mt-6 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Set PIN component with confirmation
interface SetPinProps {
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
}

export function SetPinNumpad({ onComplete, onCancel, loading, error }: SetPinProps) {
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleFirstPin = (pin: string) => {
    setFirstPin(pin);
    setStep("confirm");
    setConfirmError("");
  };

  const handleConfirmPin = (pin: string) => {
    if (pin === firstPin) {
      onComplete(pin);
    } else {
      setConfirmError("PINs do not match. Please try again.");
      setStep("enter");
      setFirstPin("");
    }
  };

  const handleCancel = () => {
    if (step === "confirm") {
      setStep("enter");
      setFirstPin("");
      setConfirmError("");
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <PinNumpad
      onComplete={step === "enter" ? handleFirstPin : handleConfirmPin}
      onCancel={handleCancel}
      title={step === "enter" ? "Create PIN" : "Confirm PIN"}
      subtitle={step === "enter" ? "Enter a 4-digit PIN" : "Re-enter your PIN to confirm"}
      error={error || confirmError}
      loading={loading}
      showConfirmButton
    />
  );
}
