'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function SnapshotForm() {
  const [coinType, setCoinType] = useState('');
  const [newTokenName, setNewTokenName] = useState('');
  const [oldTokenName, setOldTokenName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ holderCount: number; snapshotId: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/snapshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coinType, newTokenName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch snapshot');
      }

      setResult({
        holderCount: data.holderCount,
        snapshotId: data.snapshotId,
      });
      toast.success('Snapshot created successfully!');

      // Optional: Redirect to admin page after a delay or show a success message with link
      // For now, let's just show the result and maybe a button to go back
      // Or auto-redirect:
      setTimeout(() => router.push('/admin/migrations'), 2000);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200 ml-1">Original Coin Type</label>
          <Input
            placeholder="0x...::module::TOKEN"
            value={coinType}
            onChange={(e) => setCoinType(e.target.value)}
            disabled={loading}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all h-12"
          />
          <p className="text-xs text-muted-foreground ml-1">
            Format: 0xPACKAGE::MODULE::TOKEN
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200 ml-1">New Token Name <span className="text-muted-foreground font-normal">(Optional)</span></label>
          <Input
            placeholder="e.g. My New Token"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            disabled={loading}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all h-12"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] h-12 font-semibold text-base"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Scanning Blockchain...
            </>
          ) : (
            'Take Snapshot'
          )}
        </Button>
      </form>

      {result && (
        <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-300">Snapshot Successful!</h3>
              <p className="text-sm text-green-400/80 mt-1">
                Successfully indexed <span className="font-bold text-green-300 text-base">{result.holderCount.toLocaleString()}</span> unique holders.
              </p>
            </div>
            <div className="w-full bg-black/20 rounded-lg p-3 border border-green-500/10">
              <p className="text-xs text-muted-foreground font-mono break-all select-all">
                ID: {result.snapshotId}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-green-500/30 hover:bg-green-500/10 text-green-400 hover:text-green-300 h-11"
              onClick={() => router.push('/admin/migrations')}
            >
              View in Admin Panel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
