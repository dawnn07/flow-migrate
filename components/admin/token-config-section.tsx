import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface TokenConfig {
  coinType: string;
  symbol: string;
  decimals: string;
}

interface TokenConfigSectionProps {
  oldToken: TokenConfig;
  newToken: TokenConfig;
  onOldTokenChange: (field: keyof TokenConfig, value: string) => void;
  onNewTokenChange: (field: keyof TokenConfig, value: string) => void;
}

export function TokenConfigSection({
  oldToken,
  newToken,
  onOldTokenChange,
  onNewTokenChange,
}: TokenConfigSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Token Configuration</h3>
        <Separator className="mb-6" />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-cyan-400">OLD Token</h4>

        <div className="space-y-2">
          <Label htmlFor="old-coin-type">Coin Type</Label>
          <Input
            id="old-coin-type"
            placeholder="0x2::sui::SUI"
            value={oldToken.coinType}
            onChange={(e) => onOldTokenChange("coinType", e.target.value)}
            className="bg-secondary/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="old-symbol">Symbol</Label>
            <Input
              id="old-symbol"
              placeholder="OLD"
              value={oldToken.symbol}
              onChange={(e) => onOldTokenChange("symbol", e.target.value)}
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="old-decimals">Decimals</Label>
            <Input
              id="old-decimals"
              type="number"
              placeholder="9"
              value={oldToken.decimals}
              onChange={(e) => onOldTokenChange("decimals", e.target.value)}
              className="bg-secondary/50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-cyan-400">NEW Token</h4>

        <div className="space-y-2">
          <Label htmlFor="new-coin-type">Coin Type</Label>
          <Input
            id="new-coin-type"
            placeholder="0x2::sui::SUI"
            value={newToken.coinType}
            onChange={(e) => onNewTokenChange("coinType", e.target.value)}
            className="bg-secondary/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-symbol">Symbol</Label>
            <Input
              id="new-symbol"
              placeholder="NEW"
              value={newToken.symbol}
              onChange={(e) => onNewTokenChange("symbol", e.target.value)}
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-decimals">Decimals</Label>
            <Input
              id="new-decimals"
              type="number"
              placeholder="9"
              value={newToken.decimals}
              onChange={(e) => onNewTokenChange("decimals", e.target.value)}
              className="bg-secondary/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
