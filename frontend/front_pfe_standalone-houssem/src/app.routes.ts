import type { Routes } from "@angular/router"
import { Dashboard } from "./app/pages/dashboard/dashboard"
import { Documentation } from "./app/pages/documentation/documentation"
import { Landing } from "./app/pages/landing/landing"
import { Notfound } from "./app/pages/notfound/notfound"
import { AllProjectsComponent } from "./app/pages/projects/all-projects/all-projects.component"
import { ProjectDetailsComponent } from "./app/pages/projects/project-details/project-details.component"
import { ProductBacklogComponent } from "./app/pages/backlog/product-backlog/product-backlog.component"
import { AllSprintsComponent } from "./app/pages/sprints/all-sprints/all-sprints.component"
import { AllUserstoriesComponent } from "./app/pages/userstories/all-userstories/all-userstories.component"
import { AllUsersComponent } from "./app/pages/users/all-users/all-users.component"
import { Empty } from "./app/pages/empty/empty"
import { SprintBacklogComponent } from "./app/pages/sprintbacklog/sprintbacklog.component"
import { BacklogItemsComponent } from "./app/pages/backlogitems/backlogitems.component"
import { authGuard } from "./app/gards/auth.guard"
import { DashboardRouterComponent } from "./app/pages/dashboard/dashboard-router.component"
import { roleGuard } from "./app/gards/role.guard"
import { AdminDashboardComponent } from "./app/pages/dashboard/admin-dashboard/admin-dashboard.component"
import { ProductOwnerDashboardComponent } from "./app/pages/dashboard/product-owner-dashboard/product-owner-dashboard.component"
import { ScrumMasterDashboardComponent } from "./app/pages/dashboard/scrum-master-dashboard/scrum-master-dashboard.component"
import AppLayout from "./app/layout/component/app.layout"
import { ProductOwnerOverviewComponent } from "./app/pages/dashboard/product-owner-dashboard/product-owner-overview.component"
import { ScrumMasterOverviewComponent } from "./app/pages/dashboard/scrum-master-dashboard/scrum-master-overview.component"
import { ScrumMasterStatisticsComponent } from "./app/pages/dashboard/scrum-master-dashboard/scrum-master-statistics.component"
import { AllProjectsReadonlyComponent } from "./app/pages/projects/all-projects-readonly/all-projects-readonly.component"
import { BacklogItemsByOwnerComponent } from "./app/pages/backlogitems/backlogitems-by-owner.component"
import { ProjectBacklogItemsComponent } from "./app/pages/backlogitems/project-backlog-items.component"
import { ProductBacklogListComponent } from "./app/pages/backlog/product-backlog-list.component"
import { ScrumMasterProductBacklogsComponent } from "./app/pages/backlog/scrum-master-product-backlogs.component"
import { bpmnRoutes } from './app/pages/bpmn/bpmn.routes';

export const appRoutes: Routes = [
  {
    path: "dashboard",
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: "",
        component: DashboardRouterComponent,
      },
      {
        path: "default",
        component: Dashboard,
      },
      {
        path: "admin",
        component: AdminDashboardComponent,
        canActivate: [roleGuard(["ADMIN", "ROLE_ADMIN"])],
      },
      {
        path: "product-owner",
        component: ProductOwnerDashboardComponent,
        canActivate: [roleGuard(["PRODUCT_OWNER", "ROLE_PRODUCT_OWNER"])],
        children: [
          {
            path: "",
            redirectTo: "overview",
            pathMatch: "full",
          },
          {
            path: "overview",
            component: ProductOwnerOverviewComponent,
          },
          {
            path: "my-projects",
            component: AllProjectsComponent,
          },
          {
            path: "backlog-items",
            component: BacklogItemsByOwnerComponent,
          },
          {
            path: "product-backlogs",
            component: ProductBacklogListComponent,
          },
          {
            path: "bpmn",
            children: bpmnRoutes
          }
        ],
      },
      {
        path: "scrum-master",
        component: ScrumMasterDashboardComponent,
        canActivate: [roleGuard(["SCRUM_MASTER", "ROLE_SCRUM_MASTER"])],
        children: [
          {
            path: "",
            redirectTo: "overview",
            pathMatch: "full",
          },
          {
            path: "overview",
            component: ScrumMasterOverviewComponent,
          },
          {
            path: "my-projects",
            component: AllProjectsReadonlyComponent,
          },
          {
            path: "product-backlogs",
            component: ScrumMasterProductBacklogsComponent,
          },
          {
            path: "sprints",
            component: AllSprintsComponent,
          },
          {
            path: "tasks",
            component: BacklogItemsComponent,
          },
          {
            path: "statistics",
            component: ScrumMasterStatisticsComponent,
          },
          {
            path: "bpmn",
            children: bpmnRoutes
          }
        ],
      },
      {
        path: "users",
        component: AllUsersComponent,
        canActivate: [roleGuard(["ADMIN", "ROLE_ADMIN"])],
      },
      {
        path: "projects",
        component: AllProjectsComponent,
        canActivate: [roleGuard(["ADMIN", "ROLE_ADMIN"])],
      },
    ],
  },
  {
    path: "all_users",
    component: AppLayout,
    canActivate: [authGuard],
    children: [{ path: "", component: AllUsersComponent }],
  },
  {
    path: "user_stories",
    component: AppLayout,
    canActivate: [authGuard],
    children: [{ path: "", component: AllUserstoriesComponent }],
  },
  {
    path: "product_backlog",
    component: AppLayout,
    canActivate: [authGuard],
    children: [{ path: "", component: ProductBacklogComponent }],
  },
  {
    path: "all_sprints",
    component: AppLayout,
    canActivate: [authGuard],
    children: [{ path: "", component: AllSprintsComponent }],
  },
  {
    path: "backlogitems",
    component: AppLayout,
    canActivate: [authGuard],
    children: [{ path: "", component: BacklogItemsComponent }],
  },
  {
    path: "sprint_backlog",
    component: AppLayout,
    canActivate: [authGuard],
    children: [{ path: "", component: SprintBacklogComponent }],
  },
  {
    path: "all_projects",
    component: AppLayout,
    canActivate: [authGuard],
    children: [{ path: "", component: AllProjectsComponent }],
  },
  {
    path: "projects_details/:id",
    component: AppLayout,
    canActivate: [authGuard],
    children: [{ path: "", component: ProjectDetailsComponent }],
  },
  {
    path: "project-backlog-items/:projectId",
    component: AppLayout,
    canActivate: [authGuard],
    children: [{ path: "", component: ProjectBacklogItemsComponent }],
  },
  {
    path: "",
    component: AppLayout,
    children: [
      { path: "", component: Dashboard },
      { path: "uikit", loadChildren: () => import("./app/pages/uikit/uikit.routes") },
      { path: "documentation", component: Documentation },
      { path: "pages", loadChildren: () => import("./app/pages/pages.routes") },
    ],
  },
  {
    path: "projets",
    loadChildren: () => import("./app/modules/projet/projet-routing.module").then((m) => m.ProjetRoutingModule),
  },
  { path: "landing", component: Landing },
  { path: "notfound", component: Notfound },
  { path: "empty", component: Empty },
  { path: "auth", loadChildren: () => import("./app/pages/auth/auth.routes") },
  { path: "**", redirectTo: "/notfound" },
]
