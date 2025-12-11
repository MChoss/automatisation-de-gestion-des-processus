import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ChartModule } from "primeng/chart"
import { CardModule } from "primeng/card"

@Component({
  selector: "app-scrum-master-statistics",
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule],
  template: `
    <div class="statistics-container">
      <h1>Scrum Master Statistics</h1>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Sprints</h3>
          <p class="stat-value">24</p>
        </div>
        <div class="stat-card">
          <h3>Completed Tasks</h3>
          <p class="stat-value">342</p>
        </div>
        <div class="stat-card">
          <h3>Team Velocity</h3>
          <p class="stat-value">42</p>
        </div>
        <div class="stat-card">
          <h3>Success Rate</h3>
          <p class="stat-value">94%</p>
        </div>
      </div>

      <div class="charts-grid">
        <p-card header="Sprint Performance">
          <p-chart type="line" [data]="sprintPerformanceData" [options]="chartOptions"></p-chart>
        </p-card>

        <p-card header="Task Distribution">
          <p-chart type="doughnut" [data]="taskDistributionData" [options]="chartOptions"></p-chart>
        </p-card>
      </div>
    </div>
  `,
  styles: [
    `
      .statistics-container {
        max-width: 1400px;
        margin: 0 auto;
      }

      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 2rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .stat-card h3 {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0 0 0.5rem 0;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #3b82f6;
        margin: 0;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
      }
    `,
  ],
})
export class ScrumMasterStatisticsComponent implements OnInit {
  sprintPerformanceData: any
  taskDistributionData: any
  chartOptions: any

  ngOnInit() {
    this.initializeCharts()
  }

  initializeCharts() {
    this.sprintPerformanceData = {
      labels: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"],
      datasets: [
        {
          label: "Velocity",
          data: [38, 42, 40, 45, 42],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
        },
      ],
    }

    this.taskDistributionData = {
      labels: ["To Do", "In Progress", "Done"],
      datasets: [
        {
          data: [12, 8, 32],
          backgroundColor: ["#93c5fd", "#fbbf24", "#34d399"],
        },
      ],
    }

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
    }
  }
}
