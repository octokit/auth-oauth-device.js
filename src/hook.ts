import {
  RequestInterface,
  OctokitResponse,
  EndpointOptions,
  RequestParameters,
  Route,
} from "@octokit/types";

import { getOAuthAccessToken } from "./get-oauth-access-token";
import { OAuthAppState, GitHubAppState } from "./types";
import { EndpointDefaults } from "@octokit/types";

export async function hook(
  state: OAuthAppState | GitHubAppState,
  request: RequestInterface,
  route: Route | EndpointOptions,
  parameters?: RequestParameters
): Promise<OctokitResponse<any>> {
  let endpoint = request.endpoint.merge(
    route as string,
    parameters
  ) as EndpointDefaults & { url: string };

  // Do not intercept request to retrieve codes or token
  if (/\/login\/(oauth\/access_token|device\/code)$/.test(endpoint.url)) {
    return request(endpoint);
  }

  // @ts-expect-error looks like TypeScript cannot handle the different OAuth App/GitHub App paths here
  const { token } = await getOAuthAccessToken(state, {
    request,
    auth: { type: "oauth" },
  });
  endpoint.headers.authorization = `token ${token}`;

  return request(endpoint as EndpointOptions);
}
