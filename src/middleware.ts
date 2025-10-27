import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith("/auth/")) {
          return true
        }
        
        // Allow access to home page without token
        if (req.nextUrl.pathname === "/") {
          return true
        }
        
        // Require token for all other pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/funeral-homes/:path*",
    "/ceremonies/:path*",
    "/products/:path*",
    "/suppliers/:path*",
    "/orders/:path*",
    "/organizations/:path*",
  ]
}
