import ClientError from "../client-error";
import UnAuthorizationError from "../unauthorization";

describe("AuthorizationError", () => {
  it("should create AuthorizationError correctly", () => {
    const authenticationError = new UnAuthorizationError("authorization error!");

    expect(authenticationError).toBeInstanceOf(UnAuthorizationError);
    expect(authenticationError).toBeInstanceOf(ClientError);
    expect(authenticationError).toBeInstanceOf(Error);

    expect(authenticationError.statusCode).toEqual(403);
    expect(authenticationError.message).toEqual("authorization error!");
    expect(authenticationError.name).toEqual("AuthorizationError");
  });
});
