import { useEffect, useMemo, useState } from "react";
import ReactJson from "react-json-view";

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

const TABS = ["Headers", "Body", "Query Params"];

function parseJsonSafely(value, fallback) {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return value == null ? "" : String(value);
}

function KeyValueTable({ data, emptyMessage }) {
  const rows = Object.entries(data || {});

  if (rows.length === 0) {
    return <div style={{ color: "#94a3b8", fontSize: "14px" }}>{emptyMessage}</div>;
  }

  return (
    <div style={{ border: "1px solid #1e293b", borderRadius: "10px", overflow: "hidden" }}>
      {rows.map(([key, value], index) => (
        <div
          key={key}
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            borderTop: index === 0 ? "none" : "1px solid #1e293b",
            backgroundColor: index % 2 === 0 ? "rgba(15,23,42,0.65)" : "rgba(15,23,42,0.9)",
          }}
        >
          <div style={{ padding: "10px 12px", color: "#93c5fd", fontSize: "13px", wordBreak: "break-word" }}>
            {key}
          </div>
          <div style={{ padding: "10px 12px", color: "#e2e8f0", fontSize: "13px", wordBreak: "break-word" }}>
            {formatValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RequestDetail({ request, onReplay }) {
  const [activeTab, setActiveTab] = useState("Headers");
  const [showReplayInput, setShowReplayInput] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayResponse, setReplayResponse] = useState(null);
  const [replayError, setReplayError] = useState("");

  useEffect(() => {
    setActiveTab("Headers");
    setShowReplayInput(false);
    setTargetUrl("");
    setIsReplaying(false);
    setReplayResponse(null);
    setReplayError("");
  }, [request?.id]);

  const headers = useMemo(() => parseJsonSafely(request?.headers, {}), [request?.headers]);
  const queryParams = useMemo(() => parseJsonSafely(request?.queryParams, {}), [request?.queryParams]);
  const parsedBody = useMemo(() => parseJsonSafely(request?.body, null), [request?.body]);
  const isJsonBody = request?.body && parsedBody !== null && typeof parsedBody === "object";

  if (!request) {
    return (
      <div
        style={{
          minHeight: "380px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#94a3b8",
          backgroundColor: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        Select a request from the left panel to inspect it.
      </div>
    );
  }

  const method = (request.method || "").toUpperCase();
  const methodStyle = METHOD_COLORS[method] || DEFAULT_METHOD_STYLE;
  const fullTimestamp = request.receivedAt
    ? new Date(request.receivedAt).toLocaleString()
    : "Unknown time";

  const handleReplay = async () => {
    if (!targetUrl.trim() || typeof onReplay !== "function") {
      return;
    }
    setIsReplaying(true);
    setReplayResponse(null);
    setReplayError("");
    try {
      const response = await onReplay(request, targetUrl.trim());
      setReplayResponse(response);
    } catch (error) {
      const message = error?.response?.data?.message || "Replay failed";
      setReplayError(message);
    } finally {
      setIsReplaying(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        color: "#e2e8f0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px 14px",
          alignItems: "center",
          padding: "14px 16px",
          borderBottom: "1px solid #1e293b",
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
          }}
        >
          {method || "HTTP"}
        </span>
        <span style={{ color: "#cbd5e1", fontSize: "13px" }}>{fullTimestamp}</span>
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>IP: {request.sourceIp || "-"}</span>
      </div>

      <div style={{ display: "flex", gap: "8px", padding: "12px 16px", borderBottom: "1px solid #1e293b" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              border: "1px solid",
              borderColor: activeTab === tab ? "#2563eb" : "#334155",
              backgroundColor: activeTab === tab ? "rgba(37,99,235,0.2)" : "transparent",
              color: activeTab === tab ? "#bfdbfe" : "#94a3b8",
              padding: "7px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>
        {activeTab === "Headers" && <KeyValueTable data={headers} emptyMessage="No headers" />}

        {activeTab === "Body" &&
          (isJsonBody ? (
            <div style={{ border: "1px solid #1e293b", borderRadius: "10px", overflow: "hidden", padding: "8px" }}>
              <ReactJson
                src={parsedBody}
                theme="tomorrow"
                displayDataTypes={false}
                enableClipboard={false}
                name={false}
                collapsed={1}
              />
            </div>
          ) : (
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #1e293b",
                backgroundColor: "#020617",
                color: "#e2e8f0",
                fontSize: "13px",
              }}
            >
              {request.body || ""}
            </pre>
          ))}

        {activeTab === "Query Params" && (
          <KeyValueTable data={queryParams} emptyMessage="No query parameters" />
        )}
      </div>

      <div style={{ borderTop: "1px solid #1e293b", padding: "14px 16px" }}>
        {!showReplayInput ? (
          <button
            type="button"
            onClick={() => setShowReplayInput(true)}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "9px 14px",
              backgroundColor: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Replay Request
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="url"
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              placeholder="https://example.com/webhook"
              style={{
                flex: "1 1 260px",
                minWidth: "240px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #334155",
                backgroundColor: "#020617",
                color: "#e2e8f0",
              }}
            />
            <button
              type="button"
              onClick={handleReplay}
              disabled={!targetUrl.trim() || isReplaying}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "10px 14px",
                backgroundColor: !targetUrl.trim() || isReplaying ? "#334155" : "#16a34a",
                color: "#fff",
                fontWeight: 600,
                cursor: !targetUrl.trim() || isReplaying ? "not-allowed" : "pointer",
              }}
            >
              {isReplaying ? "Firing..." : "Fire"}
            </button>
          </div>
        )}

        {replayResponse && (
          <div
            style={{
              marginTop: "12px",
              border: "1px solid #1e293b",
              borderRadius: "10px",
              backgroundColor: "#020617",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "13px", color: "#93c5fd", marginBottom: "8px" }}>
              Status Code: {replayResponse.statusCode}
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: "13px",
                color: "#e2e8f0",
              }}
            >
              {replayResponse.responseBody || ""}
            </pre>
          </div>
        )}

        {replayError && (
          <div style={{ marginTop: "10px", color: "#f87171", fontSize: "13px" }}>{replayError}</div>
        )}
      </div>
    </div>
  );
}
