import { getUserAgent } from "universal-user-agent";
import { request } from "@octokit/request";

import { auth } from "./auth";
import { hook } from "./hook";
import * as Types from "./types";
import { VERSION } from "./version";

export type StrategyOptions = Types.StrategyOptions;
export type AuthOptions = Types.AuthOptions;
export type Authentication = Types.Authentication;
export type OAuthAppAuthentication = Types.OAuthAppAuthentication;
export type GitHubAppAuthentication = Types.GitHubAppAuthentication;
export type GitHubAppAuthenticationWithExpiration = Types.GitHubAppAuthenticationWithExpiration;

export function createOAuthDeviceAuth(
  options: Types.StrategyOptions
): Types.AuthInterface {
  const state = Object.assign(
    {
      request: request.defaults({
        headers: {
          "user-agent": `octokit-auth-oauth-device.js/${VERSION} ${getUserAgent()}`,
        },
      }),
      scopes: [],
    },
    options
  );

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

  return Object.assign(auth.bind(null, state), {
    hook: hook.bind(null, state),
  });
}
