"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TokenConfigSection } from "./token-config-section";
import { SnapshotSection } from "./snapshot-section";
import { LiquiditySection } from "./liquidity-section";
import { PreviewDialog } from "./preview-dialog";
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

export function CreateMigrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [metadata, setMetadata] = useState({
    name: "",
    slug: "",
    description: "",
    iconUrl: "",
  });

  const [oldToken, setOldToken] = useState({
    coinType: "",
    symbol: "",
    decimals: "",
  });

  const [newToken, setNewToken] = useState({
    coinType: "",
    symbol: "",
    decimals: "",
  });

  const [snapshot, setSnapshot] = useState({
    oldTotalSupply: "",
    marketCap: "",
    quoteToken: "SUI",
    newTotalSupply: "",
  });

  const [liquidity, setLiquidity] = useState({
    newTokenAmount: "",
    quoteTokenAmount: "",
    lpLockDuration: "30",
  });

  const [migrationWindow, setMigrationWindow] = useState({
    startTime: "",
    endTime: "",
  });

  const handleMetadataChange = (field: keyof typeof metadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && !metadata.slug) {
      setMetadata((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/\s+/g, "-"),
      }));
    }
  };

  const handleOldTokenChange = (field: keyof typeof oldToken, value: string) => {
    setOldToken((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewTokenChange = (field: keyof typeof newToken, value: string) => {
    setNewToken((prev) => ({ ...prev, [field]: value }));
  };

  const handleSnapshotChange = (field: keyof typeof snapshot, value: string) => {
    setSnapshot((prev) => ({ ...prev, [field]: value }));
  };

  const handleLiquidityChange = (field: keyof typeof liquidity, value: string) => {
    setLiquidity((prev) => ({ ...prev, [field]: value }));
  };

  const handleMigrationWindowChange = (field: keyof typeof migrationWindow, value: string) => {
    setMigrationWindow((prev) => ({ ...prev, [field]: value }));
  };

  const getFormData = () => ({
    metadata,
    oldToken,
    newToken,
    snapshot,
    liquidity,
    migrationWindow,
    calculatedInitialPrice:
      parseFloat(snapshot.marketCap) / parseFloat(snapshot.newTotalSupply) || 0,
  });

  const isFormValid = () => {
    return (
      metadata.name &&
      metadata.slug &&
      oldToken.coinType &&
      oldToken.symbol &&
      oldToken.decimals &&
      newToken.coinType &&
      newToken.symbol &&
      newToken.decimals &&
      snapshot.oldTotalSupply &&
      snapshot.marketCap &&
      snapshot.newTotalSupply &&
      liquidity.newTokenAmount &&
      liquidity.quoteTokenAmount &&
      migrationWindow.startTime &&
      migrationWindow.endTime
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const formData = getFormData();
      console.log("Migration Project Config:", formData);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Migration project created successfully!");
    } catch (error) {
      toast.error("Failed to create migration project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="glassmorphism border-violet-500/20 max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create Migration Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Project Metadata</h3>
              <Separator className="mb-6" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Token Migration Alpha"
                value={metadata.name}
                onChange={(e) => handleMetadataChange("name", e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-slug">Project Slug / ID</Label>
              <Input
                id="project-slug"
                placeholder="token-migration-alpha"
                value={metadata.slug}
                onChange={(e) => handleMetadataChange("slug", e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                placeholder="Describe the migration project..."
                value={metadata.description}
                onChange={(e) => handleMetadataChange("description", e.target.value)}
                className="bg-secondary/50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon-url">Token Icon URL</Label>
              <Input
                id="icon-url"
                placeholder="https://..."
                value={metadata.iconUrl}
                onChange={(e) => handleMetadataChange("iconUrl", e.target.value)}
                className="bg-secondary/50"
              />
            </div>
          </div>

          <TokenConfigSection
            oldToken={oldToken}
            newToken={newToken}
            onOldTokenChange={handleOldTokenChange}
            onNewTokenChange={handleNewTokenChange}
          />

          <SnapshotSection data={snapshot} onChange={handleSnapshotChange} />

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Migration Window</h3>
              <Separator className="mb-6" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={migrationWindow.startTime}
                  onChange={(e) => handleMigrationWindowChange("startTime", e.target.value)}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={migrationWindow.endTime}
                  onChange={(e) => handleMigrationWindowChange("endTime", e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>
          </div>

          <LiquiditySection data={liquidity} onChange={handleLiquidityChange} />

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Config
            </Button>

            <Button
              className="flex-1 glow-cyan bg-cyan-600 hover:bg-cyan-700"
              onClick={handleSubmit}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Migration Project"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <PreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        data={getFormData()}
      />
    </>
  );
}
