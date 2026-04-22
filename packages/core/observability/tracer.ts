// packages/core/observability/tracer.ts
// Lightweight no-op tracer. Real OpenTelemetry SDK is not required to run
// the orchestrator locally; swap this out in production for full OTel wiring.

let initialized = false;

export function initObservability(serviceName = "agentic-orchestrator") {
  if (initialized) return;
  initialized = true;
  console.log(`[OTEL] Observability initialized (no-op) for ${serviceName}`);
}

export function createSpan(name: string, attributes: Record<string, any> = {}) {
  console.log(`[TRACE] ${name}`, attributes);
}
