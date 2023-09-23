export type AddUserPayload = {
  username: string;
  password: string;
  fullname: string;
};

export type RequestAddUserype = Partial<Record<"Payload", AddUserPayload>>;
