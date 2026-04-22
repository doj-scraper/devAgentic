import type { Redis as RedisType } from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __agenticRedis: RedisType | undefined;
  // eslint-disable-next-line no-var
  var __agenticSeeded: boolean | undefined;
}

function buildRedis(): RedisType {
  if (process.env.REDIS_URL) {
    const Real = require("ioredis");
    const RealCtor = Real.Redis || Real.default || Real;
    return new RealCtor(process.env.REDIS_URL);
  }
  const Mock = require("ioredis-mock");
  const MockCtor = Mock.default || Mock;
  return new MockCtor();
}

export function getRedis(): RedisType {
  if (!globalThis.__agenticRedis) {
    globalThis.__agenticRedis = buildRedis();
  }
  return globalThis.__agenticRedis;
}

export async function ensureSeeded(): Promise<void> {
  if (globalThis.__agenticSeeded) return;
  const redis = getRedis();
  await redis.set("canonical:active_version", "v1");
  await redis.set(
    "canonical:actions:v1",
    JSON.stringify({
      delete: ["delete", "remove", "destroy"],
      create: ["create", "add", "insert"],
      update: ["update", "modify", "change"],
      refund: ["refund", "return", "credit"]
    })
  );
  await redis.set(
    "canonical:fields:v1",
    JSON.stringify({
      target: ["target", "id", "user_id", "uid", "order_id"],
      amount: ["amount", "value", "total", "price"]
    })
  );
  await redis.set(
    "canonical:tool_rules:v1",
    JSON.stringify({
      billing: { required_fields: ["amount"], normalize: ["currency_to_number"] },
      user: { normalize: ["strip_prefix:user_"] }
    })
  );
  globalThis.__agenticSeeded = true;
  console.log("[seed] Canonicalization v1 seeded into in-memory Redis");
}
