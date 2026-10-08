"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { connect, disconnect, joinOrg } = useSocket();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.orgId) {
      connect();
      joinOrg(session.user.orgId);
    }
    return () => {
      // Don't disconnect here - let pages manage their own connection
      // This allows the socket to persist across page navigations
    };
  }, [status, session?.user?.orgId, connect, joinOrg]);

  return <>{children}</>;
}
