import { getOAuthAccessToken } from "./get-oauth-access-token";
import type {
  OAuthAppAuthOptions,
  GitHubAppAuthOptions,
  OAuthAppAuthentication,
  GitHubAppAuthentication,
  OAuthAppState,
  GitHubAppState,
} from "./types";

export async function auth(
  state: OAuthAppState | GitHubAppState,
  authOptions: OAuthAppAuthOptions | GitHubAppAuthOptions,
): Promise<OAuthAppAuthentication | GitHubAppAuthentication> {
  return getOAuthAccessToken(state, {
    auth: authOptions,
  });
}
