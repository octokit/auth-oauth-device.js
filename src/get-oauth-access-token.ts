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

  const newScope = (auth.scopes || state.scopes).join(" ");
  const currentScope = state.authentication.scopes.join(" ");

  if (newScope === currentScope) {
    return state.authentication;
  }
}

type ExchangeCodeResponse = {
  data:
    | {
        error: CodeExchangeResponseError;
        error_description: string;
        error_url: string;
      }
    | { access_token: string; scope: string };
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
    return {
      type: "token",
      tokenType: "oauth",
      token: data.access_token,
      scopes: data.scope.split(" ").filter(Boolean),
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
