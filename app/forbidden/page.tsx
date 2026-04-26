import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export const metadata = {
  title: "Access Denied",
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 lg:px-10 py-24">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="w-14 h-14 mx-auto flex items-center justify-center bg-accent/15">
          <ShieldAlert size={22} className="text-accent" />
        </div>
        <div className="space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-accent">403 Forbidden</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-medium text-foreground leading-[1.05] tracking-tight">
            Access Denied
            <span className="block italic text-foreground/30">restricted area</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            You don&apos;t have permission to view this page. The admin panel is reserved for authorised TFi staff.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="px-8 h-12 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0"
          >
            <Link href="/">Back to Home</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="px-8 h-12 text-xs tracking-[0.2em] uppercase border-border"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
