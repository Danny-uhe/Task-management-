import { Request, Response } from "express";
import { createMessageSchema } from "./message.validation.js";
import {
  getProjectMessages,
  createMessage,
  deleteMessage,
} from "./message.service.js";

export async function listMessages(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId as string;
    const cursor = req.query.cursor as string | undefined;
    const messages = await getProjectMessages(projectId, req.user!.userId, cursor);
    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId as string;
    const body = createMessageSchema.parse(req.body);
    const message = await createMessage(projectId, req.user!.userId, body);
    return res.status(201).json({ success: true, message });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function removeMessage(req: Request, res: Response) {
  try {
    const messageId = req.params.messageId as string;
    const result = await deleteMessage(messageId, req.user!.userId);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}
