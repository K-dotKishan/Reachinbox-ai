import { Request, Response, NextFunction } from "express";
import { scheduleEmails, getScheduledEmails, getSentEmails } from "../services/emailService";
import { ScheduleEmailSchema } from "../utils/validation";
import { sendSuccess } from "../utils/response";
import { SessionUser } from "../types";

export async function scheduleEmailsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.session.user as SessionUser;
    const input = req.body as ScheduleEmailSchema;

    const emails = await scheduleEmails(input, user.id, user.email);

    sendSuccess(res, { scheduled: emails.length, emails }, 201);
  } catch (err) {
    next(err);
  }
}

export async function getScheduledEmailsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.session.user as SessionUser;
    const emails = await getScheduledEmails(user.id);
    sendSuccess(res, { emails });
  } catch (err) {
    next(err);
  }
}

export async function getSentEmailsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.session.user as SessionUser;
    const emails = await getSentEmails(user.id);
    sendSuccess(res, { emails });
  } catch (err) {
    next(err);
  }
}
