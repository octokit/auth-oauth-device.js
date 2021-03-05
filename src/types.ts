import {
  RequestInterface,
  Route,
  EndpointOptions,
  RequestParameters,
  OctokitResponse,
} from "@octokit/types";

export type StrategyOptions = {
  clientId: string;
  onVerification: OnVerificationCallback;
  scopes?: string[];
  request?: RequestInterface;
};

export interface AuthInterface {
  (options: AuthOptions): Promise<Authentication>;

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

export type Authentication = {
  type: "token";
  tokenType: "oauth";
  token: string;
  scopes: string[];
};

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

export type State = {
  clientId: string;
  onVerification: OnVerificationCallback;
  scopes: string[];
  request: RequestInterface;
  authentication?: Authentication;
};

export type CodeExchangeResponseError =
  | "authorization_pending"
  | "slow_down"
  | "expired_token"
  | "unsupported_grant_type"
  | "incorrect_client_credentials"
  | "incorrect_device_code"
  | "access_denied";