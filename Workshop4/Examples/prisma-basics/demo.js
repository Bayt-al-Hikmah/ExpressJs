import prisma from "./db/prisma.js";

async function main() {
  const user = await prisma.user.create({ data: { username: "demo_user" } });
  const project = await prisma.project.create({
    data: { title: "Learning Prisma", user: { connect: { id: user.id } } }
  });
  await prisma.task.createMany({
    data: [
      { title: "Define schema", projectId: project.id },
      { title: "Run migration", projectId: project.id }
    ]
  });
  const result = await prisma.project.findUnique({
    where: { id: project.id },
    include: { tasks: true, user: true }
  });
  console.log(JSON.stringify(result, null, 2));
  await prisma.user.delete({ where: { id: user.id } }); // cascade cleanup
}

main().catch(console.error).finally(() => prisma.$disconnect());
