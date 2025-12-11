import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { BpmnService, BpmnModelResponse } from '../../../services/services/bpmn.service';

declare var BpmnModeler: any;
declare var BpmnViewer: any;

@Component({
  selector: 'app-bpmn-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule, InputTextModule, DialogModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="bpmn-editor-container">
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <h2>{{ isEditMode ? 'Edit BPMN Model' : 'Create New BPMN Model' }}</h2>
        </div>
        <div class="toolbar-right">
          <button pButton type="button" label="Save" icon="pi pi-save" (click)="saveModel()" class="p-button-primary"></button>
          <button pButton type="button" label="Validate" icon="pi pi-check" (click)="validateModel()" class="p-button-info"></button>
          <button pButton type="button" label="Deploy" icon="pi pi-upload" (click)="deployModel()" class="p-button-success" [disabled]="!isEditMode"></button>
          <button pButton type="button" label="Back" icon="pi pi-arrow-left" (click)="goBack()" class="p-button-secondary"></button>
        </div>
      </div>

      <div class="editor-content">
        <div #canvas class="canvas" id="canvas"></div>
      </div>

      <div class="editor-properties">
        <div class="properties-header">Properties</div>
        <div class="properties-content">
          <div class="form-group">
            <label>Model Name</label>
            <input pInputText [(ngModel)]="modelName" placeholder="Enter model name" class="w-full" />
          </div>
          <div class="form-group">
            <label>Model Key</label>
            <input pInputText [(ngModel)]="modelKey" placeholder="Enter model key" class="w-full" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="modelDescription" placeholder="Enter description" class="w-full" rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Deployment Dialog -->
      <p-dialog [(visible)]="deploymentDialog" header="Deploy Model" [modal]="true" [style]="{width: '50vw'}">
        <div class="deployment-info">
          <p>Are you sure you want to deploy this model to the Camunda engine?</p>
          <p class="info-text">This will make the process available for execution.</p>
        </div>
        <ng-template pTemplate="footer">
          <button pButton type="button" label="Cancel" (click)="deploymentDialog = false" class="p-button-secondary"></button>
          <button pButton type="button" label="Deploy" (click)="confirmDeploy()" class="p-button-success"></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .bpmn-editor-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 60px);
      background: #f5f5f5;
    }

    .editor-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .toolbar-left h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .toolbar-right {
      display: flex;
      gap: 0.5rem;
    }

    .editor-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .canvas {
      flex: 1;
      background: #ffffff;
    }

    .editor-properties {
      width: 280px;
      background: #ffffff;
      border-left: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .properties-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #1f2937;
    }

    .properties-content {
      padding: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .deployment-info {
      margin: 1rem 0;
    }

    .deployment-info p {
      margin: 0.5rem 0;
      color: #374151;
    }

    .info-text {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .w-full {
      width: 100%;
    }
  `]
})
export class BpmnEditorComponent implements OnInit {
  @ViewChild('canvas') canvas!: ElementRef;

  bpmnModeler: any;
  modelId: string | null = null;
  isEditMode = false;
  modelName = '';
  modelKey = '';
  modelDescription = '';
  deploymentDialog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bpmnService: BpmnService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initModeler();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modelId = params['id'];
        this.isEditMode = true;
        this.loadModel();
      } else {
        this.createNewModel();
      }
    });
  }

  private initModeler() {
    // Load bpmn-js library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bpmn-js@14.0.0/dist/bpmn-modeler.production.min.js';
    script.onload = () => {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/bpmn-js@14.0.0/dist/assets/diagram-js.css';
      document.head.appendChild(cssLink);

      const bpmnCss = document.createElement('link');
      bpmnCss.rel = 'stylesheet';
      bpmnCss.href = 'https://cdn.jsdelivr.net/npm/bpmn-js@14.0.0/dist/assets/bpmn-js.css';
      document.head.appendChild(bpmnCss);

      if (this.canvas) {
        this.bpmnModeler = new (window as any).BpmnModeler({
          container: this.canvas.nativeElement,
          keyboard: { bindTo: document }
        });
      }
    };
    document.head.appendChild(script);
  }

  private loadModel() {
    if (this.modelId) {
      this.bpmnService.getModelById(this.modelId).subscribe({
        next: (model: BpmnModelResponse) => {
          this.modelName = model.name;
          this.modelKey = model.key;
          this.modelDescription = model.description || '';

          if (model.bpmnXml && this.bpmnModeler) {
            this.bpmnModeler.importXML(model.bpmnXml).catch((err: any) => {
              console.error('Error loading BPMN:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load BPMN model'
              });
            });
          }
        },
        error: (err) => {
          console.error('Error fetching model:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load model'
          });
        }
      });
    }
  }

  private createNewModel() {
    if (this.bpmnModeler) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://bpmn.io/schema/bpmn" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL http://www.omg.org/spec/BPMN/20100524/BPMN20.xsd" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
</bpmn:definitions>`;
      this.bpmnModeler.importXML(xml).catch((err: any) => {
        console.error('Error creating new BPMN:', err);
      });
    }
  }

  saveModel() {
    if (!this.modelName || !this.modelKey) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in model name and key'
      });
      return;
    }

    this.bpmnModeler.saveXML({ format: true }).then((result: any) => {
      const bpmnXml = result.xml;

      if (this.isEditMode && this.modelId) {
        this.bpmnService.updateModel(this.modelId, {
          name: this.modelName,
          key: this.modelKey,
          description: this.modelDescription,
          bpmnXml
        }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Model saved successfully'
            });
          },
          error: (err) => {
            console.error('Error saving model:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to save model'
            });
          }
        });
      } else {
        this.bpmnService.createModel({
          name: this.modelName,
          key: this.modelKey,
          description: this.modelDescription,
          bpmnXml
        }).subscribe({
          next: (model) => {
            this.modelId = model.id;
            this.isEditMode = true;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Model created successfully'
            });
          },
          error: (err) => {
            console.error('Error creating model:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create model'
            });
          }
        });
      }
    });
  }

  validateModel() {
    this.bpmnModeler.saveXML({ format: true }).then((result: any) => {
      this.bpmnService.validateBpmnXml(result.xml).subscribe({
        next: (response) => {
          if (response.valid) {
            this.messageService.add({
              severity: 'success',
              summary: 'Valid',
              detail: 'BPMN model is valid'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Invalid',
              detail: response.errors?.join(', ') || 'BPMN model is invalid'
            });
          }
        },
        error: (err) => {
          console.error('Error validating:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to validate model'
          });
        }
      });
    });
  }

  deployModel() {
    if (!this.isEditMode || !this.modelId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please save the model first'
      });
      return;
    }
    this.deploymentDialog = true;
  }

  confirmDeploy() {
    if (this.modelId) {
      this.bpmnService.deployModel(this.modelId).subscribe({
        next: (response) => {
          this.deploymentDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Deployed',
            detail: `Model deployed successfully. Deployment ID: ${response.deploymentId}`
          });
        },
        error: (err) => {
          console.error('Error deploying:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to deploy model'
          });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/bpmn/models']);
  }
}
