import { getOAuthAccessToken } from "./get-oauth-access-token";
import { State, AuthOptions, Authentication } from "./types";

export async function auth(
  state: State,
  authOptions: AuthOptions
): Promise<Authentication> {
  return getOAuthAccessToken(state, {
    auth: authOptions,
  });
}
