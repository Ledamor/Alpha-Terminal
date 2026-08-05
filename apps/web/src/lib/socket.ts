import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// define events from server -> client
interface ServerToClientEvents {
  PRICE_UPDATED: (payload: { symbol: string; price: number; timestamp: string }) => void;
  ORDER_EXECUTED: (payload: { id: string; symbol: string; status: string; quantity: number; executionPrice?: number }) => void;
}

// optionally client -> server events:
interface ClientToServerEvents {
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  connect(token?: string) {
    if (this.socket) return;

    this.socket = io(API_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to real-time market stream');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from real-time market stream');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ) {
    if (this.socket) {
      // Cast the callback to satisfy socket.io's internal types without using any
      this.socket.on(event as string, callback as (...args: unknown[]) => void);
    }
  }

  off<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ) {
    if (this.socket) {
      this.socket.off(event as string, callback as (...args: unknown[]) => void);
    }
  }
}

export const socketService = new SocketService();
