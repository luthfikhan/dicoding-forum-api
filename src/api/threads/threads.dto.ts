import AuthType from "../../common/types/auth.type";

export type AddThreadPayload = {
  title: string;
  body: string;
};

type RequestAddThreadRef = {
  Payload: AddThreadPayload;
  AuthUser: AuthType;
};

export type RequestAddThreadType = Partial<RequestAddThreadRef>;

export type AddCommentPayload = {
  content: string;
};

type RequestAddCommentRef = {
  Payload: AddCommentPayload;
  AuthUser: AuthType;
};

export type RequestAddCommentType = Partial<RequestAddCommentRef>;

type RequestDeleteCommentRef = {
  AuthUser: AuthType;
};

export type RequestDeleteCommentType = Partial<RequestDeleteCommentRef>;

export type AddReplyPayload = {
  content: string;
};

type RequestAddReplyRef = {
  Payload: AddReplyPayload;
  AuthUser: AuthType;
};

export type RequestAddReplyType = Partial<RequestAddReplyRef>;

type RequestDeleteReplyRef = {
  AuthUser: AuthType;
};

export type RequestDeleteReplyType = Partial<RequestDeleteReplyRef>;
