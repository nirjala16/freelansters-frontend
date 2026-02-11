"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Loader2, EyeIcon, EyeOffIcon, ArrowRight, AlertCircle } from "lucide-react"
import userApi from "../api"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await userApi.post("/users/login", { email, password })

      localStorage.setItem("session", JSON.stringify(response.data))

      toast.success(
        <div className="flex gap-2 items-center">
          <span className="font-medium">Welcome back, {response.data.user.name}!</span>
        </div>,
        {
          duration: 3000,
        },
      )

      // Redirect user based on role
      if (response.data.user.role === "admin") {
        navigate("/adminDashboard")
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md mx-auto")}>
      <Card className="border-border/40 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="text-sm animate-in fade-in-50 slide-in-from-top-5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6">
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full relative overflow-hidden group transition-all"
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" />
                  <span>Continue with GitHub</span>
                  <span className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline underline-offset-4 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 pr-10"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 transition-all" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-border/30 pt-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?
            <Link
              to="/register"
              className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground space-y-1">
        <div>
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary hover:underline underline-offset-4 transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline underline-offset-4 transition-colors">
            Privacy Policy
          </a>
          .
        </div>
        <div>
          <Link to="/admin/login" className="text-muted-foreground/70 hover:text-primary transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}

