import { createOAuthDeviceAuth } from "../src/index.js";

describe("Smoke test", () => {
  it("is a function", () => {
    expect(createOAuthDeviceAuth).toBeInstanceOf(Function);
  });
});
