"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { signUpSchema } from "@/api/auth/schemas"
import PrivacyAcceptance from "@/app/[lang]/(sys-auth)/privacy-acceptance"
import { authRoutes } from "@/constants/auth"
import useIsMobile from "@/hooks/use-is-mobile"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { handleMutationError } from "@/lib/utils/client-utils"
import { logger } from "@animadate/lib"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Link, Spinner } from "@nextui-org/react"

import TotpVerificationModal from "../profile/totp/totp-verification-modal"
import CheckMarkAnimation from "../ui/check-mark/check-mark"
import FormField from "../ui/form"

import { formSchemaDr, RegisterUserAuthFormDr } from "./register-user-auth-form.dr"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  searchParams?: { [key: string]: string | string[] | undefined }
  locale: string
  dictionary: TDictionary<typeof RegisterUserAuthFormDr>
}

const formSchema0 = (dictionary: TDictionary<typeof formSchemaDr>) =>
  signUpSchema(dictionary).pick({
    name: true,
    email: true,
  })
const formSchema1 = (dictionary: TDictionary<typeof formSchemaDr>) =>
  signUpSchema(dictionary)
    .omit({
      name: true,
      email: true,
    })
    .extend({
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: dictionary.errors.password.dontMatch,
          path: ["confirmPassword"],
          fatal: true,
        })
      }
    })

export type IForm0 = z.infer<ReturnType<typeof formSchema0>>
export type IForm1 = z.infer<ReturnType<typeof formSchema1>>

export function RegisterUserAuthForm({ searchParams, locale, dictionary, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [isDesactivate2FAModalOpen, setDesactivate2FAModalOpen] = React.useState(false)
  const [otpPromiseResolve, setOtpPromiseResolve] = React.useState<(otp: string | null) => void>()

  const getOtpCode = () => {
    return new Promise<string>((resolve) => {
      setOtpPromiseResolve(() => resolve)
      setDesactivate2FAModalOpen(true)
    })
  }

  const registerMutation = trpc.auth.register.useMutation({
    onError: (error) => {
      setIsLoading(false)
      const { message, code } = handleMutationError(error, dictionary, router, { showNotification: false })
      if (code?.toLowerCase().includes("email")) {
        setFormStep(0)
        return form0.setError("email", {
          type: "manual",
          message,
        })
      } else {
        handleMutationError(error, dictionary, router)
      }
    },
    meta: {
      noDefaultErrorHandling: true,
    },
    onSuccess: (_, vars) => {
      logger.debug("Sign up successful")
      handleSignIn({
        data: { email: vars.email, password: vars.password },
        callbackUrl: authRoutes.redirectAfterSignIn,
        dictionary,
        getOtpCode,
      }).catch((error) => {
        logger.error("Error while signing in after sign up", error)
        setIsLoading(false)
      })
    },
  })

  const error = searchParams?.error?.toString()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const [errorDisplayed, setErrorDisplayed] = React.useState<string | null>(null)

  const form0 = useForm<IForm0>({
    resolver: zodResolver(formSchema0(dictionary)),
    defaultValues: {
      email: "",
      name: "",
    },
  })
  const form1 = useForm<IForm1>({
    resolver: zodResolver(formSchema1(dictionary)),
    defaultValues: {
      password: "",
      confirmPassword: "",
      locale,
    },
  })

  if (error && (!errorDisplayed || errorDisplayed !== error)) {
    setErrorDisplayed(error)
    handleSignError(error, dictionary)
  }

  async function onSubmit(data: IForm1) {
    setIsLoading(true)
    const form0Values = form0.getValues()
    const fullData: IForm0 & IForm1 = {
      ...data,
      ...form0Values,
    }
    logger.debug("Signing up with credentials", fullData)
    registerMutation.mutate(fullData)
  }

  const [formStep, setFormStep] = React.useState<number>(0)
  const nameRef = React.useRef<HTMLInputElement>(null)
  const passwordRef = React.useRef<HTMLInputElement>(null)

  const onNext = () => {
    setFormStep((prev) => prev + 1)
  }

  const onPrev = () => {
    setFormStep((prev) => prev - 1)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    form1.handleSubmit(onSubmit)(e)
  }

  const handleNext = (e: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form0.handleSubmit(onNext)(e as unknown as React.BaseSyntheticEvent)
  }

  // Auto focus password field when moving to step 1
  React.useEffect(() => {
    if (formStep === 0) {
      const currentNameRef = nameRef.current
      if (!currentNameRef) return
      // Prevent auto focus on mobile
      if (isMobile) return
      currentNameRef.focus({
        preventScroll: true,
      })
    }

    if (formStep === 1) {
      const currentPasswordRef = passwordRef.current
      if (!currentPasswordRef) return
      setTimeout(() => {
        currentPasswordRef.focus({
          preventScroll: true,
        })
      }, 400)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formStep])

  const isSuccess = registerMutation.isSuccess

  return (
    <div className="md:mt-3 md:rounded-large md:bg-[#FAFFFF] md:shadow-small">
      <form
        onSubmit={handleSubmit}
        {...props}
        className={cn(
          "relative -left-3 !mt-1 flex w-screen flex-col space-y-2 overflow-hidden p-1 px-2",
          "md:-left-0 md:!mt-0 md:w-[400px] md:px-8 md:py-6 md:pb-1",
          props.className
        )}
      >
        <motion.div
          className="flex w-[calc(200%+36px)] flex-row gap-9"
          animate={{
            translateX: `calc(-${(formStep / 2) * 100}% - ${formStep * 18}px)`,
          }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
        >
          <div
            className="flex-1 space-y-2 px-1 transition-all md:px-0"
            aria-hidden={formStep !== 0}
            style={{
              pointerEvents: formStep !== 0 ? "none" : "auto",
            }}
          >
            <FormField
              form={form0}
              name="name"
              label={dictionary.auth.name}
              type="text"
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect="off"
              isDisabled={isLoading}
              tabIndex={formStep !== 0 ? -1 : 0}
              inputRef={nameRef}
            />
            <FormField
              form={form0}
              name="email"
              label={dictionary.email}
              type="email"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              isDisabled={isLoading}
              tabIndex={formStep !== 0 ? -1 : 0}
            />
          </div>
          <div
            className="flex-1 space-y-2 px-1 transition-all md:px-0"
            aria-hidden={formStep !== 1}
            style={{
              pointerEvents: formStep !== 1 ? "none" : "auto",
            }}
          >
            <FormField
              form={form1}
              name="password"
              label={dictionary.password}
              type="password-eye-slash"
              autoComplete="new-password"
              autoCorrect="off"
              isDisabled={isLoading}
              passwordStrength
              dictionary={dictionary}
              tabIndex={formStep !== 1 ? -1 : 0}
              passwordtoggleVisibilityProps={{
                tabIndex: formStep !== 1 ? -1 : 0,
              }}
              inputRef={passwordRef}
            />
            <FormField
              form={form1}
              name="confirmPassword"
              label={dictionary.confirmPassword}
              type="password"
              autoComplete="off"
              autoCorrect="off"
              isDisabled={isLoading}
              tabIndex={formStep !== 1 ? -1 : 0}
            />
          </div>
        </motion.div>
        <PrivacyAcceptance className="mx-1 text-muted md:mx-0 md:text-muted-foreground" dictionary={dictionary} />
        <div className="mx-1 flex flex-row md:mx-0">
          <Button
            color="default"
            variant="flat"
            className="size-8 min-w-0 p-0 !transition-all"
            style={{
              maxWidth: formStep !== 1 ? "0px" : "32px",
              marginRight: formStep !== 1 ? "0px" : "0.25rem",
              opacity: formStep !== 1 ? 0 : 1,
            }}
            onPress={onPrev}
            tabIndex={formStep !== 1 ? -1 : 0}
            isDisabled={isLoading}
          >
            <ChevronLeft className="size-4 shrink-0" />
          </Button>
          {formStep === 1 ? (
            <Button
              type="submit"
              isDisabled={isLoading}
              color={isSuccess ? "success" : "primary"}
              className="flex-1"
              key={"submit"}
              startContent={
                isSuccess ? (
                  <CheckMarkAnimation className="size-6 text-success-foreground" />
                ) : isLoading ? (
                  <Spinner
                    classNames={{
                      wrapper: "size-4",
                    }}
                    color="current"
                    size="sm"
                  />
                ) : (
                  <></>
                )
              }
            >
              {isSuccess ? dictionary.auth.signUpSuccess : dictionary.signUp}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              onKeyDown={(e) => {
                if (e.defaultPrevented) return
                if (e.key === "Enter" || e.key === " ") {
                  handleNext(e)
                }
              }}
              isLoading={isLoading}
              color="primary"
              className="flex-1"
              key={"next"}
            >
              {dictionary.signUp}
            </Button>
          )}
        </div>
      </form>
      <h3 className={cn("!mt-0 text-start text-sm text-slate-100", "md:px-8 md:py-6 md:pt-0 md:text-foreground")}>
        {dictionary.auth.alreadyHaveAnAccount}{" "}
        <Link className="text-sm" href={authRoutes.signIn[0]}>
          {dictionary.auth.login}
        </Link>
      </h3>
      <TotpVerificationModal
        dictionary={dictionary}
        isOpen={isDesactivate2FAModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen && otpPromiseResolve) {
            otpPromiseResolve(null)
          }
          setDesactivate2FAModalOpen(isOpen)
        }}
        onConfirm={(otp) => {
          if (otpPromiseResolve) {
            otpPromiseResolve(otp)
            setDesactivate2FAModalOpen(false)
          }
        }}
        title={dictionary.totp.desactivateTitle}
        submitText={dictionary.totp.desactivate}
        closeText={dictionary.cancel}
        onlyPrompt
      />
    </div>
  )
}
