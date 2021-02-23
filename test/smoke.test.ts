import { createOAuthDeviceAuth } from "../src";

describe("Smoke test", () => {
  it("is a function", () => {
    expect(createOAuthDeviceAuth).toBeInstanceOf(Function);
  });

  it("createOAuthDeviceAuth.VERSION is set", () => {
    expect(createOAuthDeviceAuth.VERSION).toEqual("0.0.0-development");
  });
});
