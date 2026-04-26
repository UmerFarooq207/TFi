import type { Metadata } from "next"
import { SignupForm } from "./signup-form"

export const metadata: Metadata = {
  title: "Create an Account",
}

export default function SignupPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 lg:px-10 py-24"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 20% 55%, oklch(0.18 0.018 60 / 0.7), transparent 60%), oklch(0.09 0.006 55)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-10 text-center space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-accent">Get started</p>
          <h1 className="font-heading text-4xl font-medium text-foreground leading-[1] tracking-tight">
            Create your account
            <span className="block italic text-foreground/30 text-3xl mt-1">
              shop with intention
            </span>
          </h1>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
