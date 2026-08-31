import { prisma } from "../../config/prisma.js";
import { createNotification } from "../notifications/notification.service.js"

export async function createComment(
  taskId: string,
  userId: string,
  content: string
) {
  // 1. Make sure the task exists
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // 2. Only project members can comment on tasks
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

  // 3. Create the comment
  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
        },
      },
    },
  });

  // 4. Notify the task creator
  if (task.createdById && task.createdById !== userId) {
    await createNotification(
      task.createdById,
      "COMMENT_ADDED",
      `${comment.user.name} commented on your task: ${task.title}`,
      taskId
    );
  }

  // 5. Notify the assigned user
  if (
    task.assignedToId &&
    task.assignedToId !== userId &&
    task.assignedToId !== task.createdById
  ) {
    await createNotification(
      task.assignedToId,
      "COMMENT_ADDED",
      `${comment.user.name} commented on your task: ${task.title}`,
      taskId
    );
  }

  return comment;
}


export async function getTaskComments(taskId: string) {
  return prisma.comment.findMany({
    where: {
      taskId,
    },
    orderBy: {
      createdAt: "asc",
    },
      include: {
        user: {
          select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
        },
      },
      },
  })
}


export async function upadteComment(
  commentId: string,
  userId: string,
  content: string 
) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }


  // Only the person who created the comment can edit it 
  if (comment.userId !== userId) {
    throw new Error("You can only edit your own comment");
  }

  return prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
        },
      },
    },
  });
}

export async function deleteComment(
  commentId: string,
  userId: string
) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  //Only the person who created the comment can delete it 
  if (comment.userId !== userId) {
    throw new Error ("You can only delete your own comment");
  }

  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  return {
    message: "Comment deleted successfully",
  };
}

