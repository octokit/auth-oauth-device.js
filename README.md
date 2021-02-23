# auth-oauth-device.js

> GitHub OAuth Device authentication strategy for JavaScript

[![@latest](https://img.shields.io/npm/v/@octokit/auth-oauth-device.svg)](https://www.npmjs.com/package/@octokit/auth-oauth-device)
[![Build Status](https://github.com/octokit/auth-oauth-device.js/workflows/Test/badge.svg)](https://github.com/octokit/auth-oauth-device.js/actions?query=workflow%3ATest+branch%3Amain)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=octokit/auth-oauth-device.js)](https://dependabot.com/)

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
const auth = createOAuthAppAuth({
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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[MIT](LICENSE)
