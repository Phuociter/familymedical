import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

// Get API URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const WS_URL = API_URL.replace(/^http/, "ws");

// HTTP Link for queries and mutations
const httpLink = new HttpLink({
  uri: `${API_URL}/graphql`,
});

// Auth link to add JWT token to HTTP requests
const authLink = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem("userToken");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// WebSocket Link for subscriptions with authentication and reconnection
const wsLink = new GraphQLWsLink(
  createClient({
    url: `${WS_URL}/graphql`,
    connectionParams: () => {
      const token = localStorage.getItem("userToken");
      return {
        authToken: token || "",
      };
    },
    // Automatic reconnection with exponential backoff
    retryAttempts: Infinity,
    shouldRetry: () => true,
    retryWait: async (retries) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const delay = Math.min(1000 * Math.pow(2, retries), 30000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    },
    // Keep connection alive
    keepAlive: 10000,
    // Connection acknowledgement timeout
    connectionAckWaitTimeout: 5000,
    // Lazy connection - only connect when subscription is active
    lazy: true,
    // Log connection events for debugging
    on: {
      connected: () => console.log("WebSocket connected"),
      closed: () => console.log("WebSocket closed"),
      error: (error) => console.error("WebSocket error:", error),
    },
  })
);

// Split link: route subscriptions to WebSocket, queries/mutations to HTTP
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  // Default options for queries
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export default client;
