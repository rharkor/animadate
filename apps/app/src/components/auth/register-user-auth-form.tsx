"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { isMobile } from "react-device-detect"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { signUpSchema } from "@/api/auth/schemas"
import PrivacyAcceptance from "@/app/[lang]/(sys-auth)/privacy-acceptance"
import { authRoutes } from "@/constants/auth"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { handleMutationError } from "@/lib/utils/client-utils"
import { logger } from "@animadate/lib"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Link } from "@nextui-org/react"

import TotpVerificationModal from "../profile/totp/totp-verification-modal"
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
      const translatedError = handleMutationError(error, dictionary, router, { showNotification: false })
      if (error.message.includes("email")) {
        setFormStep(0)
        return form0.setError("email", {
          type: "manual",
          message: translatedError.message,
        })
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
        router,
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
    // Reset following forms
    // form1.reset(undefined, { keepValues: true })

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
      currentPasswordRef.focus({
        preventScroll: true,
      })
    }
  }, [formStep])

  return (
    <>
      <form
        onSubmit={handleSubmit}
        {...props}
        className={cn("relative -left-2 !mt-1 flex w-screen flex-col space-y-2 overflow-hidden p-1", props.className)}
      >
        <div
          className="flex w-[200%] flex-row gap-2 transition-all"
          style={{
            transform: `translateX(-${(formStep / 2) * 100}%)`,
          }}
        >
          <div
            className="flex-1 space-y-2 px-1 transition-all"
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
            className="flex-1 space-y-2 px-1 transition-all"
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
        </div>
        <PrivacyAcceptance className="mx-1" dictionary={dictionary} />
        <div className="mx-1 flex flex-row">
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
            <Button type="submit" isLoading={isLoading} color="primary" className="flex-1" key={"submit"}>
              {dictionary.signUp}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              onKeyDown={(e) => {
                if (e.defaultPrevented) return
                e.preventDefault()
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
      <h3 className="!mt-0 text-start text-sm">
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
    </>
  )
}
