import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  clearRequests,
  getRequests,
  replayRequest,
  setMockResponse,
} from "../api/webhookApi";
import { useWebhookSocket } from "../hooks/useWebhookSocket";
import { RequestDetail } from "./RequestDetail";
import { RequestList } from "./RequestList";

export function Dashboard({ session }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isMockFormOpen, setIsMockFormOpen] = useState(false);
  const [mockStatusCode, setMockStatusCode] = useState(
    String(session?.customResponseStatus ?? 200)
  );
  const [mockResponseBody, setMockResponseBody] = useState(
    session?.customResponseBody ?? ""
  );
  const [isSavingMockResponse, setIsSavingMockResponse] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const webhookUrl = useMemo(
    () => `http://localhost:8080/hook/${session.id}`,
    [session.id]
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchRequests() {
      try {
        const data = await getRequests(session.id);
        if (!isMounted) {
          return;
        }
        setRequests(data);
        setSelectedRequest((prev) => {
          if (!prev) {
            return data[0] ?? null;
          }
          const matched = data.find((item) => item.id === prev.id);
          return matched ?? data[0] ?? null;
        });
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load requests.");
        }
      }
    }

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, [session.id]);

  const { isConnected } = useWebhookSocket(session.id, (incomingRequest) => {
    setRequests((prev) => [incomingRequest, ...prev]);
    setSelectedRequest((prev) => prev ?? incomingRequest);
    toast.success("New request received!");
  });

  const handleCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied");
    } catch (error) {
      toast.error("Unable to copy URL");
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearRequests(session.id);
      setRequests([]);
      setSelectedRequest(null);
      toast.success("Requests cleared");
    } catch (error) {
      toast.error("Failed to clear requests");
    } finally {
      setIsClearing(false);
    }
  };

  const handleSaveMockResponse = async () => {
    const parsedStatus = Number(mockStatusCode);
    if (!Number.isInteger(parsedStatus) || parsedStatus < 100 || parsedStatus > 599) {
      toast.error("Status code must be between 100 and 599");
      return;
    }

    setIsSavingMockResponse(true);
    try {
      await setMockResponse(session.id, parsedStatus, mockResponseBody);
      toast.success("Mock response updated");
      setIsMockFormOpen(false);
    } catch (error) {
      toast.error("Failed to update mock response");
    } finally {
      setIsSavingMockResponse(false);
    }
  };

  const handleReplay = async (request, targetUrl) => {
    return replayRequest(session.id, request.id, targetUrl);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <nav
        style={{
          borderBottom: "1px solid #1e293b",
          padding: "14px 18px",
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          alignItems: "center",
          gap: "12px",
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(2,6,23,0.95)",
          backdropFilter: "blur(8px)",
          zIndex: 5,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "18px" }}>Webhook Debugger</div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <code
            style={{
              color: "#93c5fd",
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              padding: "7px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {webhookUrl}
          </code>
          <button
            type="button"
            onClick={handleCopyWebhookUrl}
            style={{
              border: "1px solid #334155",
              backgroundColor: "#0f172a",
              color: "#e2e8f0",
              borderRadius: "8px",
              padding: "7px 10px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Copy
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "999px",
              backgroundColor: isConnected ? "#22c55e" : "#64748b",
              display: "inline-block",
            }}
          />
          <span style={{ color: isConnected ? "#86efac" : "#94a3b8", fontSize: "13px", fontWeight: 600 }}>
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
      </nav>

      <main style={{ padding: "16px", display: "grid", gridTemplateColumns: "30% 70%", gap: "16px" }}>
        <section style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isClearing}
                style={{
                  border: "1px solid #334155",
                  backgroundColor: isClearing ? "#1e293b" : "#0b1220",
                  color: "#e2e8f0",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  cursor: isClearing ? "not-allowed" : "pointer",
                }}
              >
                {isClearing ? "Clearing..." : "Clear All"}
              </button>
              <button
                type="button"
                onClick={() => setIsMockFormOpen((prev) => !prev)}
                style={{
                  border: "1px solid #334155",
                  backgroundColor: "#0b1220",
                  color: "#e2e8f0",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Mock Response
              </button>
            </div>

            {isMockFormOpen && (
              <div
                style={{
                  borderTop: "1px solid #1e293b",
                  paddingTop: "10px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <input
                  type="number"
                  min="100"
                  max="599"
                  value={mockStatusCode}
                  onChange={(event) => setMockStatusCode(event.target.value)}
                  placeholder="Status code"
                  style={{
                    border: "1px solid #334155",
                    backgroundColor: "#020617",
                    color: "#e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "13px",
                  }}
                />
                <textarea
                  value={mockResponseBody}
                  onChange={(event) => setMockResponseBody(event.target.value)}
                  placeholder="Response body"
                  rows={3}
                  style={{
                    border: "1px solid #334155",
                    backgroundColor: "#020617",
                    color: "#e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "13px",
                    resize: "vertical",
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveMockResponse}
                  disabled={isSavingMockResponse}
                  style={{
                    justifySelf: "start",
                    border: "none",
                    backgroundColor: isSavingMockResponse ? "#334155" : "#16a34a",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    cursor: isSavingMockResponse ? "not-allowed" : "pointer",
                  }}
                >
                  {isSavingMockResponse ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          <RequestList
            requests={requests}
            selectedRequestId={selectedRequest?.id ?? null}
            onSelectRequest={setSelectedRequest}
          />
        </section>

        <section style={{ minWidth: 0 }}>
          <RequestDetail request={selectedRequest} onReplay={handleReplay} />
        </section>
      </main>
    </div>
  );
}
