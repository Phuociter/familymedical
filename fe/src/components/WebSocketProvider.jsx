/**
 * WebSocketProvider Component
 * 
 * Global component that manages WebSocket connection lifecycle.
 * Should be placed at the App level to ensure WebSocket stays connected
 * across all page navigations.
 */

import { useWebSocketManager } from '../hooks/useWebSocketManager';

const WebSocketProvider = ({ children }) => {
  // This hook manages WebSocket connection based on authentication state
  useWebSocketManager();

  // Just render children - this component only manages WebSocket lifecycle
  return children;
};

export default WebSocketProvider;

