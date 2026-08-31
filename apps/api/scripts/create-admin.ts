import { PrismaClient, SystemRole } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;

  if (!email || !password || !name) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set"
    );
  }

  if (password.length < 20) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 20 characters long"
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    if (existingUser.systemRole === SystemRole.admin) {
      console.log("Admin already exists.");
      return;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        systemRole: SystemRole.admin,
        isActive: true,
        password: await hashPassword(password),
      },
    });

    console.log("Existing user promoted to admin.");
    console.log({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      systemRole: updatedUser.systemRole,
    });

    return;
  }

  const hashedPassword = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      systemRole: SystemRole.admin,
      isActive: true,
    },
  });

  console.log("Production admin created successfully.");
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    systemRole: admin.systemRole,
  });
}

main()
  .catch((error) => {
    console.error("Failed to create admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });