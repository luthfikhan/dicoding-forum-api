import ClientError from "./client-error";

class UnAuthorizationError extends ClientError {
  constructor(message: string) {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

export default UnAuthorizationError;
