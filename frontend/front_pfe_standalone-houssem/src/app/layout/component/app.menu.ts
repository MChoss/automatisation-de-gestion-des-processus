import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import type { MenuItem } from "primeng/api"
import { AppMenuitem } from "./app.menuitem"

import { Subscription } from "rxjs"
import  { AuthService } from "../../services/auth.service"
import  { NavigationService } from "../../services/navigation.service"

@Component({
  selector: "app-menu",
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>`,
})
export class AppMenu implements OnInit, OnDestroy {
  model: MenuItem[] = []
  private subscription: Subscription = new Subscription()

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.updateMenu()

    this.subscription.add(
      this.authService.currentUser$.subscribe((user: any) => {
        this.updateMenu()
      }),
    )
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  private updateMenu(): void {
    this.model = this.navigationService.getMenuItems()
  }
}
