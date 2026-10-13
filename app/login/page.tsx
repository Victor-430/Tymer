import { Check, ShieldCheck } from "lucide-react";
import { AuthBoundary } from "@/components/auth/auth-boundary";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return <AuthBoundary mode="guest">
    <div className="flex min-h-svh flex-col bg-muted/35">
     
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-10 sm:px-10 lg:grid-cols-2 lg:gap-24">
        <section className="hidden space-y-8 lg:block">
          <h1 className="text-6xl font-medium leading-[1.08] tracking-tight">Every team.<br /><span className="text-muted-foreground">In sync.</span></h1>
          <p className="max-w-sm text-lg leading-relaxed text-muted-foreground">A simpler way to stay on top of attendance, patrols, and the work that matters.</p>
          <ul className="space-y-3 text-sm">
            {["One workspace for your organization", "A clear view of your team's activity", "More time for what comes next"].map((item) => <li key={item} className="flex items-center gap-3"><span className="flex size-6 items-center justify-center rounded-full border border-border bg-background"><Check aria-hidden="true" className="size-3.5" /></span>{item}</li>)}
          </ul>
        </section>
        <Card className="mx-auto w-full max-w-md rounded-3xl shadow-xl shadow-foreground/5">
          <CardContent className="space-y-8 px-6 py-4 sm:px-9 sm:py-6">
            <div className="space-y-2"><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Welcome back</p><h2 className="text-3xl font-medium tracking-tight">Sign in to Tymer</h2><p className="text-sm leading-relaxed text-muted-foreground">Enter your admin credentials to open your workspace.</p></div>
            <LoginForm />
            <p className="flex items-center justify-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground"><ShieldCheck aria-hidden="true" className="size-4" />Your organization&apos;s workspace</p>
          </CardContent>
        </Card>
      </main>
      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">Tymer · Built for teams that move together</footer>
    </div>
  </AuthBoundary>;
}
