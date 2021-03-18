import { getOAuthAccessToken } from "./get-oauth-access-token";
import {
  OAuthAppAuthOptions,
  GitHubAppAuthOptions,
  OAuthAppAuthentication,
  GitHubAppAuthentication,
  OAuthAppState,
  GitHubAppState,
} from "./types";

export async function auth(
  state: OAuthAppState,
  authOptions: OAuthAppAuthOptions
): Promise<OAuthAppAuthentication>;

export async function auth(
  state: GitHubAppState,
  authOptions: GitHubAppAuthOptions
): Promise<GitHubAppAuthentication>;

export async function auth(
  state: OAuthAppState | GitHubAppState,
  authOptions: OAuthAppAuthOptions | GitHubAppAuthOptions
): Promise<OAuthAppAuthentication | GitHubAppAuthentication> {
  // @ts-expect-error looks like TypeScript cannot handle the different OAuth App/GitHub App paths here
  return getOAuthAccessToken(state, {
    auth: authOptions,
  });
}
