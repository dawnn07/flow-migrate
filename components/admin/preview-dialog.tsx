"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
}

export function PreviewDialog({ open, onOpenChange, data }: PreviewDialogProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("Copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glassmorphism">
        <DialogHeader>
          <DialogTitle>Migration Config Preview</DialogTitle>
          <DialogDescription>
            Review the configuration before creating the migration project.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
