"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormValues = z.infer<typeof schema>

export function SignupForm() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || "Failed to create account")
        return
      }
      toast.success(`Welcome, ${json.user.name.split(" ")[0]}`)
      await refresh()
      router.push("/")
      router.refresh()
    } catch {
      setServerError("Something went wrong. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <div className="auth-form__field">
        <label htmlFor="name" className="auth-form__label">Full name</label>
        <input
          id="name"
          placeholder="Your name"
          autoComplete="name"
          className="auth-form__input"
          {...register("name")}
        />
        {errors.name && <p className="auth-form__error">{errors.name.message}</p>}
      </div>

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
        <label htmlFor="phone" className="auth-form__label">
          Phone <span className="auth-form__label-hint">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+92 300 000 0000"
          autoComplete="tel"
          className="auth-form__input"
          {...register("phone")}
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="password" className="auth-form__label">Password</label>
        <input
          id="password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          className="auth-form__input"
          {...register("password")}
        />
        {errors.password && <p className="auth-form__error">{errors.password.message}</p>}
      </div>

      {serverError && <p className="auth-form__server-error">{serverError}</p>}

      <button type="submit" disabled={isSubmitting} className="tfi-pill auth-form__submit">
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="auth-form__spinner" /> Creating account…
          </>
        ) : (
          <>
            <span className="arrow">↳</span>Create account
          </>
        )}
      </button>

      <p className="auth-form__footer">
        Already have an account?{" "}
        <Link href="/login" className="auth-form__link">
          Sign in
        </Link>
      </p>
    </form>
  )
}
