import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ChartModule } from "primeng/chart"
import { CardModule } from "primeng/card"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { TagModule } from "primeng/tag"
import  { Router } from "@angular/router"
import  { ProjetService } from "../../../services/services/projet.service"
import  { BacklogItemService } from "../../../services/services/backlog-item.service"
import type { ProjetResponse } from "../../../services/models/projet-response"

@Component({
  selector: "app-product-owner-overview",
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule, ButtonModule, TableModule, TagModule],
  template: `
    <div class="overview-container">
      <!-- Enhanced statistics cards with vibrant colors matching reference design -->
      <div class="grid grid-cols-12 gap-6 mb-6">
        <div class="col-span-12 lg:col-span-3">
          <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none;">
            <div class="flex justify-between items-center">
              <div>
                <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Mes Projets</span>
                <div class="text-white font-bold text-3xl">{{ totalProjects }}</div>
              </div>
              <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
                <i class="pi pi-briefcase text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-white/80 font-medium">{{ activeProjects }} actifs</span>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-3">
          <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none;">
            <div class="flex justify-between items-center">
              <div>
                <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Product Backlogs</span>
                <div class="text-white font-bold text-3xl">{{ totalBacklogs }}</div>
              </div>
              <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
                <i class="pi pi-list text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-white/80 font-medium">{{ totalItems }} items au total</span>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-3">
          <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); border: none;">
            <div class="flex justify-between items-center">
              <div>
                <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Items Terminés</span>
                <div class="text-white font-bold text-3xl">{{ completedItems }}</div>
              </div>
              <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
                <i class="pi pi-check-circle text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-white/80 font-medium">{{ completionRate }}% de complétion</span>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-3">
          <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border: none;">
            <div class="flex justify-between items-center">
              <div>
                <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Items En Cours</span>
                <div class="text-white font-bold text-3xl">{{ inProgressItems }}</div>
              </div>
              <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
                <i class="pi pi-spinner text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-white/80 font-medium">En développement</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-12 gap-6 mb-6">
        <div class="col-span-12 lg:col-span-8">
          <div class="card">
            <h5 class="text-xl font-semibold mb-4">Statistiques des Projets</h5>
            <p-chart type="bar" [data]="projectStatsData" [options]="chartOptions" class="h-80"></p-chart>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-4">
          <div class="card">
            <h5 class="text-xl font-semibold mb-4">Distribution des Items</h5>
            <p-chart type="doughnut" [data]="itemDistributionData" [options]="doughnutOptions" class="h-80"></p-chart>
          </div>
        </div>
      </div>

      <!-- Recent Projects Table -->
      <div class="card">
        <h5 class="text-xl font-semibold mb-4">Mes Projets Récents</h5>
        <p-table [value]="recentProjects" [paginator]="true" [rows]="5">
          <ng-template pTemplate="header">
            <tr>
              <th>Nom du Projet</th>
              <th>Date de Création</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-project>
            <tr>
              <td>{{ project.nom }}</td>
              <td>{{ project.dateCreation | date : "short" }}</td>
              <td>
                <p-tag
                  [value]="project.actif ? 'Actif' : 'Inactif'"
                  [severity]="project.actif ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td>
                <p-button
                  icon="pi pi-eye"
                  class="p-button-text p-button-sm"
                  (click)="viewProject(project)"
                  pTooltip="Voir le projet"
                ></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [
    `
      .overview-container {
        max-width: 1400px;
      }
    `,
  ],
})
export class ProductOwnerOverviewComponent implements OnInit {
  totalProjects = 0
  activeProjects = 0
  totalBacklogs = 0
  totalItems = 0
  completedItems = 0
  inProgressItems = 0
  completionRate = 0

  recentProjects: ProjetResponse[] = []
  projectStatsData: any
  itemDistributionData: any
  chartOptions: any
  doughnutOptions: any

  constructor(
    private projectService: ProjetService,
    private backlogItemService: BacklogItemService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadDashboardData()
    this.initializeCharts()
  }

  loadDashboardData() {
    // Load projects by owner
    this.projectService.findAllProjetsByOwner({ page: 0 }).subscribe({
      next: (response) => {
        this.totalProjects = response.totalElements || 0
        this.activeProjects = response.content?.filter((p) => p.actif).length || 0
        this.recentProjects = response.content?.slice(0, 5) || []
      },
      error: (error) => console.error("Error loading projects:", error),
    })
  }

  initializeCharts() {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue("--text-color")
    const borderColor = documentStyle.getPropertyValue("--surface-border")

    this.projectStatsData = {
      labels: ["Items Total", "Items Terminés", "En Cours", "À Faire"],
      datasets: [
        {
          label: "Statistiques",
          data: [18, 4, 7, 7],
          backgroundColor: ["#3b82f6", "#10b981", "#f97316", "#a855f7"],
        },
      ],
    }

    this.itemDistributionData = {
      labels: ["À faire", "En cours", "Terminés"],
      datasets: [
        {
          data: [7, 7, 4],
          backgroundColor: ["#f97316", "#10b981", "#a855f7"],
        },
      ],
    }

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
          },
          grid: {
            color: borderColor,
          },
        },
        y: {
          ticks: {
            color: textColor,
          },
          grid: {
            color: borderColor,
          },
        },
      },
    }

    this.doughnutOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
    }
  }

  viewProject(project: ProjetResponse) {
    if (project.id) {
      this.router.navigate(["/projects_details", project.id])
    }
  }
}
