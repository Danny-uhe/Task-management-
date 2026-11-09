import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

import {
  CreateProjectInput,
  UpdateProjectInput,
} from "./project.validation.js";

export async function createProject(
  data: CreateProjectInput,
  ownerId: string
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const project = await tx.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        ownerId,
      },
    });

    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId: ownerId,
        role: "owner",
      },
    });

    return project;
  });
}

export async function getProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              position: true,
              isOnline: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProjectById(
  projectId: string,
  userId: string
) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              position: true,
              isOnline: true,
              points: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const isMember = project.members.some(
    (member: { userId: string }) => member.userId === userId
  );

  if (!isMember) {
    throw new Error("You are not a member of this project");
  }

  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectInput
) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId) {
    throw new Error("Only the project owner can update this project");
  }

  return prisma.project.update({
    where: {
      id: projectId,
    },
    data,
  });
}

export async function deleteProject(
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

  if (project.ownerId !== userId) {
    throw new Error("Only the project owner can delete this project");
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  return true;
}


export async function getProjectMembers(projectId: string) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return prisma.projectMember.findMany({
    where: {
      projectId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
          isOnline: true,
          points: true,
        },
      },
    },
    orderBy: {
      role: "asc",
    },
  });
}

export async function getOwnedProjectOrganizationScope(
  projectId: string,
  requesterId: string
) {
  let project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== requesterId) {
    throw new Error("Only the project owner can manage members");
  }

  if (!project.organizationId) {
    const organizations = await prisma.organizationMember.findMany({
      where: { userId: requesterId },
      select: { organizationId: true },
    });

    if (organizations.length !== 1) {
      throw new Error(
        organizations.length === 0
          ? "The project owner must belong to an organization before adding members"
          : "This project needs an organization assignment before adding members"
      );
    }

    const organizationId = organizations[0].organizationId;
    await prisma.project.updateMany({
      where: {
        id: projectId,
        ownerId: requesterId,
        organizationId: null,
      },
      data: { organizationId },
    });

    project = await prisma.project.findUnique({
      where: { id: projectId },
    });
  }

  if (!project?.organizationId) {
    throw new Error("This project does not have an organization scope");
  }

  const ownerMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: project.organizationId,
        userId: requesterId,
      },
    },
  });

  if (!ownerMembership) {
    throw new Error("The project owner does not belong to its organization");
  }

  return { project, organizationId: project.organizationId };
}

export async function getEligibleProjectMembers(
  projectId: string,
  requesterId: string
) {
  const { organizationId } = await getOwnedProjectOrganizationScope(
    projectId,
    requesterId
  );

  return prisma.organizationMember.findMany({
    where: {
      organizationId,
      user: {
        is: {
          isActive: true,
          projects: {
            none: { projectId },
          },
        },
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
          isOnline: true,
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  }).then((memberships) => memberships.map(({ user }) => user));
}

export async function addProjectMember(
  projectId: string,
  requesterId: string,
  userId: string,
  role: "admin" | "member"
) {
  const { organizationId } = await getOwnedProjectOrganizationScope(
    projectId,
    requesterId
  );

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      isActive: true,
      organizationMembers: {
        some: { organizationId },
      },
    },
  });

  if (!user) {
    throw new Error("User must be an active member of this project's organization");
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    }
  });

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  return prisma.projectMember.create({
    data: {
      projectId,
      userId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          position: true,
          isOnline: true,
          points: true,
        },
      },
    },
  });
}