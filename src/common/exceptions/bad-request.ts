import ClientError from "./client-error";

class BadRequestError extends ClientError {
  constructor(message: string) {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export default BadRequestError;
