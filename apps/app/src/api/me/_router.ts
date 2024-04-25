import {
  changeEmailResponseSchema,
  changeEmailSchema,
  changePasswordResponseSchema,
  changePasswordSchema,
  deleteAccountResponseSchema,
  deleteSessionResponseSchema,
  deleteSessionSchema,
  forgotPasswordResponseSchema,
  forgotPasswordSchema,
  getAccountResponseSchema,
  getActiveSessionsResponseSchema,
  getActiveSessionsSchema,
  needHelpResponseSchema,
  needHelpSchema,
  resetPasswordResponseSchema,
  resetPasswordSchema,
  sendVerificationEmailResponseSchema,
  sendVerificationEmailSchema,
  updateUserResponseSchema,
  updateUserSchema,
  validateChangeEmailResponseSchema,
  validateChangeEmailSchema,
  verifyEmailResponseSchema,
  verifyEmailSchema,
} from "@/api/me/schemas"
import {
  authenticatedNoEmailVerificationProcedure,
  authenticatedProcedure,
  publicProcedure,
  router,
} from "@/lib/server/trpc"

import { changeEmail, sendVerificationEmail, validateChangeEmail, verifyEmail } from "./email/mutations"
import { changePassword, forgotPassword, resetPassword } from "./password/mutations"
import { deleteSession } from "./sessions/mutations"
import { getActiveSessions } from "./sessions/queries"
import { deleteAccount, needHelp, updateUser } from "./mutations"
import { getAccount } from "./queries"

export const meRouter = router({
  updateUser: authenticatedProcedure.input(updateUserSchema()).output(updateUserResponseSchema()).mutation(updateUser),
  getActiveSessions: authenticatedNoEmailVerificationProcedure
    .input(getActiveSessionsSchema())
    .output(getActiveSessionsResponseSchema())
    .query(getActiveSessions),
  deleteSession: authenticatedNoEmailVerificationProcedure
    .input(deleteSessionSchema())
    .output(deleteSessionResponseSchema())
    .mutation(deleteSession),
  getAccount: authenticatedNoEmailVerificationProcedure.output(getAccountResponseSchema()).query(getAccount),
  deleteAccount: authenticatedNoEmailVerificationProcedure
    .output(deleteAccountResponseSchema())
    .mutation(deleteAccount),
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema())
    .output(forgotPasswordResponseSchema())
    .mutation(forgotPassword),
  resetPassword: publicProcedure
    .input(resetPasswordSchema())
    .output(resetPasswordResponseSchema())
    .mutation(resetPassword),
  sendVerificationEmail: authenticatedNoEmailVerificationProcedure
    .input(sendVerificationEmailSchema())
    .output(sendVerificationEmailResponseSchema())
    .mutation(sendVerificationEmail),
  verifyEmail: publicProcedure.input(verifyEmailSchema()).output(verifyEmailResponseSchema()).mutation(verifyEmail),
  needHelp: authenticatedProcedure.input(needHelpSchema()).output(needHelpResponseSchema()).mutation(needHelp),
  changeEmail: authenticatedProcedure
    .input(changeEmailSchema())
    .output(changeEmailResponseSchema())
    .mutation(changeEmail),
  validateChangeEmail: authenticatedProcedure
    .input(validateChangeEmailSchema())
    .output(validateChangeEmailResponseSchema())
    .mutation(validateChangeEmail),
  changePassword: authenticatedProcedure
    .input(changePasswordSchema())
    .output(changePasswordResponseSchema())
    .mutation(changePassword),
})
