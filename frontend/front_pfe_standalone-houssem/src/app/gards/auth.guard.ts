import { inject } from "@angular/core"
import { Router } from "@angular/router"
import type { CanActivateFn } from "@angular/router"
import { TokenService } from "../services/token/token.service"

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService)
  const router = inject(Router)

  const token = tokenService.token

  if (token) {
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Math.floor(Date.now() / 1000)

      if (payload.exp && payload.exp > currentTime) {
        return true
      }
    } catch (error) {
      console.error("Invalid token format:", error)
    }
  }

  // Redirect to login if not authenticated
  router.navigate(["/auth/login"], {
    queryParams: { returnUrl: state.url },
  })
  return false
}
