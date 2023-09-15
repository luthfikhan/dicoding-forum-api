import ClientError from "./client-error";

class UnAuthenticationError extends ClientError {
  constructor(message: string) {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export default UnAuthenticationError;
