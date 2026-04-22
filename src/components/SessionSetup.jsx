import { useState } from "react";
import toast from "react-hot-toast";
import { createSession } from "../api/webhookApi";

export function SessionSetup({ onSessionCreated }) {
  const [label, setLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const session = await createSession(label.trim());
      onSessionCreated(session);
    } catch (error) {
      toast.error("Failed to create session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, rgba(30,41,59,1) 0%, rgba(2,6,23,1) 50%, rgba(2,6,23,1) 100%)",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          border: "1px solid #334155",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderRadius: "14px",
          padding: "28px",
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.35)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Webhook Debugger
        </h1>
        <p style={{ marginTop: "10px", color: "#94a3b8", fontSize: "14px" }}>
          Create a session to start capturing and inspecting incoming webhooks.
        </p>

        <label htmlFor="session-label" style={{ display: "block", marginTop: "18px", fontSize: "14px" }}>
          Session Label (optional)
        </label>
        <input
          id="session-label"
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="e.g. Stripe Test Session"
          style={{
            marginTop: "8px",
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #475569",
            backgroundColor: "#0b1220",
            color: "#e2e8f0",
            outline: "none",
          }}
        />

        <button
          type="button"
          onClick={handleCreateSession}
          disabled={isCreating}
          style={{
            width: "100%",
            marginTop: "18px",
            padding: "11px 14px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: isCreating ? "#334155" : "#2563eb",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "14px",
            cursor: isCreating ? "not-allowed" : "pointer",
          }}
        >
          {isCreating ? "Creating..." : "Create Session"}
        </button>
      </div>
    </div>
  );
}
