import ClientError from "../client-error";
import UnAuthenticationError from "../unauthentication";

describe("AuthenticationError", () => {
  it("should create AuthenticationError correctly", () => {
    const authenticationError = new UnAuthenticationError("authentication error!");

    expect(authenticationError).toBeInstanceOf(UnAuthenticationError);
    expect(authenticationError).toBeInstanceOf(ClientError);
    expect(authenticationError).toBeInstanceOf(Error);

    expect(authenticationError.statusCode).toEqual(401);
    expect(authenticationError.message).toEqual("authentication error!");
    expect(authenticationError.name).toEqual("AuthenticationError");
  });
});
