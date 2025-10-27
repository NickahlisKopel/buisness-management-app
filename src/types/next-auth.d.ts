import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      organizationId: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
    organizationId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    organizationId: string
  }
}
