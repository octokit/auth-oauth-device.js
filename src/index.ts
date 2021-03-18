import { getUserAgent } from "universal-user-agent";
import { request as octokitRequest } from "@octokit/request";

import { auth } from "./auth";
import { hook } from "./hook";
import {
  GitHubAppAuthInterface,
  GitHubAppState,
  GitHubAppStrategyOptions,
  OAuthAppAuthInterface,
  OAuthAppState,
  OAuthAppStrategyOptions,
} from "./types";
import { VERSION } from "./version";

// Remember to update README.md#Types when changing exports
export {
  OAuthAppStrategyOptions,
  OAuthAppAuthOptions,
  OAuthAppAuthentication,
  GitHubAppStrategyOptions,
  GitHubAppAuthOptions,
  GitHubAppAuthentication,
  GitHubAppAuthenticationWithExpiration,
} from "./types";

export function createOAuthDeviceAuth(
  options: OAuthAppStrategyOptions
): OAuthAppAuthInterface;

export function createOAuthDeviceAuth(
  options: GitHubAppStrategyOptions
): GitHubAppAuthInterface;

export function createOAuthDeviceAuth(
  options: OAuthAppStrategyOptions | GitHubAppStrategyOptions
): OAuthAppAuthInterface | GitHubAppAuthInterface {
  const requestWithDefaults =
    options.request ||
    octokitRequest.defaults({
      headers: {
        "user-agent": `octokit-auth-oauth-device.js/${VERSION} ${getUserAgent()}`,
      },
    });

  const { request = requestWithDefaults, ...otherOptions } = options;

  const state: OAuthAppState | GitHubAppState =
    options.clientType === "github-app"
      ? {
          ...otherOptions,
          clientType: "github-app",
          request,
        }
      : {
          ...otherOptions,
          clientType: "oauth-app",
          request,
          scopes: options.scopes || [],
        };

  if (!options.clientId) {
    throw new Error(
      '[@octokit/auth-oauth-device] "clientId" option must be set (https://github.com/octokit/auth-oauth-device.js#usage)'
    );
  }

  if (!options.onVerification) {
    throw new Error(
      '[@octokit/auth-oauth-device] "onVerification" option must be a function (https://github.com/octokit/auth-oauth-device.js#usage)'
    );
  }

  // @ts-expect-error looks like TypeScript cannot handle the different OAuth App/GitHub App paths here
  return Object.assign(auth.bind(null, state), {
    hook: hook.bind(null, state),
  });
}
