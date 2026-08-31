-- DropForeignKey
ALTER TABLE "projectMember" DROP CONSTRAINT "projectMember_projectId_fkey";

-- AddForeignKey
ALTER TABLE "projectMember" ADD CONSTRAINT "projectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
