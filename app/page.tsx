"use client";

import { useState } from "react";

export default function Page() {
  const [goal, setGoal] = useState(
    "Refund order ORD-48291 and notify the customer"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: -0.5 }}>
          Agentic Orchestrator OS
        </h1>
        <p style={{ opacity: 0.75, marginTop: 8 }}>
          Enterprise production-grade self-optimizing agent runtime. Submit a
          natural-language goal, watch it get canonicalized, routed through
          consensus, and synthesized into a plan.
        </p>
      </header>

      <form
        onSubmit={submit}
        style={{
          background: "#141a31",
          padding: 20,
          borderRadius: 12,
          border: "1px solid #232b4d"
        }}
      >
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
          Goal
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            background: "#0b1020",
            color: "#e6e9f2",
            border: "1px solid #2a3360",
            fontFamily: "inherit",
            fontSize: 14,
            boxSizing: "border-box"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 12,
            padding: "10px 18px",
            background: loading ? "#3b4587" : "#5468ff",
            color: "white",
            border: 0,
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600
          }}
        >
          {loading ? "Synthesizing…" : "Submit Goal"}
        </button>
      </form>

      {error && (
        <pre
          style={{
            marginTop: 20,
            background: "#3a1320",
            padding: 16,
            borderRadius: 8,
            color: "#ffb4c0",
            whiteSpace: "pre-wrap"
          }}
        >
          {error}
        </pre>
      )}

      {result && (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18 }}>Result</h2>
          <pre
            style={{
              background: "#0e1430",
              padding: 16,
              borderRadius: 8,
              border: "1px solid #232b4d",
              overflowX: "auto",
              fontSize: 13
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}

      <footer style={{ marginTop: 40, opacity: 0.6, fontSize: 13 }}>
        POST <code>/api/goal</code> with{" "}
        <code>{`{ "goal": "..." }`}</code> to integrate programmatically.
      </footer>
    </main>
  );
}
