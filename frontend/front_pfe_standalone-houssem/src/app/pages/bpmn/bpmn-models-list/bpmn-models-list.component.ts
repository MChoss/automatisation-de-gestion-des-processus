import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { BpmnModelResponse, BpmnService } from '../../../services/services/bpmn.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-bpmn-models-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ToastModule, ConfirmDialogModule, InputTextModule, DialogModule, FormsModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="models-container">
      <div class="models-header">
        <h1>BPMN Models</h1>
        <button pButton type="button" label="Create New Model" icon="pi pi-plus" (click)="createNewModel()" class="p-button-success"></button>
      </div>

      <div class="search-section">
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search"></i>
          <input pInputText type="text" [(ngModel)]="searchQuery" (ngModelChange)="searchModels()" placeholder="Search models..." class="w-full" />
        </span>
      </div>

      <p-table [value]="models" [loading]="loading" [paginator]="true" [rows]="10" [tableStyle]="{'min-width': '50rem'}">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
            <th pSortableColumn="key">Key <p-sortIcon field="key"></p-sortIcon></th>
            <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
            <th pSortableColumn="createdBy">Created By <p-sortIcon field="createdBy"></p-sortIcon></th>
            <th pSortableColumn="createdAt">Created At <p-sortIcon field="createdAt"></p-sortIcon></th>
            <th>Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-model>
          <tr>
            <td>{{ model.name }}</td>
            <td>{{ model.key }}</td>
            <td>
              <span [class]="'status-badge status-' + model.status.toLowerCase()">
                {{ model.status }}
              </span>
            </td>
            <td>{{ model.createdBy }}</td>
            <td>{{ model.createdAt | date: 'medium' }}</td>
            <td>
              <button pButton type="button" icon="pi pi-pencil" (click)="editModel(model)" class="p-button-info p-button-sm"></button>
              <button pButton type="button" icon="pi pi-trash" (click)="deleteModelConfirm(model)" class="p-button-danger p-button-sm"></button>
              <button pButton type="button" icon="pi pi-play" (click)="startProcess(model)" class="p-button-success p-button-sm" [disabled]="!canStart(model)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center text-gray-500">No models found</td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Start Process Dialog -->
      <p-dialog [(visible)]="startProcessDialog" header="Start Process" [modal]="true" [style]="{width: '50vw'}">
        <div class="process-form">
          <p>Are you sure you want to start a new instance of this process?</p>
        </div>
        <ng-template pTemplate="footer">
          <button pButton type="button" label="Cancel" (click)="startProcessDialog = false" class="p-button-secondary"></button>
          <button pButton type="button" label="Start" (click)="confirmStartProcess()" class="p-button-success"></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .models-container {
      padding: 2rem;
      background: #f5f5f5;
      min-height: calc(100vh - 60px);
    }

    .models-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .models-header h1 {
      margin: 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: #1f2937;
    }

    .search-section {
      margin-bottom: 1.5rem;
    }

    .w-full {
      width: 100%;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-deployed {
      background: #dcfce7;
      color: #166534;
    }

    .status-draft {
      background: #fef3c7;
      color: #92400e;
    }

    .status-active {
      background: #dbeafe;
      color: #1e40af;
    }

    .text-center {
      text-align: center;
    }

    .text-gray-500 {
      color: #6b7280;
    }

    .p-button-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }

    .process-form {
      margin: 1rem 0;
    }

    .process-form p {
      color: #374151;
    }
  `]
})
export class BpmnModelsListComponent implements OnInit {
  models: BpmnModelResponse[] = [];
  loading = false;
  searchQuery = '';
  startProcessDialog = false;
  selectedModel: BpmnModelResponse | null = null;

  constructor(
    private router: Router,
    private bpmnService: BpmnService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService  ) {}

  ngOnInit() {
    this.loadModels();
  }

  loadModels() {
    this.loading = true;
    this.bpmnService.getAllModels().subscribe({
      next: (models) => {
        this.models = models;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading models:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load models'
        });
        this.loading = false;
      }
    });
  }

  createNewModel() {
    this.router.navigate([`${this.getBaseRoute()}/bpmn/editor`]);
  }

  editModel(model: BpmnModelResponse) {
    this.router.navigate([`${this.getBaseRoute()}/bpmn/editor`, model.id]);
  }

  searchModels() {
    if (this.searchQuery.trim() === '') {
      this.loadModels();
    } else {
      this.loading = true;
      this.bpmnService.searchModels(this.searchQuery).subscribe({
        next: (models) => {
          this.models = models;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error searching:', err);
          this.loading = false;
        }
      });
    }
  }

  deleteModelConfirm(model: BpmnModelResponse) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${model.name}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteModel(model);
      }
    });
  }

  deleteModel(model: BpmnModelResponse) {
    this.bpmnService.deleteModel(model.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Model deleted successfully'
        });
        this.loadModels();
      },
      error: (err) => {
        console.error('Error deleting:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete model'
        });
      }
    });
  }

  startProcess(model: BpmnModelResponse) {
    this.selectedModel = model;
    this.startProcessDialog = true;
  }

    canStart(model: BpmnModelResponse): boolean {
    return ['DEPLOYED', 'ACTIVE'].includes(model.status);
  }

  private getBaseRoute(): string {
    if (this.authService.isScrumMaster()) {
      return '/dashboard/scrum-master';
    }
    if (this.authService.isProductOwner()) {
      return '/dashboard/product-owner';
    }
    return '/dashboard';
  }

  confirmStartProcess() {
    if (this.selectedModel) {
      this.bpmnService.startProcessInstance(this.selectedModel.key).subscribe({
        next: (instance) => {
          this.startProcessDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Started',
            detail: `Process instance started: ${instance.id}`
          });
        },
        error: (err) => {
          console.error('Error starting process:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to start process'
          });
        }
      });
    }
  }
}
