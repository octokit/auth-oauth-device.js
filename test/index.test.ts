import fetchMock from "fetch-mock";
import { request } from "@octokit/request";
import { jest } from "@jest/globals";

import { createOAuthDeviceAuth } from "../src/index.js";

test("README example", async () => {
  const mock = fetchMock
    .sandbox()

    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        error: "authorization_pending",
        error_description: "error_description",
        error_uri: "error_url",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret123",
        scope: "",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    );

  const onVerification = jest.fn();
  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification,
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  const authentication = await auth({
    type: "oauth",
  });

  expect(await authentication).toEqual({
    clientId: "1234567890abcdef1234",
    clientType: "oauth-app",
    type: "token",
    tokenType: "oauth",
    token: "secret123",
    scopes: [],
  });

  expect(onVerification).toHaveBeenCalledTimes(1);
});

test("README example for GitHub App with expiring tokens disabled", async () => {
  const mock = fetchMock
    .sandbox()

    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        error: "authorization_pending",
        error_description: "error_description",
        error_uri: "error_url",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        body: {
          access_token: "token123",
          scope: "",
          token_type: "bearer",
        },
        headers: {
          date: "Thu, 1 Jan 1970 00:00:00 GMT",
        },
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    );

  const onVerification = jest.fn();
  const auth = createOAuthDeviceAuth({
    clientType: "github-app",
    clientId: "lv1.1234567890abcdef",
    onVerification,
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  const authentication = await auth({
    type: "oauth",
  });

  expect(await authentication).toEqual({
    type: "token",
    tokenType: "oauth",
    clientType: "github-app",
    clientId: "lv1.1234567890abcdef",
    token: "token123",
  });

  expect(onVerification).toHaveBeenCalledTimes(1);
});

test("README example for GitHub App with expiring tokens enabled", async () => {
  const mock = fetchMock
    .sandbox()

    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        error: "authorization_pending",
        error_description: "error_description",
        error_uri: "error_url",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        body: {
          access_token: "token123",
          scope: "",
          token_type: "bearer",
          expires_in: 28800,
          refresh_token: "r1.token123",
          refresh_token_expires_in: 15897600,
        },
        headers: {
          date: "Thu, 1 Jan 1970 00:00:00 GMT",
        },
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    );

  const onVerification = jest.fn();
  const auth = createOAuthDeviceAuth({
    clientType: "github-app",
    clientId: "lv1.1234567890abcdef",
    onVerification,
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  const authentication = await auth({
    type: "oauth",
  });

  expect(await authentication).toEqual({
    type: "token",
    tokenType: "oauth",
    clientType: "github-app",
    clientId: "lv1.1234567890abcdef",
    token: "token123",
    expiresAt: "1970-01-01T08:00:00.000Z",
    refreshToken: "r1.token123",
    refreshTokenExpiresAt: "1970-07-04T00:00:00.000Z",
  });

  expect(onVerification).toHaveBeenCalledTimes(1);
});

test("Request for user/device code fails", async () => {
  const mock = fetchMock
    .sandbox()

    .postOnce(
      "https://github.com/login/device/code",
      {
        error: "some_error",
        error_description: "error_description",
        error_uri: "error_url",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
      },
    );

  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification: jest.fn(),
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  await expect(async () =>
    auth({
      type: "oauth",
    }),
  ).rejects.toThrow("error_description (some_error, error_url)");
});

test("Caches token", async () => {
  const mock = fetchMock
    .sandbox()

    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret123",
        scope: "",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    );

  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification: jest.fn(),
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  const authentication1 = await auth({
    type: "oauth",
  });

  expect(authentication1).toEqual({
    clientId: "1234567890abcdef1234",
    clientType: "oauth-app",
    type: "token",
    tokenType: "oauth",
    token: "secret123",
    scopes: [],
  });

  const authentication2 = await auth({
    type: "oauth",
  });

  expect(authentication1).toEqual(authentication2);
});

test("auth({ refresh: true })", async () => {
  const mock = fetchMock
    .sandbox()

    // 1st auth() call
    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret123",
        scope: "",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    )

    // 2nd auth() call
    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode456",
        user_code: "usercode456",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
        overwriteRoutes: false,
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret456",
        scope: "",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode456",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    );

  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification: jest.fn(),
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  const authentication1 = await auth({
    type: "oauth",
  });

  expect(authentication1).toEqual({
    clientId: "1234567890abcdef1234",
    clientType: "oauth-app",
    type: "token",
    tokenType: "oauth",
    token: "secret123",
    scopes: [],
  });

  const authentication2 = await auth({
    type: "oauth",
    refresh: true,
  });

  expect(authentication2).toEqual({
    clientId: "1234567890abcdef1234",
    clientType: "oauth-app",
    type: "token",
    tokenType: "oauth",
    token: "secret456",
    scopes: [],
  });
});

test("refreshes token for different scopes", async () => {
  const mock = fetchMock
    .sandbox()

    // 1st auth() call
    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret123",
        scope: "",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    )

    // 2nd auth() call
    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode456",
        user_code: "usercode456",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "repo",
        },
        overwriteRoutes: false,
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret456",
        scope: "repo",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode456",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    );

  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification: jest.fn(),
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  const authentication1 = await auth({
    type: "oauth",
  });

  expect(authentication1).toEqual({
    clientId: "1234567890abcdef1234",
    clientType: "oauth-app",
    type: "token",
    tokenType: "oauth",
    token: "secret123",
    scopes: [],
  });

  const authentication2 = await auth({
    type: "oauth",
    scopes: ["repo"],
  });

  expect(authentication2).toEqual({
    clientId: "1234567890abcdef1234",
    clientType: "oauth-app",
    type: "token",
    tokenType: "oauth",
    token: "secret456",
    scopes: ["repo"],
  });
});

test("does not refresh token for GitHub Apps", async () => {
  const mock = fetchMock
    .sandbox()

    // 1st auth() call
    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret123",
        scope: "",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    )

    // 2nd auth() call
    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode456",
        user_code: "usercode456",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
          scope: "repo",
        },
        overwriteRoutes: false,
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret456",
        scope: "repo",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "lv1.1234567890abcdef",
          device_code: "devicecode456",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    );

  const auth = createOAuthDeviceAuth({
    clientType: "github-app",
    clientId: "lv1.1234567890abcdef",
    onVerification: jest.fn(),
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  const authentication1 = await auth({
    type: "oauth",
  });

  expect(authentication1).toEqual({
    clientId: "lv1.1234567890abcdef",
    clientType: "github-app",
    type: "token",
    tokenType: "oauth",
    token: "secret123",
  });

  const authentication2 = await auth({
    type: "oauth",
  });

  expect(authentication2).toEqual(authentication1);
});

test("test with request instance that has custom baseUrl (GHE)", async () => {
  const mock = fetchMock
    .sandbox()

    .postOnce(
      "https://github.acme-inc.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.acme-inc.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
      },
    )
    .postOnce(
      "https://github.acme-inc.com/login/oauth/access_token",
      {
        access_token: "secret123",
        scope: "",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    );

  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification: jest.fn(),
    request: request.defaults({
      baseUrl: "https://github.acme-inc.com/api/v3",
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  const authentication = await auth({ type: "oauth" });

  expect(authentication).toEqual({
    clientId: "1234567890abcdef1234",
    clientType: "oauth-app",
    type: "token",
    tokenType: "oauth",
    token: "secret123",
    scopes: [],
  });
});

test("slow_down error", async () => {
  const mock = fetchMock
    .sandbox()

    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        error: "slow_down",
        error_description: "error_description",
        error_uri: "error_url",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret123",
        scope: "",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    );

  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification: jest.fn(),
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  const authentication = await auth({
    type: "oauth",
  });

  expect(await authentication).toEqual({
    clientId: "1234567890abcdef1234",
    clientType: "oauth-app",
    type: "token",
    tokenType: "oauth",
    token: "secret123",
    scopes: [],
  });
}, 10000);

test("expired_token error", async () => {
  const mock = fetchMock
    .sandbox()

    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        error: "expired_token",
        error_description: "error_description",
        error_uri: "error_url",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
      },
    );

  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification: jest.fn(),
    request: request.defaults({
      headers: {
        "user-agent": "test",
      },
      request: {
        fetch: mock,
      },
    }),
  });

  await expect(async () => await auth({ type: "oauth" })).rejects.toThrow(
    "error_description (expired_token, error_url)",
  );
}, 10000);

test("auth.hook() creates token and uses it for succeeding requests", async () => {
  const mock = fetchMock
    .sandbox()

    .postOnce(
      "https://github.com/login/device/code",
      {
        device_code: "devicecode123",
        user_code: "usercode123",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        // use low number because jest.useFakeTimers() & jest.runAllTimers() didn't work for me
        interval: 0.005,
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          scope: "",
        },
      },
    )
    .postOnce(
      "https://github.com/login/oauth/access_token",
      {
        access_token: "secret123",
        scope: "",
      },
      {
        headers: {
          accept: "application/json",
          "user-agent": "test",
          "content-type": "application/json; charset=utf-8",
        },
        body: {
          client_id: "1234567890abcdef1234",
          device_code: "devicecode123",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        overwriteRoutes: false,
      },
    )
    .get(
      "https://api.github.com/user",
      { id: "1234567890abcdef1234" },
      {
        headers: {
          authorization: "token secret123",
        },
        repeat: 4,
      },
    );

  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification: jest.fn(),
  });

  const requestWithMock = request.defaults({
    headers: {
      "user-agent": "test",
    },
    request: {
      fetch: mock,
    },
  });
  const requestWithAuth = requestWithMock.defaults({
    request: {
      hook: auth.hook,
    },
  });

  await auth.hook(requestWithMock, "GET /user");
  await auth.hook(requestWithMock, "GET /user");

  await requestWithAuth("GET /user");
  await requestWithAuth("GET /user");

  expect(mock.done()).toBe(true);
});

test("auth.hook(request, 'POST https://github.com/login/oauth/access_token') does not send request twice", async () => {
  const mock = fetchMock
    .sandbox()
    .postOnce("https://github.com/login/oauth/access_token", {
      access_token: "secret123",
      scope: "",
    });

  const auth = createOAuthDeviceAuth({
    clientId: "1234567890abcdef1234",
    onVerification: jest.fn(),
  });

  const requestWithAuth = request.defaults({
    headers: {
      "user-agent": "test",
    },
    request: {
      fetch: mock,
      hook: auth.hook,
    },
  });

  await requestWithAuth("POST https://github.com/login/oauth/access_token", {
    headers: {
      accept: "application/json",
    },
    type: "token",
    code: "random123",
    state: "mystate123",
  });
});

test("clientId option not set", () => {
  expect(() =>
    // @ts-expect-error property 'clientId' is missing
    createOAuthDeviceAuth({
      onVerification: jest.fn(),
    }),
  ).toThrow(
    `[@octokit/auth-oauth-device] \"clientId\" option must be set (https://github.com/octokit/auth-oauth-device.js#usage)`,
  );
});

test("onVerification option not set", () => {
  expect(() =>
    // @ts-expect-error property 'onVerification' is missing
    createOAuthDeviceAuth({
      clientId: "1234567890abcdef1234",
    }),
  ).toThrow(
    `[@octokit/auth-oauth-device] "onVerification" option must be a function (https://github.com/octokit/auth-oauth-device.js#usage)`,
  );
});
