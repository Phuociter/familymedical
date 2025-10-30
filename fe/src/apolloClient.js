import { ApolloClient, InMemoryCache, createUploadLink } from '@apollo/client';

const client = new ApolloClient({
  link: createUploadLink({ uri: 'http://localhost:8080/graphql' }),
  cache: new InMemoryCache(),
});

export default client;
