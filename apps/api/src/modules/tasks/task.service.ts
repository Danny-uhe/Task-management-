import { prisma } from "../../config/prisma.js";
import { CreateTaskInput, UpdateTaskInput } from "./task.validation.js";
import { createNotification } from "../notifications/notification.service.js";
import { getIO } from "../../sockets/socket.js";
import { awardPoints } from "../gamification/gamification.service.js";


export async function createTask(
  projectId: string,
  userId: string,
  data: CreateTaskInput
) {
  // 1. Make sure the project exists
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // 2. Only project members can create tasks
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this project");
  }

  // 3. If assigned to someone, check caller has permission AND assignee is a member
  if (data.assignedToId) {
    // Only system admins and project owners/admins can assign tasks
    const caller = await prisma.user.findUnique({
      where: { id: userId },
      select: { systemRole: true },
    });
    const canAssign =
      caller?.systemRole === "admin" ||
      member.role === "owner" ||
      member.role === "admin";

    if (!canAssign) {
      throw new Error("Only admins and project owners can assign tasks.");
    }

    const assignedMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: data.assignedToId,
          projectId,
        },
      },
    });

    if (!assignedMember) {
      throw new Error("The assigned user is not a member of this project");
    }
  }

  // 4. Create the task
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate
        ? new Date(data.dueDate)
        : undefined,
      points: data.points,
      projectId,
      createdById: userId,
      assignedToId: data.assignedToId,
    },
  });

  // 5. Notify assigned user
  if (data.assignedToId) {
    await createNotification(
      data.assignedToId,
      "TASK_ASSIGNED",
      `You have been assigned a new task: ${task.title}`,
      task.id
    );
  }

  // 6. Broadcast to project room
  try { getIO().to(`project:${projectId}`).emit("task_updated", { action: "created", task }); } catch { /* socket not ready */ }

  return task;
}



export async function getProjectTasks(
  projectId: string,
  userId: string
) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this project");
  }

  return prisma.task.findMany({
    where: {
      projectId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
          isOnline: true,
        },
      },
      attachments: {
        select: {
          id: true,
          fileName: true,
          originalName: true,
          mimeType: true,
          fileSize: true,
          fileUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}



export async function getTaskById(
  taskId: string,
  userId: string
) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
          isOnline: true,
        },
      },

      attachments: {
        select: {
          id: true,
          fileName: true,
          originalName: true,
          mimeType: true,
          fileSize: true,
          fileUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: task.projectId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this project");
  }

  return task;
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: UpdateTaskInput
) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: task.projectId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this project");
  }

  if (data.assignedToId) {
    // Only system admins and project owners/admins can assign tasks
    const caller = await prisma.user.findUnique({
      where: { id: userId },
      select: { systemRole: true },
    });
    const canAssign =
      caller?.systemRole === "admin" ||
      member.role === "owner" ||
      member.role === "admin";

    if (!canAssign) {
      throw new Error("Only admins and project owners can assign tasks.");
    }

    const assignedMember =
      await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: data.assignedToId,
            projectId: task.projectId,
          },
        },
      });

    if (!assignedMember) {
      throw new Error(
        "The assigned user is not a member of this project"
      );
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate:
        data.dueDate === undefined
          ? undefined
          : data.dueDate === null
            ? null
            : new Date(data.dueDate),
      points: data.points,
      assignedToId:
        data.assignedToId === undefined
          ? undefined
          : data.assignedToId,
    },
  });

  if (data.status === "done" && task.status !== "done") {
    const assigneeId = updated.assignedToId ?? task.assignedToId;
    if (assigneeId) {
      await awardPoints(assigneeId, 50);
    }
  }

  try { getIO().to(`project:${updated.projectId}`).emit("task_updated", { action: "updated", task: updated }); } catch { /* socket not ready */ }

  return updated;
}

export async function deleteTask(
  taskId: string,
  userId: string
) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: task.projectId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this project");
  }

  await prisma.task.delete({ where: { id: taskId } });

  try { getIO().to(`project:${task.projectId}`).emit("task_updated", { action: "deleted", taskId }); } catch { /* socket not ready */ }

  return true;
}


