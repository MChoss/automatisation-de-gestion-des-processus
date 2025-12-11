import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ChartModule } from "primeng/chart"
import { CardModule } from "primeng/card"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { TagModule } from "primeng/tag"
import { ProgressBarModule } from "primeng/progressbar"
import { TimelineModule } from "primeng/timeline"

@Component({
  selector: "app-scrum-master-overview",
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ProgressBarModule,
    TimelineModule,
  ],
  template: `
    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 lg:col-span-3">
        <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); border: none;">
          <div class="flex justify-between items-center">
            <div>
              <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Active Sprint</span>
              <div class="text-white font-bold text-3xl">Sprint {{ currentSprintNumber }}</div>
            </div>
            <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
              <i class="pi pi-play text-white text-2xl"></i>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-white/80 font-medium">{{ sprintDaysRemaining }} days remaining</span>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-3">
        <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); border: none;">
          <div class="flex justify-between items-center">
            <div>
              <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Sprint Tasks</span>
              <div class="text-white font-bold text-3xl">{{ totalSprintTasks }}</div>
            </div>
            <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
              <i class="pi pi-check-square text-white text-2xl"></i>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-white/80 font-medium">{{ completedTasks }} completed</span>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-3">
        <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: none;">
          <div class="flex justify-between items-center">
            <div>
              <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Blockers</span>
              <div class="text-white font-bold text-3xl">{{ activeBlockers }}</div>
            </div>
            <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
              <i class="pi pi-exclamation-triangle text-white text-2xl"></i>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-white/80 font-medium">{{ resolvedBlockers }} resolved today</span>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-3">
        <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border: none;">
          <div class="flex justify-between items-center">
            <div>
              <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Team Velocity</span>
              <div class="text-white font-bold text-3xl">{{ teamVelocity }}</div>
            </div>
            <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
              <i class="pi pi-bolt text-white text-2xl"></i>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-white/80 font-medium">Story points per sprint</span>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-8">
        <div class="card">
          <h5 class="text-xl font-semibold mb-4">Sprint Burndown Chart</h5>
          <p-chart type="line" [data]="burndownData" [options]="chartOptions" class="h-80"></p-chart>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4">
        <div class="card">
          <h5 class="text-xl font-semibold mb-4">Team Velocity Trend</h5>
          <p-chart type="bar" [data]="velocityData" [options]="velocityOptions" class="h-80"></p-chart>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h5 class="text-xl font-semibold">Current Sprint Tasks</h5>
            <div class="flex gap-2">
              <p-button label="Add Task" icon="pi pi-plus" class="p-button-sm" (click)="addTask()"></p-button>
              <p-button
                label="Sprint Review"
                icon="pi pi-eye"
                class="p-button-sm p-button-outlined"
                (click)="sprintReview()"
              ></p-button>
            </div>
          </div>
          <p-table [value]="sprintTasks" [paginator]="true" [rows]="10">
            <ng-template pTemplate="header">
              <tr>
                <th>Task</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Story Points</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-task>
              <tr>
                <td>
                  <div class="font-medium">{{ task.title }}</div>
                  <div class="text-sm text-gray-600">{{ task.description }}</div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium">{{ getInitials(task.assignee) }}</span>
                    </div>
                    <span>{{ task.assignee }}</span>
                  </div>
                </td>
                <td>
                  <p-tag [value]="task.status" [severity]="getStatusSeverity(task.status)"></p-tag>
                </td>
                <td>
                  <p-tag [value]="task.priority" [severity]="getPrioritySeverity(task.priority)"></p-tag>
                </td>
                <td>
                  <div class="flex items-center gap-1">
                    <i class="pi pi-star-fill text-yellow-500"></i>
                    <span>{{ task.storyPoints }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <p-progressBar
                      [value]="task.progress"
                      [style]="{ width: '80px', height: '8px' }"
                    ></p-progressBar>
                    <span class="text-sm">{{ task.progress }}%</span>
                  </div>
                </td>
                <td>
                  <div class="flex gap-1">
                    <p-button
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm"
                      (click)="editTask(task)"
                      pTooltip="Edit Task"
                    ></p-button>
                    <p-button
                      icon="pi pi-comments"
                      class="p-button-text p-button-sm"
                      (click)="addComment(task)"
                      pTooltip="Add Comment"
                    ></p-button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h5 class="text-xl font-semibold">Active Blockers</h5>
            <p-button
              icon="pi pi-plus"
              class="p-button-sm p-button-text"
              (click)="addBlocker()"
              pTooltip="Add Blocker"
            ></p-button>
          </div>
          <div class="space-y-4">
            <div *ngFor="let blocker of activeBlockersList" class="p-4 border border-red-200 rounded-lg bg-red-50">
              <div class="flex justify-between items-start mb-2">
                <h6 class="font-medium text-red-800">{{ blocker.title }}</h6>
                <p-tag value="High" severity="danger" class="text-xs"></p-tag>
              </div>
              <p class="text-sm text-red-600 mb-3">{{ blocker.description }}</p>
              <div class="flex justify-between items-center">
                <span class="text-xs text-red-500">{{ blocker.daysOpen }} days open</span>
                <p-button
                  label="Resolve"
                  icon="pi pi-check"
                  class="p-button-sm p-button-danger"
                  (click)="resolveBlocker(blocker)"
                ></p-button>
              </div>
            </div>
            <div *ngIf="activeBlockersList.length === 0" class="text-center py-8 text-gray-500">
              <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
              <p>No active blockers!</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12">
        <div class="card">
          <h5 class="text-xl font-semibold mb-4">Daily Standup Updates</h5>
          <p-timeline [value]="standupUpdates" layout="horizontal">
            <ng-template pTemplate="content" let-update>
              <div class="p-4 bg-gray-50 rounded-lg">
                <h6 class="font-medium mb-2">{{ update.member }}</h6>
                <p class="text-sm text-gray-600 mb-2">{{ update.update }}</p>
                <span class="text-xs text-gray-500">{{ update.time }}</span>
              </div>
            </ng-template>
          </p-timeline>
        </div>
      </div>

      <div class="col-span-12">
        <div class="card">
          <h5 class="text-xl font-semibold mb-4">Scrum Master Actions</h5>
          <div class="flex flex-wrap gap-4">
            <p-button
              label="Daily Standup"
              icon="pi pi-users"
              class="p-button-outlined"
              (click)="dailyStandup()"
            ></p-button>
            <p-button
              label="Sprint Planning"
              icon="pi pi-calendar-plus"
              class="p-button-outlined"
              (click)="sprintPlanning()"
            ></p-button>
            <p-button
              label="Sprint Review"
              icon="pi pi-eye"
              class="p-button-outlined"
              (click)="sprintReview()"
            ></p-button>
            <p-button
              label="Retrospective"
              icon="pi pi-refresh"
              class="p-button-outlined"
              (click)="retrospective()"
            ></p-button>
            <p-button
              label="Remove Impediments"
              icon="pi pi-times-circle"
              class="p-button-outlined"
              (click)="removeImpediments()"
            ></p-button>
            <p-button
              label="Team Metrics"
              icon="pi pi-chart-bar"
              class="p-button-outlined"
              (click)="viewTeamMetrics()"
            ></p-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ScrumMasterOverviewComponent implements OnInit {
  currentSprintNumber = 5
  sprintDaysRemaining = 8
  totalSprintTasks = 24
  completedTasks = 16
  activeBlockers = 2
  resolvedBlockers = 1
  teamVelocity = 42

  sprintTasks: any[] = []
  activeBlockersList: any[] = []
  standupUpdates: any[] = []

  burndownData: any
  velocityData: any
  chartOptions: any
  velocityOptions: any

  constructor() {}

  ngOnInit() {
    this.loadDashboardData()
    this.initializeCharts()
  }

  loadDashboardData() {
    this.sprintTasks = [
      {
        title: "Implement user authentication",
        description: "Add login and registration functionality",
        assignee: "John Doe",
        status: "In Progress",
        priority: "High",
        storyPoints: 8,
        progress: 75,
      },
      {
        title: "Design dashboard UI",
        description: "Create responsive dashboard layout",
        assignee: "Jane Smith",
        status: "Done",
        priority: "Medium",
        storyPoints: 5,
        progress: 100,
      },
      {
        title: "Setup database schema",
        description: "Create tables and relationships",
        assignee: "Mike Johnson",
        status: "To Do",
        priority: "High",
        storyPoints: 13,
        progress: 0,
      },
    ]

    this.activeBlockersList = [
      {
        title: "API Integration Issue",
        description: "Third-party API is returning 500 errors",
        daysOpen: 3,
      },
      {
        title: "Environment Setup",
        description: "Development environment not accessible",
        daysOpen: 1,
      },
    ]

    this.standupUpdates = [
      {
        member: "John Doe",
        update: "Completed authentication module, working on password reset",
        time: "9:00 AM",
      },
      {
        member: "Jane Smith",
        update: "Finished dashboard design, starting implementation",
        time: "9:05 AM",
      },
      {
        member: "Mike Johnson",
        update: "Blocked by database access issues, need admin help",
        time: "9:10 AM",
      },
    ]
  }

  initializeCharts() {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue("--text-color")
    const borderColor = documentStyle.getPropertyValue("--surface-border")

    this.burndownData = {
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
      datasets: [
        {
          label: "Ideal Burndown",
          data: [100, 90, 80, 70, 60, 50, 40, 30, 20, 0],
          borderColor: "#9ca3af",
          backgroundColor: "transparent",
          borderDash: [5, 5],
          borderWidth: 2,
        },
        {
          label: "Actual Burndown",
          data: [100, 95, 85, 75, 70, 60, 45, 35, null, null],
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.4,
          fill: true,
          borderWidth: 3,
        },
      ],
    }

    this.velocityData = {
      labels: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"],
      datasets: [
        {
          label: "Story Points",
          data: [35, 42, 38, 45, 42],
          backgroundColor: "#0ea5e9",
          borderColor: "#0284c7",
          borderWidth: 1,
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

    this.velocityOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
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
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case "done":
        return "success"
      case "in progress":
        return "warning"
      case "to do":
        return "info"
      default:
        return "secondary"
    }
  }

  getPrioritySeverity(priority: string): string {
    switch (priority.toLowerCase()) {
      case "high":
        return "danger"
      case "medium":
        return "warning"
      case "low":
        return "info"
      default:
        return "secondary"
    }
  }

  addTask() {
    console.log("Add new task")
  }

  editTask(task: any) {
    console.log("Edit task:", task)
  }

  addComment(task: any) {
    console.log("Add comment to task:", task)
  }

  addBlocker() {
    console.log("Add new blocker")
  }

  resolveBlocker(blocker: any) {
    console.log("Resolve blocker:", blocker)
    this.activeBlockersList = this.activeBlockersList.filter((b) => b !== blocker)
    this.activeBlockers--
    this.resolvedBlockers++
  }

  dailyStandup() {
    console.log("Start daily standup")
  }

  sprintPlanning() {
    console.log("Sprint planning")
  }

  sprintReview() {
    console.log("Sprint review")
  }

  retrospective() {
    console.log("Sprint retrospective")
  }

  removeImpediments() {
    console.log("Remove impediments")
  }

  viewTeamMetrics() {
    console.log("View team metrics")
  }
}
