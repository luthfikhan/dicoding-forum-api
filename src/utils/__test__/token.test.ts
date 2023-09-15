import { generateToken, generateTokenId, verifyToken } from "../token";

describe("JWT Token Helper", () => {
  test("Success Create Token", () => {
    const token = generateToken({ username: "luthfikhann" });

    expect(token.accessToken).toBeDefined();
    expect(token.refreshToken).toBeDefined();
  });

  test("Success Create Token ID", () => {
    const token = generateTokenId("luthfikhann");

    expect(token).toBeDefined();
  });

  test("Success verify Refresh Token", () => {
    const username = "luthfikhann";
    const token = generateToken({ username });

    const decoded = verifyToken(token.refreshToken, "refresh_token");

    expect(username).toBe(decoded.username);
  });

  test("Success verify Access Token", () => {
    const username = "luthfikhann";
    const token = generateToken({ username });

    const decoded = verifyToken(token.accessToken, "access_token");

    expect(username).toBe(decoded.username);
  });

  test("Verify invalid token", () => {
    const decoded = verifyToken("xxx", "access_token");

    expect(decoded).toBeNull();
  });
});
