import { RequestError } from "@octokit/request-error";
import { RequestInterface } from "@octokit/types";

import {
  AuthOptions,
  State,
  Authentication,
  Verification,
  CodeExchangeResponseError,
} from "./types";

export async function getOAuthAccessToken(
  state: State,
  options: {
    request?: RequestInterface;
    auth: AuthOptions;
  }
): Promise<Authentication> {
  const scope = (options.auth.scopes || state.scopes).join(" ");

  const cachedAuthentication = getCachedAuthentication(state, options.auth);

  if (cachedAuthentication) return cachedAuthentication;

  // The "/login/device/code" is not part of the REST API hosted on api.github.com,
  // instead it’s using the github.com domain.
  const request = options.request || state.request;
  const baseUrl = /^https:\/\/(api\.)?github\.com$/.test(
    request.endpoint.DEFAULTS.baseUrl
  )
    ? "https://github.com"
    : request.endpoint.DEFAULTS.baseUrl.replace("/api/v3", "");

  // Step 1: Request device and user codes
  // https://docs.github.com/en/developers/apps/authorizing-oauth-apps#step-1-app-requests-the-device-and-user-verification-codes-from-github
  const parameters = {
    baseUrl,
    method: "POST",
    url: "/login/device/code",
    headers: {
      accept: "application/json",
    },
    client_id: state.clientId,
    scope,
  };

  const requestCodesResponse = await request(parameters);

  if ("error" in requestCodesResponse.data) {
    throw new RequestError(
      `${requestCodesResponse.data.error_description} (${requestCodesResponse.data.error})`,
      requestCodesResponse.status,
      {
        headers: requestCodesResponse.headers,
        request: request.endpoint(parameters),
      }
    );
  }

  const verification = requestCodesResponse.data as Verification;

  // Step 2: User must enter the user code on https://github.com/login/device
  // See https://docs.github.com/en/developers/apps/authorizing-oauth-apps#step-2-prompt-the-user-to-enter-the-user-code-in-a-browser
  await state.onVerification(verification);

  // Step 3: Exchange device code for access token
  // See https://docs.github.com/en/developers/apps/authorizing-oauth-apps#step-3-app-polls-github-to-check-if-the-user-authorized-the-device
  const authentication = await waitForAccessToken(
    request,
    baseUrl,
    state.clientId,
    verification
  );

  state.authentication = authentication;

  return authentication;
}

function getCachedAuthentication(state: State, auth: AuthOptions) {
  if (auth.refresh === true) return false;
  if (!state.authentication) return false;

  if (!("scopes" in state.authentication)) {
    return state.authentication;
  }

  const newScope = (auth.scopes || state.scopes).join(" ");
  const currentScope = state.authentication.scopes.join(" ");

  if (newScope === currentScope) {
    return state.authentication;
  }
}

type OAuthResponseDataForOAuthApps = {
  access_token: string;
  token_type: "bearer";
  scope: string;
};
type OAuthResponseDataForGitHubAppsWithoutExpiration = {
  access_token: string;
  token_type: "bearer";
  scope: "";
};

type OAuthResponseDataForGitHubAppsWithExpiration = {
  access_token: string;
  token_type: "bearer";
  scope: "";
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
};

type ExchangeCodeResponse = {
  data:
    | {
        error: CodeExchangeResponseError;
        error_description: string;
        error_url: string;
      }
    | OAuthResponseDataForOAuthApps
    | OAuthResponseDataForGitHubAppsWithoutExpiration
    | OAuthResponseDataForGitHubAppsWithExpiration;
  headers: any;
};

async function wait(seconds: number) {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function waitForAccessToken(
  request: RequestInterface,
  baseUrl: string,
  clientId: string,
  verification: Verification
): Promise<Authentication> {
  const requestOptions = {
    baseUrl,
    method: "POST",
    url: "/login/oauth/access_token",
    headers: {
      accept: "application/json",
    },
    client_id: clientId,
    device_code: verification.device_code,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  };

  const { data, headers }: ExchangeCodeResponse = await request(requestOptions);

  if ("access_token" in data) {
    // Only Client IDs belonging to GitHub Apps have a "lv1." prefix
    // To be more future proof, we only check for the existense of the "."
    const clientType = /\./.test(clientId) ? "github-app" : "oauth-app";

    if (clientType === "oauth-app") {
      return {
        type: "token",
        tokenType: "oauth",
        clientType: "oauth-app",
        clientId: clientId,
        token: data.access_token,
        scopes: data.scope.split(/,\s*/).filter(Boolean),
      };
    }

    if ("refresh_token" in data) {
      const apiTimeInMs = new Date(headers.date as string).getTime();

      return {
        type: "token",
        tokenType: "oauth",
        clientType: "github-app",
        clientId: clientId,
        token: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: toTimestamp(apiTimeInMs, data.expires_in),
        refreshTokenExpiresAt: toTimestamp(
          apiTimeInMs,
          data.refresh_token_expires_in
        ),
      };
    }

    return {
      type: "token",
      tokenType: "oauth",
      clientType: "github-app",
      clientId: clientId,
      token: data.access_token,
    };
  }

  if (data.error === "authorization_pending") {
    await wait(verification.interval);
    return waitForAccessToken(request, baseUrl, clientId, verification);
  }

  if (data.error === "slow_down") {
    await wait(verification.interval + 5);
    return waitForAccessToken(request, baseUrl, clientId, verification);
  }

  throw new RequestError(
    `${data.error_description} (${data.error}, ${data.error_url})`,
    400,
    {
      request: request.endpoint.merge(requestOptions),
      headers: headers,
    }
  );
}

function toTimestamp(apiTimeInMs: number, expirationInSeconds: number) {
  return new Date(apiTimeInMs + expirationInSeconds * 1000).toISOString();
}
