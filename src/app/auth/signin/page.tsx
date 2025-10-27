"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Store, Eye, EyeOff } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [touched, setTouched] = useState<{
    email?: boolean
    password?: boolean
  }>({})
  const router = useRouter()
  const { data: session, status } = useSession()

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please enter a valid email address"
        return ""
      
      case "password":
        if (!value) return "Password is required"
        return ""
      
      default:
        return ""
    }
  }

  const handleBlur = (name: string) => {
    setTouched({
      ...touched,
      [name]: true
    })

    const value = name === "email" ? email : password
    const error = validateField(name, value)
    setFieldErrors({
      ...fieldErrors,
      [name]: error
    })
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    if (touched.email) {
      const error = validateField("email", value)
      setFieldErrors({
        ...fieldErrors,
        email: error
      })
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    if (touched.password) {
      const error = validateField("password", value)
      setFieldErrors({
        ...fieldErrors,
        password: error
      })
    }
  }

  // Redirect if already signed in
  useEffect(() => {
    console.log("Session status:", status, "Session:", session)
    if (status === "authenticated" && session) {
      console.log("Redirecting to dashboard...")
      // Use replace to avoid back button issues
      router.replace("/dashboard")
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate all fields
    const errors: typeof fieldErrors = {}
    const emailError = validateField("email", email)
    const passwordError = validateField("password", password)
    
    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError

    // Mark all fields as touched
    setTouched({ email: true, password: true })

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError("Please fix the errors above before continuing")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("Sign in result:", result) // Debug log

      if (result?.error) {
        setError("Invalid email or password")
      } else if (result?.ok) {
        // Force a page reload to ensure session is properly set
        window.location.href = "/dashboard"
      } else {
        setError("Sign in failed. Please try again.")
      }
    } catch (error) {
      console.error("Sign in error:", error) // Debug log
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-blue-100 rounded-full p-3">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Loading...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Checking authentication status...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-100 rounded-full p-3">
            <Store className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur("email")}
                  className={`w-full ${fieldErrors.email && touched.email ? "border-red-500" : ""}`}
                  placeholder="Enter your email"
                />
              </div>
              {fieldErrors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur("password")}
                  className={`w-full pr-10 ${fieldErrors.password && touched.password ? "border-red-500" : ""}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {fieldErrors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo credentials</span>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Try these demo accounts:</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p><strong>Admin:</strong> admin@business.com / password123</p>
                <p><strong>Manager:</strong> manager@business.com / password123</p>
                <p><strong>User:</strong> user@business.com / password123</p>
              </div>
            </div>

            {/* Debug info - remove in production */}
            <div className="mt-4 bg-yellow-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>Debug:</strong> Status: {status} | Session: {session ? 'Active' : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
