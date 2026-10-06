"use client"

import { useEffect } from "react"
import { useSocket } from "@/hooks/useSocket"
import { useSession } from "next-auth/react"

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const { connect, disconnect, joinOrg, ping } = useSocket()

  useEffect(() => {
    if (!session) return // Prerendering or loading
    if (session.data?.user?.orgId) {
      connect()
      joinOrg(session.data.user.orgId)
      const interval = setInterval(ping, 10000)
      return () => { clearInterval(interval); disconnect() }
    } else {
      disconnect()
    }
  }, [session?.data?.user?.orgId, connect, disconnect, joinOrg, ping])

  return <>{children}</>
}