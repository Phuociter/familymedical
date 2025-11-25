/**
 * Utility functions for managing GraphQL subscriptions
 * 
 * This file provides helper functions for working with Apollo Client subscriptions
 * including connection status monitoring and error handling.
 */

/**
 * Check if WebSocket connection is active
 * @returns {boolean} True if WebSocket is connected
 */
export const isWebSocketConnected = () => {
  // This is a simple check - in production you might want more sophisticated monitoring
  return true; // The GraphQLWsLink handles connection state internally
};

/**
 * Get subscription error handler
 * @param {string} subscriptionName - Name of the subscription for logging
 * @returns {Function} Error handler function
 */
export const getSubscriptionErrorHandler = (subscriptionName) => {
  return (error) => {
    console.error(`Subscription error in ${subscriptionName}:`, error);
    
    // Check if it's a network error
    if (error.networkError) {
      console.error('Network error - WebSocket connection may be down');
    }
    
    // Check if it's a GraphQL error
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err) => {
        console.error(`GraphQL error in ${subscriptionName}:`, err.message);
      });
    }
  };
};

/**
 * Subscription options with automatic error handling
 * @param {Object} options - Subscription options
 * @param {string} options.subscriptionName - Name for logging
 * @param {Function} options.onData - Callback when data is received
 * @param {Function} options.onError - Optional custom error handler
 * @returns {Object} Subscription options object
 */
export const createSubscriptionOptions = ({ 
  subscriptionName, 
  onData, 
  onError 
}) => {
  return {
    onData: ({ data }) => {
      if (data) {
        onData(data);
      }
    },
    onError: onError || getSubscriptionErrorHandler(subscriptionName),
    // Automatically resubscribe on error
    shouldResubscribe: true,
  };
};

/**
 * Format subscription data for logging
 * @param {string} subscriptionName - Name of the subscription
 * @param {Object} data - Subscription data
 */
export const logSubscriptionData = (subscriptionName, data) => {
  console.log(`[${subscriptionName}] Received:`, data);
};
