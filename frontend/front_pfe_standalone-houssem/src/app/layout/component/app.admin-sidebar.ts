import { Component, ElementRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import  { Router } from "@angular/router"
import { RippleModule } from "primeng/ripple"

@Component({
  selector: "app-admin-sidebar",
  standalone: true,
  imports: [CommonModule, RippleModule],
  template: `
        <div class="layout-sidebar">
            <div class="layout-menu">
                <ul class="layout-menu-root-list">
                    <li class="layout-menuitem-root-text">System Administration</li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/dashboard/admin')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-home layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">Dashboard</span>
                        </a>
                    </li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/dashboard/users')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-users layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">Manage Users</span>
                        </a>
                    </li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/dashboard/projects')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-briefcase layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">Manage Projects</span>
                        </a>
                    </li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/notifications')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-bell layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">Notifications</span>
                        </a>
                    </li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/meetings')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-calendar layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">Meetings</span>
                        </a>
                    </li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/statistics')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-chart-bar layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">Statistics</span>
                        </a>
                    </li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/system-settings')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-cog layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">System Settings</span>
                        </a>
                    </li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/backup-data')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-download layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">Backup Data</span>
                        </a>
                    </li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/view-logs')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-eye layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">View Logs</span>
                        </a>
                    </li>
                    
                    <li class="layout-menuitem">
                        <a (click)="navigateTo('/generate-report')" class="layout-menuitem-link" pRipple>
                            <i class="pi pi-fw pi-file-pdf layout-menuitem-icon"></i>
                            <span class="layout-menuitem-text">Generate Report</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `,
  styles: [
    `
        .layout-menuitem-link {
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            color: var(--text-color);
            text-decoration: none;
            transition: background-color 0.15s;
            border-radius: 6px;
            margin: 2px 0;
        }
        
        .layout-menuitem-link:hover {
            background-color: var(--surface-hover);
        }
        
        .layout-menuitem-icon {
            margin-right: 0.5rem;
            color: var(--primary-color);
        }
        
        .layout-menuitem-text {
            font-weight: 500;
        }
        
        .layout-menuitem-root-text {
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--text-color-secondary);
            margin: 1rem 1rem 0.5rem 1rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    `,
  ],
})
export class AppAdminSidebar {
  constructor(
    public el: ElementRef,
    private router: Router,
  ) {}

  navigateTo(route: string) {
    this.router.navigate([route])
  }
}
