import { prisma } from "../../config/prisma.js";

export async function getAllUsers() {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            avatar: true,
            position: true,
            isOnline: true,
            createdAt: true,
        },
        orderBy: {
            name: "asc",
        },
    });
};



export async function updateProfile(
    userId: string,
    data: {
        bio?: string;
        position?: string;
        avatar?: string;
    }
) {
    return prisma.user.update({
        where: {
            id: userId,
        },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            avatar: true,
            position: true,
            isOnline: true,
            updatedAt: true,
        },
    });
}