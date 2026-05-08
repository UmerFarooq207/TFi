"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  const { refresh } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || "Failed to sign in")
        return
      }
      toast.success(`Welcome back, ${json.user.name.split(" ")[0]}`)
      await refresh()
      const target = from || "/admin"
      router.push(target)
      router.refresh()
    } catch {
      setServerError("Something went wrong. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <div className="auth-form__field">
        <label htmlFor="email" className="auth-form__label">Email</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="auth-form__input"
          {...register("email")}
        />
        {errors.email && <p className="auth-form__error">{errors.email.message}</p>}
      </div>

      <div className="auth-form__field">
        <label htmlFor="password" className="auth-form__label">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="auth-form__input"
          {...register("password")}
        />
        {errors.password && <p className="auth-form__error">{errors.password.message}</p>}
      </div>

      {serverError && <p className="auth-form__server-error">{serverError}</p>}

      <button type="submit" disabled={isSubmitting} className="tfi-pill auth-form__submit">
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="auth-form__spinner" /> Signing in…
          </>
        ) : (
          <>
            <span className="arrow">↳</span>Sign in
          </>
        )}
      </button>

    </form>
  )
}
