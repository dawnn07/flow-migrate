"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TokenInputProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  tokenSymbol: string;
  balance?: string;
  readOnly?: boolean;
  onMax?: () => void;
}

export function TokenInput({
  label,
  value,
  onChange,
  tokenSymbol,
  balance,
  readOnly = false,
  onMax,
}: TokenInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        {balance && (
          <span className="text-xs text-muted-foreground">Balance: {balance}</span>
        )}
      </div>
      <div className="relative">
        <Input
          type="number"
          placeholder="0.0"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          className="bg-secondary/50 border-border text-lg h-14 pr-24"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {onMax && !readOnly && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onMax}
              className="text-cyan-400 hover:text-cyan-300 h-8"
            >
              MAX
            </Button>
          )}
          <div className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-cyan-500" />
            <span className="font-medium text-sm">{tokenSymbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
