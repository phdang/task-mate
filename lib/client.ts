import { useMemo } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'

type MyApolloCache = any;
let apolloClient: ApolloClient<MyApolloCache> | undefined;

function createIsomorphLink() {
  if (typeof window === 'undefined') {
    const { SchemaLink } = require('@apollo/client/link/schema');
    const { schema } = require('../backend/schema');
    const { db } = require('../backend/db');
    return new SchemaLink({ schema, context: { db } });
  } else {
    const { HttpLink } = require('@apollo/client/link/http');
    return new HttpLink({
      uri: '/api/graphql',
      credentials: 'same-origin',
    });
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphLink(),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState: MyApolloCache | null = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
     // Get existing cache, loaded during client side data fetching
     const existingCache = _apolloClient.extract()

     // Merge the existing cache into data passed from getStaticProps/getServerSideProps
     const data = merge(initialState, existingCache, {
       // combine arrays using object equality (like in sets)
       arrayMerge: (destinationArray, sourceArray) => [
         ...sourceArray,
         ...destinationArray.filter((d) =>
           sourceArray.every((s) => !isEqual(d, s))
         ),
       ],
     })
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState: MyApolloCache) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
