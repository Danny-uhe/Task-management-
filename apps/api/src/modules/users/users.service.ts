import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma.js";
import { hashPassword } from "../../utils/password.js";

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
        name?: string;
        email?: string;
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
            systemRole: true,
            isActive: true,
            updatedAt: true,
        },
    });
}

export async function changePassword(
    userId: string,
    data: {
        currentPassword: string;
        newPassword: string;
    }
) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.password) {
        throw new Error("User has no password set");
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { message: "Password updated successfully" };
}