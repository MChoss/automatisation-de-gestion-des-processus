import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { BpmnService, BpmnModelResponse } from '../../../services/services/bpmn.service';
import { Subject, takeUntil } from 'rxjs';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import camundaPropertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import minimapModule from 'diagram-js-minimap';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';

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
          <div class="toolbar-group">
            <button pButton type="button" label="Undo" icon="pi pi-undo" (click)="undo()" class="p-button-text" [disabled]="!canUndo || isImporting"></button>
            <button pButton type="button" label="Redo" icon="pi pi-replay" (click)="redo()" class="p-button-text" [disabled]="!canRedo || isImporting"></button>
            <span class="toolbar-divider"></span>
            <button pButton type="button" label="Zoom In" icon="pi pi-plus" (click)="zoomIn()" class="p-button-text" [disabled]="isImporting"></button>
            <button pButton type="button" label="Zoom Out" icon="pi pi-minus" (click)="zoomOut()" class="p-button-text" [disabled]="isImporting"></button>
            <button pButton type="button" label="Fit" icon="pi pi-arrows-alt" (click)="resetZoom()" class="p-button-text" [disabled]="isImporting"></button>
          </div>

          <div class="toolbar-group">
            <input #fileInput type="file" accept=".bpmn,.xml" (change)="onFileSelected($event)" hidden />
            <button pButton type="button" label="Open XML" icon="pi pi-folder-open" (click)="triggerFileInput()" class="p-button-outlined" [disabled]="isImporting"></button>
            <button pButton type="button" label="Download XML" icon="pi pi-download" (click)="downloadXml()" class="p-button-outlined" [disabled]="isImporting"></button>
          </div>

          <div class="toolbar-group">
            <button pButton type="button" label="Save" icon="pi pi-save" (click)="saveModel()" class="p-button-primary" [disabled]="isSaving || isImporting"></button>
            <button pButton type="button" label="Validate" icon="pi pi-check" (click)="validateModel()" class="p-button-info" [disabled]="isValidating || isImporting"></button>
            <button pButton type="button" label="Deploy" icon="pi pi-upload" (click)="deployModel()" class="p-button-success" [disabled]="!isEditMode || isDeploying || isImporting"></button>
            <button pButton type="button" label="Back" icon="pi pi-arrow-left" (click)="goBack()" class="p-button-secondary"></button>
          </div>
        </div>
      </div>

      <div class="editor-content">
        <div class="canvas-wrapper">
          <div #canvas class="canvas" id="canvas"></div>
          <div class="helper-text" *ngIf="isImporting">Loading diagram...</div>
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
          <div class="properties-panel-wrapper">
            <div class="properties-panel-header">Element Properties</div>
            <div #propertiesPanel class="properties-panel"></div>
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
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      background: #e5e7eb;
      display: inline-block;
    }

    .editor-content {
      display: flex;
      flex: 1;
      overflow: hidden;
      gap: 1rem;
    }

    .canvas-wrapper {
      flex: 1;
      position: relative;
      background: #ffffff;
      border-right: 1px solid #e5e7eb;
    }

    .canvas {
      flex: 1;
      background: #ffffff;
      width: 100%;
      height: 100%;
    }

    .helper-text {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.9);
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      font-size: 0.875rem;
      color: #374151;
    }

    .editor-properties {
      width: 280px;
      background: #ffffff;
      border-left: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      overflow: hidden;
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

    .properties-panel-wrapper {
      border-top: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f9fafb;
    }

    .properties-panel-header {
      padding: 0.75rem 1rem;
      font-weight: 600;
      color: #111827;
      border-bottom: 1px solid #e5e7eb;
      background: #ffffff;
    }

    .properties-panel {
      flex: 1;
      overflow: auto;
      padding: 0.5rem 0.75rem;
      background: #ffffff;
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
export class BpmnEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef;
  @ViewChild('propertiesPanel', { static: true }) propertiesPanel!: ElementRef;
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;

  bpmnModeler?: BpmnModeler;
  modelId: string | null = null;
  isEditMode = false;
  modelName = '';
  modelKey = '';
  modelDescription = '';
  deploymentDialog = false;

  isSaving = false;
  isValidating = false;
  isDeploying = false;
  isImporting = false;

  canUndo = false;
  canRedo = false;

  private modelerReady = false;
  private commandStack: any;
  private eventBus: any;
  private commandStackListener?: () => void;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bpmnService: BpmnService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {}

  async ngAfterViewInit() {
    await this.initModeler();
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.modelId = params['id'];
          this.isEditMode = true;
          this.loadModel();
        } else {
          this.createNewModel();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.eventBus && this.commandStackListener) {
      this.eventBus.off('commandStack.changed', this.commandStackListener);
    }
    this.bpmnModeler?.destroy?.();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initModeler() {
    if (this.modelerReady) return;

    this.bpmnModeler = new BpmnModeler({
      container: this.canvas.nativeElement,
      keyboard: { bindTo: document },
      propertiesPanel: {
        parent: this.propertiesPanel.nativeElement
      },
      additionalModules: [
        propertiesPanelModule,
        camundaPropertiesProviderModule,
        minimapModule
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      }
    });

    this.commandStack = this.bpmnModeler.get('commandStack');
    this.eventBus = this.bpmnModeler.get('eventBus');
    this.commandStackListener = () => this.updateUndoRedo();
    this.eventBus.on('commandStack.changed', this.commandStackListener);
    this.updateUndoRedo();

    this.modelerReady = true;
  }

  private async importDiagram(xml: string) {
    if (!this.bpmnModeler) {
      return;
    }

    this.isImporting = true;
    try {
      const result = await this.bpmnModeler.importXML(xml);
      this.bpmnModeler.get('canvas').zoom('fit-viewport');
      this.updateUndoRedo();

      if (result?.warnings?.length) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Import Warnings',
          detail: 'Diagram loaded with warnings. Check elements for details.'
        });
      }
    } catch (err) {
      console.error('Error loading BPMN:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load BPMN model'
      });
    } finally {
      this.isImporting = false;
    }
  }

  private updateUndoRedo() {
    if (!this.commandStack) {
      this.canUndo = false;
      this.canRedo = false;
      return;
    }

    this.canUndo = this.commandStack.canUndo();
    this.canRedo = this.commandStack.canRedo();
  }

  private loadModel() {
    if (this.modelId) {
      this.bpmnService.getModelById(this.modelId).subscribe({
        next: async (model: BpmnModelResponse) => {
          this.modelName = model.name;
          this.modelKey = model.key;
          this.modelDescription = model.description || '';

          if (model.bpmnXml) {
            await this.importDiagram(model.bpmnXml);
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
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_1">
  <bpmn:process id="Process_1" name="New Process" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    this.importDiagram(xml);
  }

  triggerFileInput() {
    if (this.isImporting) {
      return;
    }

    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const xml = reader.result as string;
      await this.importDiagram(xml);
    };
    reader.onerror = () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to read BPMN file'
      });
    };
    reader.readAsText(file);
  }

  async saveModel() {
    if (!this.modelName || !this.modelKey) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in model name and key'
      });
      return;
    }

    if (!this.bpmnModeler) {
      return;
    }

    this.isSaving = true;

    try {
      const { xml: bpmnXml } = await this.bpmnModeler.saveXML({ format: true });

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
            this.loadModel();
          },
          error: (err) => {
            console.error('Error saving model:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to save model'
            });
            this.isSaving = false;
          },
          complete: () => {
            this.isSaving = false;
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
            this.isSaving = false;
          },
          complete: () => {
            this.isSaving = false;
          }
        });
      }
    } catch (err) {
      console.error('Error saving BPMN XML:', err);
      this.isSaving = false;
    }
  }

  async validateModel() {
    if (!this.bpmnModeler) {
      return;
    }

    this.isValidating = true;

    try {
      const { xml } = await this.bpmnModeler.saveXML({ format: true });
      this.bpmnService.validateBpmnXml(xml).subscribe({
        next: (response) => {
          if (response.valid) {
            this.messageService.add({
              severity: 'success',
              summary: 'Valid',
              detail: response.message || 'BPMN model is valid'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Invalid',
              detail: response.message || response.errors?.join(', ') || 'BPMN model is invalid'
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
          this.isValidating = false;
        },
        complete: () => {
          this.isValidating = false;
        }
      });
    } catch (err) {
      console.error('Error creating BPMN XML for validation:', err);
      this.isValidating = false;
    }
  }

  async downloadXml() {
    if (!this.bpmnModeler) {
      return;
    }

    try {
      const { xml } = await this.bpmnModeler.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.modelKey || 'diagram'}.bpmn`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting BPMN XML:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to export BPMN XML'
      });
    }
  }

  undo() {
    if (this.commandStack?.canUndo()) {
      this.commandStack.undo();
      this.updateUndoRedo();
    }
  }

  redo() {
    if (this.commandStack?.canRedo()) {
      this.commandStack.redo();
      this.updateUndoRedo();
    }
  }

  zoomIn() {
    this.adjustZoom(0.2);
  }

  zoomOut() {
    this.adjustZoom(-0.2);
  }

  resetZoom() {
    this.bpmnModeler?.get('canvas').zoom('fit-viewport');
  }

  private adjustZoom(delta: number) {
    if (!this.bpmnModeler) return;

    const canvas = this.bpmnModeler.get('canvas');
    const currentZoom = canvas.zoom();
    const newZoom = Math.max(0.2, currentZoom + delta);
    canvas.zoom(newZoom);
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
      this.isDeploying = true;
      this.bpmnService.deployModel(this.modelId).subscribe({
        next: (response) => {
          this.deploymentDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Deployed',
            detail: `Model deployed successfully. Deployment ID: ${response.deploymentId}`
          });
          this.loadModel();
          this.router.navigate(['/dashboard/bpmn/models']);
        },
        error: (err) => {
          console.error('Error deploying:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to deploy model'
          });
          this.isDeploying = false;
        },
        complete: () => {
          this.isDeploying = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/bpmn/models']);
  }
}
