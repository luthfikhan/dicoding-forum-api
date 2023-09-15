import BadRequestError from "../bad-request";
import ClientError from "../client-error";

describe("BadRequestError", () => {
  it("should create error correctly", () => {
    const badRequestError = new BadRequestError("bad request!");

    expect(badRequestError).toBeInstanceOf(BadRequestError);
    expect(badRequestError).toBeInstanceOf(ClientError);
    expect(badRequestError).toBeInstanceOf(Error);

    expect(badRequestError.message).toEqual("bad request!");
    expect(badRequestError.statusCode).toEqual(400);
    expect(badRequestError.name).toEqual("BadRequestError");
  });
});
