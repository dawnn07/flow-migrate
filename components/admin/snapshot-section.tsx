import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SnapshotData {
  oldTotalSupply: string;
  marketCap: string;
  quoteToken: string;
  newTotalSupply: string;
}

interface SnapshotSectionProps {
  data: SnapshotData;
  onChange: (field: keyof SnapshotData, value: string) => void;
}

export function SnapshotSection({ data, onChange }: SnapshotSectionProps) {
  const calculateInitialPrice = () => {
    const mc = parseFloat(data.marketCap);
    const supply = parseFloat(data.newTotalSupply);
    if (isNaN(mc) || isNaN(supply) || supply === 0) return "0.00";
    return (mc / supply).toFixed(6);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Snapshot & Pricing</h3>
        <Separator className="mb-6" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="old-supply">Old Total Supply</Label>
          <Input
            id="old-supply"
            type="number"
            placeholder="10000000"
            value={data.oldTotalSupply}
            onChange={(e) => onChange("oldTotalSupply", e.target.value)}
            className="bg-secondary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-supply">New Total Supply</Label>
          <Input
            id="new-supply"
            type="number"
            placeholder="10000000"
            value={data.newTotalSupply}
            onChange={(e) => onChange("newTotalSupply", e.target.value)}
            className="bg-secondary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="market-cap">Market Cap</Label>
          <Input
            id="market-cap"
            type="number"
            placeholder="420000"
            value={data.marketCap}
            onChange={(e) => onChange("marketCap", e.target.value)}
            className="bg-secondary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quote-token">Quote Token</Label>
          <Select value={data.quoteToken} onValueChange={(value) => onChange("quoteToken", value)}>
            <SelectTrigger id="quote-token" className="bg-secondary/50">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUI">SUI</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Initial Price (calculated)</span>
          <span className="text-lg font-mono text-cyan-400">{calculateInitialPrice()} {data.quoteToken || "TOKEN"}</span>
        </div>
      </div>
    </div>
  );
}
