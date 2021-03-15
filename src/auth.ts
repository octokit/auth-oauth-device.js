import { getOAuthAccessToken } from "./get-oauth-access-token";
import { State, AuthOptions, Authentication, ClientType } from "./types";

export async function auth<TClientType extends ClientType>(
  state: State,
  authOptions: AuthOptions
): Promise<Authentication<TClientType>> {
  return getOAuthAccessToken<TClientType>(state, {
    auth: authOptions,
  });
}
