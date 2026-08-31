import { PrismaClient, SystemRole } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TaskSync...");

  // 1. Create the default organization
  const organization = await prisma.organization.upsert({
    where: {
      id: "org_default",
    },
    update: {},
    create: {
      id: "org_default",
      name: "TaskSync",
      description: "TaskSync Organization",
    },
  });

  // 2. Admin credentials
  const email = "talk2thexora@gmail.com";
  const password = "Admin123!";

  const hashedPassword = await hashPassword(password);

  // 3. Create/update the admin user
  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      systemRole: SystemRole.admin,
      isActive: true,
      password: hashedPassword,
    },
    create: {
      name: "TaskSync Admin",
      email,
      password: hashedPassword,
      systemRole: SystemRole.admin,
      isActive: true,
    },
  });

  // 4. Add admin to the organization
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: admin.id,
      },
    },
    update: {
      role: "admin",
    },
    create: {
      organizationId: organization.id,
      userId: admin.id,
      role: "admin",
    },
  });

  console.log("✅ Seed complete");
  console.log("");
  console.log("Organization:");
  console.log({
    id: organization.id,
    name: organization.name,
  });

  console.log("");
  console.log("Admin:");
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    systemRole: admin.systemRole,
    isActive: admin.isActive,
  });

  console.log("");
  console.log("⚠️ Change the admin password after first login.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });