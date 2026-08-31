import { Request, Response } from "express";
import { createTask, getProjectTasks, getTaskById, updateTask, deleteTask } from "./task.service.js";
import { createTaskSchema, updateTaskSchema } from "./task.validation.js";

export async function create(
  req: Request,
  res: Response
) {
  try {
    const body = createTaskSchema.parse(req.body);

    const task = await createTask(
      req.params.projectId as string,
      req.user!.userId,
      body
    );

    return res.status(201).json({
      success: true,
      task,
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

export async function getAll(
  req: Request,
  res: Response
) {
  try {
    const tasks = await getProjectTasks(
      req.params.projectId as string,
      req.user!.userId
    );

    return res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    if (message === "Project not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(403).json({
      success: false,
      message,
    });
  }
}



export async function getOne(
  req: Request,
  res: Response
) {
  try {
    const task = await getTaskById(
      req.params.taskId as string,
      req.user!.userId
    );

    return res.json({
      success: true,
      task,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    const status =
      message === "Task not found" ? 404 : 403;

    return res.status(status).json({
      success: false,
      message,
    });
  }
}

export async function update(
  req: Request,
  res: Response
) {
  try {
    const body = updateTaskSchema.parse(req.body);

    const task = await updateTask(
      req.params.taskId as string,
      req.user!.userId,
      body
    );

    return res.json({
      success: true,
      task,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    const status =
      message === "Task not found" ? 404 : 403;

    return res.status(status).json({
      success: false,
      message,
    });
  }
}

export async function remove(
  req: Request,
  res: Response
) {
  try {
    await deleteTask(
      req.params.taskId as string,
      req.user!.userId
    );

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";

    const status = message === "Task not found" ? 404 : 403;

    return res.status(status).json({
      success: false,
      message,
    });
  }
}