'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Key, Plus, RotateCcw, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ApiKey {
  _id: string;
  name: string;
  prefix: string;
  lastUsedAt?: string;
  createdAt: string;
  revokedAt?: string;
  expiresAt?: string;
  isDefault?: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    if (status === 'authenticated') fetchApiKeys();
  }, [status]);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/api-keys', { credentials: 'include' });
      if (res.ok) setApiKeys(await res.json());
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('API key created', { description: data.key });
        fetchApiKeys();
        setNewKeyName('');
      } else {
        toast.error('Failed to create key');
      }
    } catch {
      toast.error('Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchApiKeys();
      toast.success('API key revoked');
    } catch {
      toast.error('Failed to revoke key');
    }
  };

  const handleRegenerate = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/api-keys/${id}/regenerate`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('API key regenerated', { description: data.key });
        fetchApiKeys();
      } else {
        toast.error('Failed to regenerate key');
      }
    } catch {
      toast.error('Failed to regenerate key');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/api-keys/${id}/default`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Default API key updated');
        fetchApiKeys();
      } else {
        toast.error('Failed to set default key');
      }
    } catch {
      toast.error('Failed to set default key');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) return <div className="flex h-[60vh] items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={session.user?.name || ''} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={session.user?.email || ''} disabled />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={session.user?.role || ''} disabled />
            </div>
            <div>
              <Label>Organization</Label>
              <Input value={session.user?.orgId || ''} disabled />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Key name"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !newKeyName.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Create
                </>
              )}
            </Button>
          </form>
          <div className="space-y-2">
            {apiKeys.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No API keys</p>
            ) : (
              apiKeys.map(key => (
                <div
                  key={key._id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg',
                    key.revokedAt && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Key className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{key.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {key.prefix}•••••••• •{' '}
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleDateString()
                          : 'Never used'}
                        {key.expiresAt && (
                          <> • Expires: {new Date(key.expiresAt).toLocaleDateString()}</>
                        )}
                        {key.revokedAt && (
                          <> • Revoked: {new Date(key.revokedAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                  {!key.revokedAt && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {key.isDefault ? (
                        <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full flex-shrink-0">
                          Default
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefault(key._id)}
                          title="Set as default"
                          disabled={loading}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegenerate(key._id)}
                        title="Regenerate"
                        disabled={loading}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevoke(key._id)}
                        title="Revoke"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
