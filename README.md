# auth-oauth-device.js

> GitHub OAuth Device authentication strategy for JavaScript

[![@latest](https://img.shields.io/npm/v/@octokit/auth-oauth-device.svg)](https://www.npmjs.com/package/@octokit/auth-oauth-device)
[![Build Status](https://github.com/octokit/auth-oauth-device.js/workflows/Test/badge.svg)](https://github.com/octokit/auth-oauth-device.js/actions?query=workflow%3ATest+branch%3Amain)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=octokit/auth-oauth-device.js)](https://dependabot.com/)

`@octokit/auth-oauth-device` is implementing one of [GitHub’s OAuth Device Flow](https://docs.github.com/en/developers/apps/authorizing-oauth-apps#device-flow).

<!-- toc -->

- [Usage](#usage)
- [`createOAuthDeviceAuth(options)`](#createoauthdeviceauthoptions)
- [`auth(options)`](#authoptions)
- [Authentication object](#authentication-object)
- [`auth.hook(request, route, parameters)` or `auth.hook(request, options)`](#authhookrequest-route-parameters-or-authhookrequest-options)
- [How it works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

<!-- tocstop -->

## Usage

<table>
<tbody valign=top align=left>
<tr><th>

Browsers

</th><td width=100%>

Load `@octokit/auth-oauth-device` directly from [cdn.pika.dev](https://cdn.pika.dev)

```html
<script type="module">
  import { createOAuthDeviceAuth } from "https://cdn.pika.dev/@octokit/auth-oauth-device";
</script>
```

</td></tr>
<tr><th>

Node

</th><td>

Install with `npm install @octokit/core @octokit/auth-oauth-device`

```js
const { createOAuthDeviceAuth } = require("@octokit/auth-oauth-device");
```

</td></tr>
</tbody>
</table>

```js
const auth = createOAuthDeviceAuth({
  clientId: "123",
  onVerification(verification) {
    // verification example
    // {
    //   device_code: "3584d83530557fdd1f46af8289938c8ef79f9dc5",
    //   user_code: "WDJB-MJHT",
    //   verification_uri: "https://github.com/login/device",
    //   expires_in: 900,
    //   interval: 5,
    // };

    console.log("Open %s", verification.verification_uri);
    console.log("Enter code: %s", verification.user_code);
  },
});

const tokenAuthentication = await auth({
  type: "oauth",
});
// resolves with
// {
//   type: 'token',
//   tokenType: 'oauth',
//   token: '...', /* the created oauth token */
//   scopes: [] /* depend on request scopes by OAuth app */
// }
```

## `createOAuthDeviceAuth(options)`

The `createOAuthDeviceAuth` method accepts a single `options` parameter

<table width="100%">
  <thead align=left>
    <tr>
      <th width=150>
        name
      </th>
      <th width=70>
        type
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>options.clientId</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <strong>Required</strong>. Find your OAuth app’s <code>Client ID</code> in your account’s developer settings.
      </td>
    </tr>
    <tr>
      <th>
        <code>options.onVerification</code>
      </th>
      <th>
        <code>function</code>
      </th>
      <td>
        <strong>Required</strong>. A function that is called once the device and user codes were retrieved

The `onVerification()` callback can be used to pause until the user completes step 2, which might result in a better user experience.

```js
const auth = createOAuthDeviceAuth({
  clientId: "123",
  onVerification(verification) {
    console.log("Open %s", verification.verification_uri);
    console.log("Enter code: %s", verification.user_code);

    await prompt("press enter when you are ready to continue")
  },
});
```

</td>
    </tr>
    <tr>
      <th>
        <code>options.request</code>
      </th>
      <th>
        <code>function</code>
      </th>
      <td>
        You can pass in your own <a href="https://github.com/octokit/request.js"><code>@octokit/request</code></a> instance. For usage with enterprise, set <code>baseUrl</code> to the API root endpoint. Example:

```js
const { request } = require("@octokit/request");
createOAuthDeviceAuth({
  clientId: 123,
  clientSecret: "secret",
  request: request.defaults({
    baseUrl: "https://ghe.my-company.com/api/v3",
  }),
});
```

</td></tr>
    <tr>
      <th>
        <code>scopes</code>
      </th>
      <th>
        <code>array of strings</code>
      </th>
      <td>
        Array of scope names enabled for the token. Defaults to <code>[]</code>. See <a href="https://docs.github.com/en/developers/apps/scopes-for-oauth-apps#available-scopes">available scopes</a>
      </td>
    </tr>
  </tbody>
</table>

## `auth(options)`

The async `auth()` method returned by `createOAuthDeviceAuth(options)` accepts the following options

<table width="100%">
  <thead align=left>
    <tr>
      <th width=150>
        name
      </th>
      <th width=70>
        type
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>options.type</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <strong>Required.</strong> Must be set to <code>"oauth"</code>
      </td>
    </tr>
    <tr>
      <th>
        <code>scopes</code>
      </th>
      <th>
        <code>array of strings</code>
      </th>
      <td>

Array of scope names enabled for the token. Defaults to what was set in the [strategy options](#createoauthdeviceauthoptions). See <a href="https://docs.github.com/en/developers/apps/scopes-for-oauth-apps#available-scopes">available scopes</a>

</td>
    </tr>
    <tr>
      <th>
        <code>refresh</code>
      </th>
      <th>
        <code>boolean</code>
      </th>
      <td>

Defaults to `false`. When set to `false`, calling `auth(options)` will resolve with a token that was previously created for the same scopes if it exists. If set to `true` a new token will always be created.

</td>
    </tr>
  </tbody>
</table>

## Authentication object

The async `auth(options)` method resolves to an object with the following properties

<table width="100%">
  <thead align=left>
    <tr>
      <th width=150>
        name
      </th>
      <th width=70>
        type
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>type</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <code>"token"</code>
      </td>
    </tr>
    <tr>
      <th>
        <code>token</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The personal access token
      </td>
    </tr>
    <tr>
      <th>
        <code>tokenType</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <code>"oauth"</code>
      </td>
    </tr>
    <tr>
      <th>
        <code>scopes</code>
      </th>
      <th>
        <code>array of strings</code>
      </th>
      <td>
        array of scope names enabled for the token
      </td>
    </tr>
  </tbody>
</table>

## `auth.hook(request, route, parameters)` or `auth.hook(request, options)`

`auth.hook()` hooks directly into the request life cycle. It amends the request to authenticate correctly based on the request URL.

The `request` option is an instance of [`@octokit/request`](https://github.com/octokit/request.js#readme). The `route`/`options` parameters are the same as for the [`request()` method](https://github.com/octokit/request.js#request).

`auth.hook()` can be called directly to send an authenticated request

```js
const { data: user } = await auth.hook(request, "GET /user");
```

Or it can be passed as option to [`request()`](https://github.com/octokit/request.js#request).

```js
const requestWithAuth = request.defaults({
  request: {
    hook: auth.hook,
  },
});

const { data: user } = await requestWithAuth("GET /user");
```

## How it works

GitHub's OAuth Device flow is different from the web flow in two ways

1. It does not require a URL redirect, which makes it great for devices and CLI apps
2. It does not require the OAuth client secret, which means there is no user-owned server component required.

The flow has 3 parts (see [GitHub documentation](https://docs.github.com/en/developers/apps/authorizing-oauth-apps#device-flow))

1. `@octokit/auth-oauth-device` requests a device and user code
2. Then the user has to open https://github.com/login/device (or it's GitHub Enterprise Server equivalent) and enter the user code
3. While the user enters the code, `@octokit/auth-oauth-device` is sending requests in the background to retrieve the OAuth access token. Once the user completed step 2, the request will succeed and the token will be returned

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[MIT](LICENSE)
