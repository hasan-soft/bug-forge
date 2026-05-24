

export type AuthUser = {
  id: number;
  name: string;
  role: "maintainer" | "contributor";
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
};

export type LoginPayload = {
  email: string;
  password: string;
};



export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export type CreateIssuePayload = {
  title: string;
  description: string;
  type: IssueType;
};

export type UpdateIssuePayload = {
  title?: string | undefined;
  description?: string | undefined;
  type?: IssueType | undefined;
};

export type IssueQuery = {
  sort?: "newest" | "oldest" | undefined;
  type?: IssueType | undefined;
  status?: IssueStatus | undefined;
};



export type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
};

export type IssueRow = {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: string;
  updated_at: string;
};



declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}



export class AppError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
