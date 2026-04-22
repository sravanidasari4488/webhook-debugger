import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function createSession(label) {
  const payload = label ? { label } : {};
  const response = await api.post("/api/sessions", payload);
  return response.data;
}

export async function getSession(sessionId) {
  const response = await api.get(`/api/sessions/${sessionId}`);
  return response.data;
}

export async function getRequests(sessionId) {
  const response = await api.get(`/api/sessions/${sessionId}/requests`);
  return response.data;
}

export async function clearRequests(sessionId) {
  const response = await api.delete(`/api/sessions/${sessionId}/requests`);
  return response.data;
}

export async function setMockResponse(sessionId, statusCode, responseBody) {
  const response = await api.put(`/api/sessions/${sessionId}/mock-response`, {
    statusCode,
    responseBody,
  });
  return response.data;
}

export async function replayRequest(sessionId, requestId, targetUrl) {
  const response = await api.post(
    `/api/sessions/${sessionId}/requests/${requestId}/replay`,
    { targetUrl }
  );
  return response.data;
}
