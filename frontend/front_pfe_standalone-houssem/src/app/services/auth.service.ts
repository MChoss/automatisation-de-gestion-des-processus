import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import  { TokenService } from "./token/token.service"
import  { Router } from "@angular/router"

export interface UserInfo {
  id: number
  email: string
  fullName: string
  roles: string[]
  authorities: string[]
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(
    private tokenService: TokenService,
    private router: Router,
  ) {
    this.loadCurrentUser()
  }

  private loadCurrentUser(): void {
    const token = this.tokenService.token
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const userInfo: UserInfo = {
          id: payload.sub || payload.userId,
          email: payload.email || payload.username,
          fullName: payload.fullName || payload.name || "User",
          roles: payload.roles || [],
          authorities: payload.authorities || [],
        }
        this.currentUserSubject.next(userInfo)
      } catch (error) {
        console.error("Error parsing token:", error)
        this.logout()
      }
    }
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value
  }

  getUserId(): number | null {
    const user = this.getCurrentUser()
    return user ? user.id : null
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    return user.roles.includes(role) || user.authorities.some((auth) => auth === role)
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role))
  }

  isAdmin(): boolean {
    return this.hasRole("ADMIN") || this.hasRole("ROLE_ADMIN")
  }

  isProductOwner(): boolean {
    return this.hasRole("PRODUCT_OWNER") || this.hasRole("ROLE_PRODUCT_OWNER")
  }

  isScrumMaster(): boolean {
    return this.hasRole("SCRUM_MASTER") || this.hasRole("ROLE_SCRUM_MASTER")
  }

  getDashboardRoute(): string {
    if (this.isAdmin()) {
      return "/dashboard/admin"
    } else if (this.isProductOwner()) {
      return "/dashboard/product-owner"
    } else if (this.isScrumMaster()) {
      return "/dashboard/scrum-master"
    }
    return "/dashboard"
  }

  logout(): void {
    localStorage.removeItem("token")
    this.currentUserSubject.next(null)
    this.router.navigate(["/auth/login"])
  }

  updateUserInfo(token: string): void {
    this.tokenService.token = token
    this.loadCurrentUser()
  }
}
