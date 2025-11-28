/**
 * WebSocket Connection Manager Hook
 * 
 * Manages WebSocket connection lifecycle globally:
 * - Connects when user is authenticated
 * - Keeps connection alive across navigation
 * - Disconnects on logout
 * 
 * This hook creates a persistent subscription that keeps the WebSocket
 * connection alive even when navigating between pages.
 */

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';

// Keep-alive subscription to maintain WebSocket connection
// Uses conversationUpdated subscription to avoid conflict with messageReceived
// which is handled by subscribeToMore in useMessages
const KEEP_ALIVE_SUBSCRIPTION = gql`
  subscription KeepAlive {
    conversationUpdated {
      conversationID
    }
  }
`;

/**
 * Hook to manage WebSocket connection globally
 * Connects when user is authenticated, disconnects on logout
 */
export const useWebSocketManager = () => {
  const { token } = useSelector((state) => state.user);
  const client = useApolloClient();
  const subscriptionRef = useRef(null);
  const isConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!token) {
      // If no token, ensure we're disconnected
      if (subscriptionRef.current) {
        console.log('🔌 [WebSocket] Disconnecting (user logged out)');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
        isConnectedRef.current = false;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      return;
    }

    // If already connected, don't reconnect
    if (isConnectedRef.current && subscriptionRef.current) {
      return;
    }

    // Connect WebSocket by creating a keep-alive subscription
    const connectWebSocket = () => {
      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      console.log('🔌 [WebSocket] Connecting (user authenticated)');
      
      try {
        const subscription = client.subscribe({
          query: KEEP_ALIVE_SUBSCRIPTION,
          fetchPolicy: 'no-cache',
        }).subscribe({
          next: (data) => {
            // Silently handle keep-alive messages
            // We don't need to process them, just keep connection alive
            if (!isConnectedRef.current) {
              isConnectedRef.current = true;
              console.log('✅ [WebSocket] Connected and kept alive');
            }
          },
          error: (error) => {
            console.error('❌ [WebSocket] Keep-alive subscription error:', error);
            // Reset connection state on error
            isConnectedRef.current = false;
            subscriptionRef.current = null;
            
            // Attempt to reconnect after a delay (only if still authenticated)
            if (localStorage.getItem("userToken")) {
              console.log('🔄 [WebSocket] Attempting to reconnect in 3 seconds...');
              reconnectTimeoutRef.current = setTimeout(() => {
                connectWebSocket();
              }, 3000);
            }
          },
          complete: () => {
            console.log('🔌 [WebSocket] Keep-alive subscription completed');
            isConnectedRef.current = false;
            subscriptionRef.current = null;
            
            // Attempt to reconnect if still authenticated
            if (localStorage.getItem("userToken")) {
              console.log('🔄 [WebSocket] Attempting to reconnect in 2 seconds...');
              reconnectTimeoutRef.current = setTimeout(() => {
                connectWebSocket();
              }, 2000);
            }
          },
        });

        subscriptionRef.current = subscription;
      } catch (error) {
        console.error('❌ [WebSocket] Failed to establish connection:', error);
        isConnectedRef.current = false;
        
        // Retry connection after delay
        if (localStorage.getItem("userToken")) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      }
    };

    // Initial connection
    connectWebSocket();

    // Cleanup on unmount or when token changes
    return () => {
      if (subscriptionRef.current) {
        console.log('🔌 [WebSocket] Cleaning up keep-alive subscription');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
        isConnectedRef.current = false;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [token, client]);

  // Return connection status (for debugging)
  return {
    isConnected: isConnectedRef.current,
  };
};

export default useWebSocketManager;

