import {
  RequestInterface,
  Route,
  EndpointOptions,
  RequestParameters,
  OctokitResponse,
} from "@octokit/types";

export type ClientType = "oauth-app" | "github-app";

export type OAuthAppStrategyOptions<TClientType extends ClientType> = {
  clientId: string;

  clientType?: TClientType;
  onVerification: OnVerificationCallback;
  scopes?: string[];
  request?: RequestInterface;
};

export type GitHubAppStrategyOptions<TClientType extends ClientType> = {
  clientId: string;

  clientType: TClientType;
  onVerification: OnVerificationCallback;
  /** `scopes` are not permitted for GitHub Apps */
  scopes?: never;
  request?: RequestInterface;
};

export type StrategyOptions<
  TClientType extends ClientType = "oauth-app"
> = TClientType extends "oauth-app"
  ? OAuthAppStrategyOptions<TClientType>
  : TClientType extends "github-app"
  ? GitHubAppStrategyOptions<TClientType>
  : never;

export interface AuthInterface<TClientType extends ClientType> {
  (options: AuthOptions): Promise<Authentication<TClientType>>;

  hook(
    request: RequestInterface,
    route: Route | EndpointOptions,
    parameters?: RequestParameters
  ): Promise<OctokitResponse<any>>;
}

export type AuthOptions = {
  type: "oauth";
  scopes?: string[];
  refresh?: boolean;
};

export type OAuthAppAuthentication = {
  type: "token";
  tokenType: "oauth";
  clientType: "oauth-app";
  clientId: string;
  token: string;
  scopes: string[];
};

export type GitHubAppAuthentication = {
  type: "token";
  tokenType: "oauth";
  clientType: "github-app";
  clientId: string;
  token: string;
};

export type GitHubAppAuthenticationWithExpiration = {
  type: "token";
  tokenType: "oauth";
  clientType: "github-app";
  clientId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  refreshTokenExpiresAt: string;
};

export type Authentication<
  TClientType extends ClientType = "oauth-app"
> = TClientType extends "oauth-app"
  ? OAuthAppAuthentication
  : TClientType extends "github-app"
  ? GitHubAppAuthentication | GitHubAppAuthenticationWithExpiration
  : never;

export type Verification = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
};

export type OnVerificationCallback = (
  verification: Verification
) => any | Promise<any>;

export type OAuthAppState = {
  clientId: string;
  clientType: "oauth-app";
  onVerification: OnVerificationCallback;
  scopes: string[];
  request: RequestInterface;
  authentication?: Authentication<"oauth-app">;
};
export type GitHubAppState = {
  clientId: string;
  clientType: "github-app";
  onVerification: OnVerificationCallback;
  request: RequestInterface;
  authentication?: Authentication<"github-app">;
};

export type State = OAuthAppState | GitHubAppState;

export type CodeExchangeResponseError =
  | "authorization_pending"
  | "slow_down"
  | "expired_token"
  | "unsupported_grant_type"
  | "incorrect_client_credentials"
  | "incorrect_device_code"
  | "access_denied";
