// app/api/goal/route.ts
// Main entry point: Goal -> Plan -> Execute

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getRedis, ensureSeeded } from "../../../lib/redis";
import { RequestStore, EventStore } from "@agentic/core/stores/redis";
import { CanonicalizationEngine } from "@agentic/core/canonicalization/engine";
import { ConsensusEngine } from "@agentic/core/consensus/engine";
import { FlowCompiler } from "@agentic/core/flows/flow-compiler";
import { SecurityEngine } from "@agentic/core/security/mac";
import { initObservability } from "@agentic/core/observability/tracer";

initObservability();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureSeeded();
  const redis = getRedis();
  const requestStore = new RequestStore(redis as any);
  const eventStore = new EventStore(redis as any);
  const canonical = new CanonicalizationEngine(redis as any);
  const consensus = new ConsensusEngine(redis as any);
  const flowCompiler = new FlowCompiler(redis as any);
  const security = new SecurityEngine(redis as any);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { goal } = body || {};
  if (!goal || typeof goal !== "string") {
    return NextResponse.json(
      { error: "Missing 'goal' string in request body" },
      { status: 400 }
    );
  }

  const requestId = uuidv4();
  const goalHash = await canonical.canonicalize(
    { action: "goal", parameters: { goal } },
    "orchestrator"
  );

  const requestState = {
    request_id: requestId,
    status: "pending" as const,
    route: "quorum" as const,
    trust_score: 0.92,
    risk_level: "medium" as const,
    created_at: Date.now(),
    updated_at: Date.now(),
    commit_phase: "none" as const,
    lineage_id: uuidv4(),
    goal
  };

  await requestStore.create(requestState);
  await eventStore.publish({
    request_id: requestId,
    type: "REQUEST_CREATED",
    timestamp: Date.now()
  });

  const plan = await flowCompiler.synthesizePlan(goal, goalHash.intent_hash);

  const primaryOutput = {
    request_id: requestId,
    agent_id: "primary-001",
    agent_type: "primary" as const,
    model: "gpt-4o",
    action: "refund_order",
    parameters: { order_id: "ORD-48291", amount: 129.99 },
    intent_hash: goalHash.intent_hash,
    decision_basis: [{ key: "reason", value: "customer_request" }],
    confidence: 0.91,
    latency_ms: 1240,
    created_at: Date.now()
  };

  const shadowOutput = {
    ...primaryOutput,
    agent_type: "shadow" as const,
    model: "claude-3.5"
  };

  const consensusResult = await consensus.reachConsensus(
    requestId,
    primaryOutput,
    shadowOutput
  );

  if (!consensusResult.agreement) {
    await requestStore.updateStatus(requestId, "awaiting_consensus");
    return NextResponse.json({
      request_id: requestId,
      status: "awaiting_consensus",
      plan,
      consensus: consensusResult
    });
  }

  const sec = await security.evaluateAction(requestState, primaryOutput);
  if (!sec.allowed) {
    return NextResponse.json({
      request_id: requestId,
      status: "blocked",
      error: sec.reason,
      requires_human: sec.requiresHuman,
      plan,
      consensus: consensusResult
    });
  }

  if (plan.source === "compiled") {
    await flowCompiler.executeFlow(plan.steps[0].flow_id!, {
      order_id: "ORD-48291"
    });
  } else {
    console.log("[EXEC] Running agentic plan:", plan);
  }

  await requestStore.updateStatus(requestId, "resolved");
  await eventStore.publish({
    request_id: requestId,
    type: "GOAL_SYNTHESIZED",
    timestamp: Date.now()
  });

  return NextResponse.json({
    request_id: requestId,
    status: "resolved",
    plan,
    consensus: consensusResult,
    final_action: primaryOutput.action,
    canonical: goalHash
  });
}
