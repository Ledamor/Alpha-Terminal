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
      // socket.io's overloaded types cannot properly infer generic callback mappings. 
      // The wrapper itself provides type safety, so we safely cast internally.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket.on(event, callback as any);
    }
  }

  off<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ) {
    if (this.socket) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket.off(event, callback as any);
    }
  }
}

export const socketService = new SocketService();
