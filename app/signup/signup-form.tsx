"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
          Full Name
        </Label>
        <Input id="name" placeholder="Your name" autoComplete="name" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
          Phone <span className="text-muted-foreground/50">(optional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+92 300 000 0000"
          autoComplete="tel"
          {...register("phone")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {serverError && (
        <p className="text-xs text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0 group disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" /> Creating account…
          </>
        ) : (
          <>
            Create Account
            <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground pt-3">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
