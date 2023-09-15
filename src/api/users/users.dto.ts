type addUserPayload = {
  username: string;
  password: string;
  fullname: string;
};

export type AddUserPayload = Partial<Record<"Payload", addUserPayload>>;
