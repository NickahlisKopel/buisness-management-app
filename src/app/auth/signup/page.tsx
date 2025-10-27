"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Store, Eye, EyeOff, Building2, Users } from "lucide-react"

export default function SignUpPage() {
  const [accountType, setAccountType] = useState<"create" | "join">("create")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    inviteCode: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    organizationName?: string
    inviteCode?: string
  }>({})
  const [touched, setTouched] = useState<{
    name?: boolean
    email?: boolean
    password?: boolean
    confirmPassword?: boolean
    organizationName?: boolean
    inviteCode?: boolean
  }>({})

  const router = useRouter()

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength: 1, label: "Weak", color: "bg-red-500" }
    if (strength <= 4) return { strength: 2, label: "Fair", color: "bg-yellow-500" }
    if (strength <= 5) return { strength: 3, label: "Good", color: "bg-blue-500" }
    return { strength: 4, label: "Strong", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        return ""
      
      case "email":
        if (!value.trim()) return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please enter a valid email address"
        return ""
      
      case "password":
        if (!value) return "Password is required"
        if (value.length < 6) return "Password must be at least 6 characters"
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter"
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter"
        if (!/[0-9]/.test(value)) return "Password must contain at least one number"
        return ""
      
      case "confirmPassword":
        if (!value) return "Please confirm your password"
        if (value !== formData.password) return "Passwords do not match"
        return ""
      
      case "organizationName":
        if (accountType === "create") {
          if (!value.trim()) return "Organization name is required"
          if (value.trim().length < 2) return "Organization name must be at least 2 characters"
        }
        return ""
      
      case "inviteCode":
        if (accountType === "join") {
          if (!value.trim()) return "Invite code is required"
          if (value.trim().length !== 8) return "Invite code must be exactly 8 characters"
          if (!/^[A-Z0-9]+$/i.test(value)) return "Invite code must contain only letters and numbers"
        }
        return ""
      
      default:
        return ""
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let processedValue = value
    
    // Auto-uppercase invite code
    if (name === "inviteCode") {
      processedValue = value.toUpperCase()
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    })

    // Validate on change if field has been touched
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, processedValue)
      setFieldErrors({
        ...fieldErrors,
        [name]: error
      })
    }
  }

  const handleBlur = (name: string) => {
    setTouched({
      ...touched,
      [name]: true
    })

    const error = validateField(name, formData[name as keyof typeof formData])
    setFieldErrors({
      ...fieldErrors,
      [name]: error
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate all fields
    const errors: typeof fieldErrors = {}
    const fieldsToValidate = ["name", "email", "password", "confirmPassword"]
    
    if (accountType === "create") {
      fieldsToValidate.push("organizationName")
    } else {
      fieldsToValidate.push("inviteCode")
    }

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) {
        errors[field as keyof typeof fieldErrors] = error
      }
    })

    // Mark all fields as touched
    const allTouched: typeof touched = {}
    fieldsToValidate.forEach(field => {
      allTouched[field as keyof typeof touched] = true
    })
    setTouched(allTouched)

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError("Please fix the errors above before continuing")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          accountType,
          organizationName: accountType === "create" ? formData.organizationName : undefined,
          inviteCode: accountType === "join" ? formData.inviteCode : undefined,
        }),
      })

      if (response.ok) {
        router.push("/auth/signin?message=Account created successfully")
      } else {
        const data = await response.json()
        setError(data.error || "An error occurred")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Account Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to get started?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("create")}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                  accountType === "create"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Building2 className={`h-6 w-6 mb-2 ${
                  accountType === "create" ? "text-blue-600" : "text-gray-400"
                }`} />
                <span className={`text-sm font-medium ${
                  accountType === "create" ? "text-blue-900" : "text-gray-700"
                }`}>
                  Create Organization
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  Start your own
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setAccountType("join")}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                  accountType === "join"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Users className={`h-6 w-6 mb-2 ${
                  accountType === "join" ? "text-blue-600" : "text-gray-400"
                }`} />
                <span className={`text-sm font-medium ${
                  accountType === "join" ? "text-blue-900" : "text-gray-700"
                }`}>
                  Join Organization
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  Use invite code
                </span>
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur("name")}
                  className={`w-full ${fieldErrors.name && touched.name ? "border-red-500" : ""}`}
                  placeholder="Enter your full name"
                />
              </div>
              {fieldErrors.name && touched.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  className={`w-full ${fieldErrors.email && touched.email ? "border-red-500" : ""}`}
                  placeholder="Enter your email"
                />
              </div>
              {fieldErrors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Organization Name or Invite Code */}
            {accountType === "create" ? (
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                  Organization name
                </label>
                <div className="mt-1">
                  <Input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("organizationName")}
                    className={`w-full ${fieldErrors.organizationName && touched.organizationName ? "border-red-500" : ""}`}
                    placeholder="Enter your organization name"
                  />
                </div>
                {fieldErrors.organizationName && touched.organizationName ? (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.organizationName}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    This will be the name of your organization
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
                  Invite code
                </label>
                <div className="mt-1">
                  <Input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    required
                    value={formData.inviteCode}
                    onChange={handleChange}
                    onBlur={() => handleBlur("inviteCode")}
                    className={`w-full uppercase ${fieldErrors.inviteCode && touched.inviteCode ? "border-red-500" : ""}`}
                    placeholder="Enter 8-character code"
                    maxLength={8}
                  />
                </div>
                {fieldErrors.inviteCode && touched.inviteCode ? (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.inviteCode}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the invite code provided by your organization
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  className={`w-full pr-10 ${fieldErrors.password && touched.password ? "border-red-500" : ""}`}
                  placeholder="Create a password"
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 1 ? "text-red-600" :
                      passwordStrength.strength === 2 ? "text-yellow-600" :
                      passwordStrength.strength === 3 ? "text-blue-600" :
                      "text-green-600"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1 relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`w-full pr-10 ${fieldErrors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : accountType === "create" ? "Create Organization & Account" : "Join Organization"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
