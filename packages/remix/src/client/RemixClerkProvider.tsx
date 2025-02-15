import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import type { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import React from 'react';

import { assertValidClerkState, warnForSsr } from '../utils';
import type { ClerkState } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';

export * from '@clerk/clerk-react';

export type RemixClerkProviderProps = {
  children: React.ReactNode;
  clerkState: ClerkState;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: RemixClerkProviderProps): JSX.Element {
  const awaitableNavigate = useAwaitableNavigate();

  // @ts-expect-error
  const { clerkState, proxyUrl, domain, isSatellite, ...restProps } = rest;
  ReactClerkProvider.displayName = 'ReactClerkProvider';

  assertValidClerkState(clerkState);
  const { __clerk_ssr_state, __frontendApi, __publishableKey, __proxyUrl, __domain, __isSatellite, __clerk_debug } =
    clerkState?.__internal_clerk_state || {};

  React.useEffect(() => {
    warnForSsr(clerkState);
  }, []);

  React.useEffect(() => {
    (window as any).__clerk_debug = __clerk_debug;
  }, []);

  return (
    <ReactClerkProvider
      navigate={awaitableNavigate}
      initialState={__clerk_ssr_state}
      frontendApi={__frontendApi as any}
      publishableKey={__publishableKey as any}
      //@ts-expect-error
      proxyUrl={proxyUrl || __proxyUrl}
      domain={domain || __domain}
      isSatellite={isSatellite || __isSatellite}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
