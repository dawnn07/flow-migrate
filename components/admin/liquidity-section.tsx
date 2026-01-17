import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface LiquidityData {
  newTokenAmount: string;
  quoteTokenAmount: string;
  lpLockDuration: string;
}

interface LiquiditySectionProps {
  data: LiquidityData;
  onChange: (field: keyof LiquidityData, value: string) => void;
}

export function LiquiditySection({ data, onChange }: LiquiditySectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Liquidity Bootstrap (Cetus)</h3>
        <Separator className="mb-6" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="new-token-liq">Initial NEW Token Liquidity</Label>
          <Input
            id="new-token-liq"
            type="number"
            placeholder="1000000"
            value={data.newTokenAmount}
            onChange={(e) => onChange("newTokenAmount", e.target.value)}
            className="bg-secondary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quote-token-liq">Initial Quote Token Liquidity</Label>
          <Input
            id="quote-token-liq"
            type="number"
            placeholder="50000"
            value={data.quoteTokenAmount}
            onChange={(e) => onChange("quoteTokenAmount", e.target.value)}
            className="bg-secondary/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lp-lock">LP Lock Duration (days)</Label>
        <Input
          id="lp-lock"
          type="number"
          placeholder="30"
          value={data.lpLockDuration}
          onChange={(e) => onChange("lpLockDuration", e.target.value)}
          className="bg-secondary/50"
        />
      </div>
    </div>
  );
}
