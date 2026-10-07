"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Key, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const session = useSession();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  useEffect(() => {
    if (session) fetchApiKeys();
  }, [session]);

  const fetchApiKeys = async () => {
    const res = await fetch("/api/api-keys", { credentials: "include" });
    if (res.ok) setApiKeys(await res.json());
  };

  const handleCreateKey = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      toast.success("API key created", { description: data.key });
      fetchApiKeys();
      setNewKeyName("");
    } else toast.error("Failed to create key");
    setLoading(false);
  };

  const handleRevoke = async (id: string) => {
    await fetch(`/api/api-keys/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchApiKeys();
    toast.success("API key revoked");
  };

  const handleRegenerate = async (id: string) => {
    const res = await fetch(`/api/api-keys/${id}/regenerate`, {
      method: "PATCH",
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      toast.success("API key regenerated", { description: data.key });
      fetchApiKeys();
    } else toast.error("Failed to regenerate key");
  };

  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={session.data?.user?.name || ""} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={session.data?.user?.email || ""} disabled />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={session.data?.user?.role || ""} disabled />
            </div>
            <div>
              <Label>Organization</Label>
              <Input value={session.data?.user?.orgId || ""} disabled />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateKey} className="flex gap-2">
            <Input
              placeholder="Key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !newKeyName}>
              <Plus className="mr-2 h-4 w-4" /> Create
            </Button>
          </form>
          <div className="space-y-2">
            {apiKeys.length === 0 ? (
              <p className="text-muted-foreground">No API keys</p>
            ) : (
              apiKeys.map((key) => (
                <div
                  key={key._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {key.prefix}•••••••• •{" "}
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleDateString()
                          : "Never used"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRegenerate(key._id)}
                      title="Regenerate"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevoke(key._id)}
                      title="Revoke"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
