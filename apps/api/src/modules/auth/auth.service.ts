import { prisma } from "../../config/prisma.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { RefreshInput, LogoutInput } from "./auth.validation.js";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.js";
import crypto from "node:crypto";
import { queuePasswordResetEmail } from "../../queues/email.queue.js";

// interface RegisterInput {
//   name: string;
//   email: string;
//   password: string;
// }

interface LoginInput {
  email: string;
  password: string;
}

// TEMPORARY: registration function.
// We will remove public registration after the invitation flow is complete.
// export async function registerUser(data: RegisterInput) {
//   const existingUser = await prisma.user.findUnique({
//     where: {
//       email: data.email,
//     },
//   });

//   if (existingUser) {
//     throw new Error("Email already exists");
//   }

//   const hashedPassword = await hashPassword(data.password);

//   const user = await prisma.user.create({
//     data: {
//       name: data.name,
//       email: data.email,
//       password: hashedPassword,
//     },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       createdAt: true,
//     },
//   });

//   return user;
// }

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error(
      "Your account has been deactivated. Contact your admin."
    );
  }

  if (!user.password) {
    throw new Error("Please accept your invitation first.");
  }

  const passwordMatches = await comparePassword(
    data.password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(
    user.id,
    user.systemRole
  );

  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      systemRole: user.systemRole,
      isActive: user.isActive,
    },
    accessToken,
    refreshToken,
  };
}

export async function getCurrentUser(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatar: true,
      position: true,
      isOnline: true,
      points: true,
      systemRole: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function refreshAccessToken(data: RefreshInput) {
  let payload;

  try {
    payload = verifyRefreshToken(data.refreshToken);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      token: data.refreshToken,
    },
  });

  if (!storedToken) {
    throw new Error("Refresh token not found");
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error("Refresh token expired");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      id: true,
      systemRole: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error(
      "Your account has been deactivated. Contact your admin."
    );
  }

  const accessToken = generateAccessToken(
    user.id,
    user.systemRole
  );

  return {
    accessToken,
  };
}

export async function logoutUser(data: LogoutInput) {
  await prisma.refreshToken.deleteMany({
    where: {
      token: data.refreshToken,
    },
  });

  return {
    message: "Logged Out Successfully",
  };
}

export async function logoutAllSessions(userId: string) {
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  });

  return {
    message: "Logged out from all devices",
  };
}

// ─── Password Reset ──────────────────────────────────────────────────────────

export async function requestPasswordReset(email: string) {
  // Always return the same message — prevents email enumeration attacks
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return { message: "If that email exists, a reset link has been sent." };
  }

  // Invalidate any existing unused reset tokens (only one active at a time)
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data:  { usedAt: new Date() },
  });

  // Create new token — expires in 1 hour
  const token     = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  // Queue the email — returns immediately
  await queuePasswordResetEmail({ to: user.email, userName: user.name, token });

  return { message: "If that email exists, a reset link has been sent." };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where:   { token },
    include: { user: true },
  });

  if (!resetToken)                       throw new Error("Invalid or expired reset link.");
  if (resetToken.usedAt)                 throw new Error("This reset link has already been used.");
  if (resetToken.expiresAt < new Date()) throw new Error("This reset link has expired. Request a new one.");

  const hashedPassword = await hashPassword(newPassword);

  await prisma.$transaction([
    // 1. Update password
    prisma.user.update({
      where: { id: resetToken.userId },
      data:  { password: hashedPassword },
    }),
    // 2. Mark token as used (single-use)
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data:  { usedAt: new Date() },
    }),
    // 3. Invalidate ALL sessions — force re-login on all devices
    prisma.refreshToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return { message: "Password updated. Please log in with your new password." };
}
