import { rolesAsObject } from "@/constants"
import { hash } from "@/lib/bcrypt"
import { env } from "@/lib/env"
import { cmd, logger } from "@animadate/lib"

import { mock } from "./mock"
import { prisma, spinner } from "./utils"

// Check if the params --mock or -m are passed
const withMock = process.argv.includes("--mock") || process.argv.includes("-m")
if (withMock) logger.info("Mock mode enabled")

async function main() {
  try {
    //* Admin
    const adminExists = await prisma.user.findFirst({
      where: {
        email: env.AUTH_ADMIN_EMAIL,
      },
    })
    if (!adminExists) {
      const task = cmd.startTask({
        name: "Creating admin",
        successMessage: "Admin created",
      })
      await prisma.user.create({
        data: {
          email: env.AUTH_ADMIN_EMAIL as string,
          password: await hash(env.AUTH_ADMIN_PASSWORD ?? "", 12),
          role: rolesAsObject.admin,
          emailVerified: new Date(),
          hasPassword: true,
          name: "Admin",
        },
      })
      task.stop()
    } else {
      logger.log("Admin already exists")
    }

    //* Mock
    if (withMock) {
      await mock()
    }
  } catch (e) {
    logger.error(e)
    process.exit(1)
  } finally {
    spinner?.stop(true)
    await prisma.$disconnect()
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    logger.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
