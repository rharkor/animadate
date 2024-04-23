"use client"

import * as React from "react"
import { ArrowBigDown, BadgeInfo } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { signInSchema } from "@/api/auth/schemas"
import { authRoutes } from "@/constants/auth"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { env } from "@/lib/env"
import { TDictionary } from "@/lib/langs"
import { cn, ensureRelativeUrl } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Card, CardBody, Link, Spinner } from "@nextui-org/react"

import TotpVerificationModal from "../profile/totp/totp-verification-modal"
import CheckMarkAnimation from "../ui/check-mark/check-mark"
import Copiable from "../ui/copiable"
import FormField from "../ui/form"

import { LoginUserAuthFormDr } from "./login-user-auth-form.dr"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  searchParams: { [key: string]: string | string[] | undefined }
  dictionary: TDictionary<typeof LoginUserAuthFormDr>
}

const formSchema = signInSchema

type IForm = z.infer<ReturnType<typeof formSchema>>

export function LoginUserAuthForm({ searchParams, dictionary, ...props }: UserAuthFormProps) {
  const callbackUrl = ensureRelativeUrl(searchParams.callbackUrl?.toString()) || authRoutes.redirectAfterSignIn
  const error = searchParams.error?.toString()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [errorDisplayed, setErrorDisplayed] = React.useState<string | null>(null)

  if (error && !error.startsWith("_") && (!errorDisplayed || errorDisplayed !== error)) {
    setErrorDisplayed(error)
    handleSignError(error, dictionary)
  }

  const form = useForm<IForm>({
    resolver: zodResolver(formSchema(dictionary)),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [isDesactivate2FAModalOpen, setDesactivate2FAModalOpen] = React.useState(false)
  const [otpPromiseResolve, setOtpPromiseResolve] = React.useState<(otp: string | null) => void>()

  const getOtpCode = () => {
    return new Promise<string>((resolve) => {
      setOtpPromiseResolve(() => resolve)
      setDesactivate2FAModalOpen(true)
    })
  }

  const [isSuccess, setIsSuccess] = React.useState(false)
  async function onSubmit(data: IForm) {
    setIsLoading(true)
    try {
      const isPushingRoute = await handleSignIn({ data, callbackUrl, dictionary, getOtpCode })
      setIsSuccess(true)
      //? If isPushingRoute is true, it means that the user is being redirected to the callbackUrl
      if (!isPushingRoute) setIsLoading(false)
    } catch (e) {
      setIsLoading(false)
    }
  }

  return (
    <div className="md:mt-3 md:rounded-large md:bg-content1/30 md:shadow-small md:backdrop-blur-xl">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
        className={cn(
          "relative !mt-1 flex w-full flex-col space-y-2",
          "md:!mt-0 md:w-[400px] md:px-8 md:py-6 md:pb-1",
          props.className
        )}
      >
        {env.NEXT_PUBLIC_IS_DEMO && (
          <Card className="relative bg-content1/30">
            <CardBody>
              <h3 className="flex flex-row items-center gap-1">
                <BadgeInfo className="size-4" />
                {dictionary.auth.demoMode}
              </h3>
              <div className="flex flex-col">
                <div className="m-1 flex flex-row items-center gap-1">
                  <p>{dictionary.email}:</p> <Copiable text={env.NEXT_PUBLIC_DEMO_EMAIL} dictionary={dictionary} />
                </div>
                <div className="m-1 flex flex-row items-center gap-1">
                  <p>{dictionary.password}</p> <Copiable text={env.NEXT_PUBLIC_DEMO_PASSWORD} dictionary={dictionary} />
                </div>
                <div
                  className="absolute bottom-2 right-2 cursor-pointer"
                  onClick={() => {
                    form.setValue("email", env.NEXT_PUBLIC_DEMO_EMAIL ?? "")
                    form.setValue("password", env.NEXT_PUBLIC_DEMO_PASSWORD ?? "")
                  }}
                >
                  <ArrowBigDown className="size-5" />
                </div>
              </div>
            </CardBody>
          </Card>
        )}
        <FormField
          form={form}
          name="email"
          label={dictionary.email}
          type="email"
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect="off"
          isDisabled={isLoading}
        />
        <FormField
          form={form}
          name={"password"}
          label={dictionary.password}
          type="password-eye-slash"
          autoComplete="current-password"
          autoCorrect="off"
          isDisabled={isLoading}
        />
        <Link className="ml-auto text-sm" href={"/forgot-password"}>
          {dictionary.forgotPassword}
        </Link>
        <Button
          type="submit"
          isDisabled={isLoading}
          color={isSuccess ? "success" : "primary"}
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
          {dictionary.signIn}
        </Button>
      </form>
      <h3 className={cn("!mt-0 text-start text-sm text-slate-100", "md:px-8 md:py-6 md:pt-0")}>
        {dictionary.auth.doNotHaveAccount}{" "}
        <Link className="text-sm" href={authRoutes.signUp[0]}>
          {dictionary.auth.signUp}
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
        title={dictionary.totp.enterCode}
        submitText={dictionary.confirm}
        closeText={dictionary.cancel}
        onlyPrompt
        curEmail={form.watch("email")}
      />
    </div>
  )
}
