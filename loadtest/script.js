import ws from "k6/ws"
import http from "k6/http"
import { check, sleep } from "k6"
import { Counter, Rate, Trend } from "k6/metrics"

const SERVER_URL = __ENV.SERVER_URL || "http://localhost:4000"
const API_KEY = __ENV.LOADTEST_API_KEY || ""
const ORG_ID = __ENV.LOADTEST_ORG_ID || ""

const wsConnectSuccess = new Rate("ws_connect_success")
const wsMessagesReceived = new Counter("ws_messages_received")
const wsLatency = new Trend("ws_latency")

export const options = {
  scenarios: {
    websocket: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 250 },
        { duration: "2m", target: 250 },
      ],
      exec: "wsScenario",
    },
    rest: {
      executor: "constant-arrival-rate",
      rate: 50,
      timeUnit: "1s",
      preAllocatedVUs: 50,
      maxVUs: 250,
      exec: "restScenario",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    ws_connect_success: ["rate>=0.99"],
  },
}

function wsScenario() {
  const wsUrl = `${SERVER_URL.replace(/^http/, "ws")}/socket.io/?EIO=4&transport=websocket&token=${API_KEY}`
  let wsConnected = false
  let messageCount = 0
  let startTime = 0

  const res = ws.connect(wsUrl, null, (socket) => {
    socket.on("open", () => {
      wsConnected = true
      wsConnectSuccess.add(1)
      startTime = Date.now()
      socket.send("40")
    })

    socket.on("message", (msg) => {
      const data = msg.toString()
      if (data === "2") {
        socket.send("3")
        return
      }
      if (data.startsWith("40")) {
        socket.send('42["join:org",{"orgId":"' + ORG_ID + '"}]')
        return
      }
      if (data.startsWith("42")) {
        messageCount++
        wsMessagesReceived.add(1)
        wsLatency.add(Date.now() - startTime)
      }
    })

    socket.on("close", () => {
      wsConnected = false
    })

    socket.on("error", (e) => {
      console.error("WS error:", e)
      wsConnectSuccess.add(0)
    })

    socket.setTimeout(() => {
      socket.close()
    }, 150000)
  })

  check(res, { "WS connected": (r) => r && r.status === 101 })

  if (!wsConnected) {
    wsConnectSuccess.add(0)
  }
}

function restScenario() {
  const headers = { "x-api-key": API_KEY }
  const res = http.get(`${SERVER_URL}/api/metrics/summary`, { headers })
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response has data": (r) => r.json().totalRevenue !== undefined,
  })
  sleep(0.1)
}