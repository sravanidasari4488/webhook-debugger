import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8080";

export function useWebhookSocket(sessionId, onNewRequest) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);
  const onNewRequestRef = useRef(onNewRequest);

  useEffect(() => {
    onNewRequestRef.current = onNewRequest;
  }, [onNewRequest]);

  useEffect(() => {
    if (!sessionId) {
      setIsConnected(false);
      return undefined;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        client.subscribe(`/topic/requests/${sessionId}`, (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            if (typeof onNewRequestRef.current === "function") {
              onNewRequestRef.current(parsedMessage);
            }
          } catch (error) {
            // Ignore malformed payloads so the socket stays alive.
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: () => {
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      },
      onWebSocketError: () => {
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      setIsConnected(false);
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [sessionId]);

  return { isConnected };
}
