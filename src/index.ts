import { getUserAgent } from "universal-user-agent";
import { request as octokitRequest } from "@octokit/request";
import {
  RequestInterface,
  EndpointOptions,
  RequestParameters,
  Route,
} from "@octokit/types";

import { auth } from "./auth";
import { hook } from "./hook";
import * as Types from "./types";
import { VERSION } from "./version";

export {
  StrategyOptions,
  AuthOptions,
  Authentication,
  OAuthAppAuthentication,
  GitHubAppAuthentication,
  GitHubAppAuthenticationWithExpiration,
} from "./types";

export function createOAuthDeviceAuth<
  TClientType extends Types.ClientType = "oauth-app"
>(
  options: Types.StrategyOptions<TClientType>
): Types.AuthInterface<TClientType> {
  const requestWithDefaults =
    options.request ||
    octokitRequest.defaults({
      headers: {
        "user-agent": `octokit-auth-oauth-device.js/${VERSION} ${getUserAgent()}`,
      },
    });

  const {
    request = requestWithDefaults,
    clientType = "oauth-app",
    scopes = [],
    ...otherOptions
  } = options;

  const state: Types.State =
    clientType === "github-app"
      ? {
          clientType,
          request,
          ...otherOptions,
        }
      : {
          clientType,
          request,
          scopes,
          ...otherOptions,
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

  return Object.assign(
    (options: Types.AuthOptions) => auth<TClientType>(state, options),
    {
      hook: (
        request: RequestInterface,
        route: Route | EndpointOptions,
        parameters: RequestParameters
      ) => hook(state, request, route, parameters),
    }
  );
}
