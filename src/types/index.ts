export type AuthUser = {
  id: number;
  name: string;
  role: "maintainer" | "contributor";
};

export type User = {
  id: number;
  name: string;
  role: string;
  iat: number;
  exp: number;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type CreateIssuePayload = {
  title: string;
  description: string;
  type: string;
  status: string;
};

export type UpdatePaylaod = {
  title: string;
  description: string;
  type: string;
};

export type IssueQuery = {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
