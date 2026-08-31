import { Request, Response } from "express";
import { 
    createComment,
    getTaskComments,
    upadteComment,
    deleteComment } from "./comment.service.js";
import { success } from "zod";


export async function create(
    req: Request,
    res: Response
) {
    try {
        const taskId = req.params.taskId as string;
        const userId = req.user!.userId;
        const { content } = req.body;

        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        const comment = await createComment(
            taskId,
            userId,
            content.trim()
        );

        return res.status(201).json({
            success: true,
            comment,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Something went wrong"
        });
    }
}

export async function getAll(
    req : Request,
    res : Response
) {
    try {
        const taskId = req.params.taskId as string; 

        const comments = await getTaskComments(taskId);

        return res.status(200).json({
            success: true,
            comments,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Something went wrong",
        });
    }
}

export async function update(
    req: Request,
    res: Response
){
    try {
        const commentId = req.params.commentId as string;
        const userId = req.user!.userId;
        const { content } = req.body ?? {};

        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        const comment = await upadteComment(
            commentId,
            userId,
            content.trim()
        );

        return res.status(200).json({
            success: true,
            comment,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
             error instanceof Error 
            ? error.message : "Something went wrong",
        });
    }
}

export async function remove(
  req: Request,
  res: Response
) {
  try {
    const commentId = req.params.commentId as string;
    const userId = req.user!.userId;

    const result = await deleteComment(
      commentId,
      userId
    );

    return res.status(200).json({
      success: true,
      ...result,
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