import { getOAuthAccessToken } from "./get-oauth-access-token.js";
import type {
  OAuthAppAuthOptions,
  GitHubAppAuthOptions,
  OAuthAppAuthentication,
  GitHubAppAuthentication,
  OAuthAppState,
  GitHubAppState,
} from "./types.js";

export async function auth(
  state: OAuthAppState | GitHubAppState,
  authOptions: OAuthAppAuthOptions | GitHubAppAuthOptions,
): Promise<OAuthAppAuthentication | GitHubAppAuthentication> {
  return getOAuthAccessToken(state, {
    auth: authOptions,
  });
}
