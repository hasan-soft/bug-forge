import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { issueService } from "../services/issue.service.js";
import sendResponse from "../../utils/sendResponse.js";
import { AppError } from "../../types/index.js";
import type {
  CreateIssuePayload,
  UpdateIssuePayload,
} from "../../types/index.js";


const createIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, description, type } = req.body as CreateIssuePayload;

    if (!title || !description || !type) {
      return next(
        new AppError(
          "title, description, and type are required",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    if (title.length > 150) {
      return next(
        new AppError(
          "title must not exceed 150 characters",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    if (description.length < 20) {
      return next(
        new AppError(
          "description must be at least 20 characters",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    if (!["bug", "feature_request"].includes(type)) {
      return next(
        new AppError(
          "type must be 'bug' or 'feature_request'",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    const reporterId = req.user!.id;

    const result = await issueService.createIssue(
      { title, description, type },
      reporterId,
    );

    const createdIssue = result.rows[0];
    if (!createdIssue) {
      return next(
        new AppError(
          "Failed to create issue",
          StatusCodes.INTERNAL_SERVER_ERROR,
        ),
      );
    }
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Issue created successfully",
      data: createdIssue,
    });
  } catch (error) {
    next(error);
  }
};


const getAllIssues = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { sort, type, status } = req.query as {
      sort?: "newest" | "oldest";
      type?: "bug" | "feature_request";
      status?: "open" | "in_progress" | "resolved";
    };

    if (sort && !["newest", "oldest"].includes(sort)) {
      return next(
        new AppError(
          "sort must be 'newest' or 'oldest'",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    if (type && !["bug", "feature_request"].includes(type)) {
      return next(
        new AppError(
          "type must be 'bug' or 'feature_request'",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    if (status && !["open", "in_progress", "resolved"].includes(status)) {
      return next(
        new AppError(
          "status must be 'open', 'in_progress', or 'resolved'",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    const issues = await issueService.getAllIssues({ sort, type, status });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};


const getSingleIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params["id"]);

    if (isNaN(id)) {
      return next(new AppError("Invalid issue ID", StatusCodes.BAD_REQUEST));
    }

    const result = await issueService.getIssueById(id);

    if (result.rows.length === 0) {
      return next(new AppError("Issue not found", StatusCodes.NOT_FOUND));
    }

    const [issueWithReporter] = await issueService.attachReporters(result.rows);
    if (!issueWithReporter) {
      return next(new AppError("Issue not found", StatusCodes.NOT_FOUND));
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: issueWithReporter,
    });
  } catch (error) {
    next(error);
  }
};


const updateIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params["id"]);
    const currentUser = req.user!;

    if (isNaN(id)) {
      return next(new AppError("Invalid issue ID", StatusCodes.BAD_REQUEST));
    }

    const existing = await issueService.getIssueById(id);
    if (existing.rows.length === 0) {
      return next(new AppError("Issue not found", StatusCodes.NOT_FOUND));
    }

    const issue = existing.rows[0]!;
    if (currentUser.role === "contributor") {
      if (issue.reporter_id !== currentUser.id) {
        return next(
          new AppError(
            "You can only update your own issues",
            StatusCodes.FORBIDDEN,
          ),
        );
      }
      if (issue.status !== "open") {
        return next(
          new AppError(
            "You can only update issues that are still open",
            StatusCodes.CONFLICT,
          ),
        );
      }
    }

    // Validate body
    const { title, description, type } = req.body as UpdateIssuePayload;

    if (title !== undefined && title.length > 150) {
      return next(
        new AppError(
          "title must not exceed 150 characters",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    if (description !== undefined && description.length < 20) {
      return next(
        new AppError(
          "description must be at least 20 characters",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    if (type !== undefined && !["bug", "feature_request"].includes(type)) {
      return next(
        new AppError(
          "type must be 'bug' or 'feature_request'",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    const updated = await issueService.updateIssue(id, {
      title,
      description,
      type,
    });
    const updatedIssue = updated.rows[0];
    if (!updatedIssue) {
      return next(
        new AppError(
          "Failed to update issue",
          StatusCodes.INTERNAL_SERVER_ERROR,
        ),
      );
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};


const deleteIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params["id"]);

    if (isNaN(id)) {
      return next(new AppError("Invalid issue ID", StatusCodes.BAD_REQUEST));
    }

    const existing = await issueService.getIssueById(id);
    if (existing.rows.length === 0) {
      return next(new AppError("Issue not found", StatusCodes.NOT_FOUND));
    }

    await issueService.deleteIssue(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
