import { inject } from "@angular/core"
import { Router } from "@angular/router"
import type { CanActivateFn } from "@angular/router"
import { TokenService } from "../services/token/token.service"

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const tokenService = inject(TokenService)
    const router = inject(Router)

    const token = tokenService.token

    if (!token) {
      router.navigate(["/auth/login"])
      return false
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const userRoles = payload.authorities || payload.roles || []

      // Check if user has any of the allowed roles
      const hasRequiredRole = allowedRoles.some((role) =>
        userRoles.some(
          (userRole: any) => (typeof userRole === "string" ? userRole : userRole.authority || userRole.name) === role,
        ),
      )

      if (hasRequiredRole) {
        return true
      }

      // Redirect to access denied page
      router.navigate(["/auth/access"])
      return false
    } catch (error) {
      console.error("Error parsing token:", error)
      router.navigate(["/auth/login"])
      return false
    }
  }
}
