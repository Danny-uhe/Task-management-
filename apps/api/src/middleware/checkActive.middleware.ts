import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";

/**
 * checkActive middleware
 *
 * Catches the case where a user is deactivated while their JWT is still valid.
 * Use on sensitive routes where immediate deactivation effect is important.
 *
 * Must be placed AFTER `authenticate`.
 *
 * Usage:
 *   router.use(authenticate, checkActive);
 */
export async function checkActive(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { isActive: true },
  });

  if (!user?.isActive) {
    res.status(401).json({
      success: false,
      message: "Your account has been deactivated. Contact your admin.",
    });
    return;
  }

  next();
}
