import { Request, Response } from "express";
import { addTaskAttachments, getTaskAttachments } from "./task-attachment.service.js";

export async function upload(
  req: Request,
  res: Response
) {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded",
      });
    }

    const attachments = await addTaskAttachments(
      req.params.taskId as string,
      req.user!.userId,
      files
    );

    return res.status(201).json({
      success: true,
      attachments,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
}




export async function getAttachments(
  req: Request,
  res: Response
) {
  try {
    const attachments = await getTaskAttachments(
      req.params.taskId as string,
      req.user!.userId
    );

    return res.status(200).json({
      success: true,
      attachments,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    const status =
      message === "Task not found" ? 404 : 403;

    return res.status(status).json({
      success: false,
      message,
    });
  }
}