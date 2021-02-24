import { createOAuthDeviceAuth } from "../src";

describe("Smoke test", () => {
  it("is a function", () => {
    expect(createOAuthDeviceAuth).toBeInstanceOf(Function);
  });
});
