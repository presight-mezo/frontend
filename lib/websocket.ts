/**
 * WebSocket service for real-time updates from the backend
 */

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

export type WebSocketEventType =
  | "group:member:joined"
  | "stake:placed"
  | "market:updated"
  | "market:resolved"
  | "market:created";

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: unknown;
  groupId?: string;
  timestamp: number;
}

export class PresightWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<
    WebSocketEventType | "connected" | "disconnected" | "error",
    Set<(data: unknown) => void>
  > = new Map();

  constructor(url: string = WS_URL) {
    this.url = url;
  }

  /**
   * Connect to WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          this.emit("connected", null);
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data) as WebSocketEvent;
          this.emit(message.type, message);
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.emit("error", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket closed");
          this.emit("disconnected", null);
          this.attemptReconnect();
        };
      } catch (_e) {
        reject(_e);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to WebSocket event
   */
  on(
    event: WebSocketEventType | "connected" | "disconnected" | "error",
    callback: (data: unknown) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Subscribe to group events
   */
  subscribeToGroup(groupId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "subscribe",
          channel: `group:${groupId}`,
        })
      );
    }
  }

  /**
   * Unsubscribe from group events
   */
  unsubscribeFromGroup(groupId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "unsubscribe",
          channel: `group:${groupId}`,
        })
      );
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(
      event as WebSocketEventType | 'connected' | 'disconnected' | 'error'
    );
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(
        `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connect().catch(console.error), delay);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

// Singleton instance
let wsInstance: PresightWebSocket | null = null;

/**
 * Get or create WebSocket instance
 */
export function getWebSocketInstance(): PresightWebSocket {
  if (!wsInstance) {
    wsInstance = new PresightWebSocket();
  }
  return wsInstance;
}
