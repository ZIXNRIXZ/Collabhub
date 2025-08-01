import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4001';
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        // Don't show error in production
        if (import.meta.env.DEV) {
          console.warn('WebSocket server might not be running on port 4001');
        }
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinSession(sessionId: string) {
    if (this.socket) {
      this.socket.emit('join-session', sessionId);
    }
  }

  leaveSession(sessionId: string) {
    if (this.socket) {
      this.socket.emit('leave-session', sessionId);
    }
  }

  sendCodeUpdate(sessionId: string, code: string) {
    if (this.socket) {
      this.socket.emit('code-update', { sessionId, code });
    }
  }

  onCodeUpdate(callback: (code: string) => void) {
    if (this.socket) {
      this.socket.on('code-update', callback);
    }
  }

  onUserJoined(callback: (user: any) => void) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (user: any) => void) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }
}

export const socketManager = new SocketManager(); 