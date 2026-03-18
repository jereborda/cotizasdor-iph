"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Smartphone, Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError("Email o contraseña incorrectos")
      setLoading(false)
      return
    }

    // Fetch profile to determine role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("No se pudo obtener el usuario")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role === "vendor") {
      router.replace("/vendedor")
    } else {
      router.replace("/")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
            <Smartphone className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">Cotizador iPhone AR</h1>
            <p className="text-sm text-muted-foreground">Ingresá con tu cuenta</p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <LogIn className="w-4 h-4 text-primary" />
              Iniciar sesión
            </CardTitle>
            <CardDescription>
              Usá las credenciales que te dieron
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border-transparent"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary border-transparent pr-10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando…" : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
