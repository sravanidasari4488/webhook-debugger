import { formatDistanceToNow } from "date-fns";

const METHOD_COLORS = {
  GET: { bg: "rgba(34,197,94,0.18)", color: "#22c55e", border: "rgba(34,197,94,0.45)" },
  POST: { bg: "rgba(59,130,246,0.18)", color: "#60a5fa", border: "rgba(96,165,250,0.45)" },
  PUT: { bg: "rgba(249,115,22,0.18)", color: "#fb923c", border: "rgba(251,146,60,0.45)" },
  PATCH: { bg: "rgba(168,85,247,0.18)", color: "#c084fc", border: "rgba(192,132,252,0.45)" },
  DELETE: { bg: "rgba(239,68,68,0.18)", color: "#f87171", border: "rgba(248,113,113,0.45)" },
};

const DEFAULT_METHOD_STYLE = {
  bg: "rgba(148,163,184,0.18)",
  color: "#cbd5e1",
  border: "rgba(148,163,184,0.45)",
};

export function RequestList({ requests, selectedRequestId, onSelectRequest }) {
  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          @keyframes requestListPulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            70% { transform: scale(1.25); opacity: 0; }
            100% { transform: scale(0.95); opacity: 0; }
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 16px",
          borderBottom: "1px solid #1e293b",
          color: "#cbd5e1",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        <span style={{ position: "relative", width: "10px", height: "10px", display: "inline-block" }}>
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "999px",
              backgroundColor: "#22c55e",
            }}
          />
          <span
            style={{
              position: "absolute",
              inset: "-2px",
              borderRadius: "999px",
              border: "1px solid rgba(34,197,94,0.8)",
              animation: "requestListPulse 1.8s ease-out infinite",
            }}
          />
        </span>
        <span>{requests.length} requests captured</span>
      </div>

      {requests.length === 0 ? (
        <div style={{ padding: "20px 16px", color: "#94a3b8", fontSize: "14px", lineHeight: 1.5 }}>
          Waiting for requests... Send a webhook to your URL to see it here.
        </div>
      ) : (
        <div>
          {requests.map((request) => {
            const method = (request.method || "").toUpperCase();
            const methodStyle = METHOD_COLORS[method] || DEFAULT_METHOD_STYLE;
            const isSelected = request.id === selectedRequestId;
            const receivedAt = request.receivedAt
              ? formatDistanceToNow(new Date(request.receivedAt), { addSuffix: true })
              : "just now";

            return (
              <button
                key={request.id}
                type="button"
                onClick={() => onSelectRequest(request)}
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                  border: "none",
                  borderTop: "1px solid #1e293b",
                  backgroundColor: isSelected ? "rgba(37,99,235,0.18)" : "transparent",
                  padding: "12px 16px",
                  cursor: "pointer",
                  color: "#e2e8f0",
                }}
              >
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    border: `1px solid ${methodStyle.border}`,
                    backgroundColor: methodStyle.bg,
                    color: methodStyle.color,
                    minWidth: "56px",
                    textAlign: "center",
                  }}
                >
                  {method || "HTTP"}
                </span>

                <span style={{ fontSize: "13px", color: "#94a3b8" }}>{receivedAt}</span>
                <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{request.sourceIp || "-"}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
