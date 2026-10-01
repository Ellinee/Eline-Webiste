export const endpoints = { login: "/login", logout: "/logout", session: "/session", status: "/status", events: "/events", stream: "/debug/api/stream" } as const;
export const maxEvents = 2000;
export const stageLabels = {
  mqtt_received: "MQTT received", validated: "Validated", rejected: "Rejected", buffered: "Buffered", skipped: "Skipped", inference: "AI response", outbox_queued: "Outbox queued", kafka_delivered: "Kafka acknowledged", kafka_retry: "Kafka retry",
} as const;
