import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

export interface BpmnModelRequest {
  name: string;
  key: string;
  description?: string;
  bpmnXml?: string;
}

export interface BpmnModelResponse {
  id: string;
  name: string;
  key: string;
  description?: string;
  bpmnXml: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  status: string;
  version: number;
}

export interface BpmnEditorRequest {
  bpmnXml: string;
  modelId: string;
}

export interface ProcessInstanceResponse {
  id: string;
  processKey: string;
  status: string;
  startTime: string;
  endTime?: string;
  variables?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class BpmnService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  // Get all BPMN models
  getAllModels(context?: HttpContext): Observable<BpmnModelResponse[]> {
    return this.http.get<BpmnModelResponse[]>(
      `${this.rootUrl}/bpmn/models`,
      { context }
    );
  }

  // Get BPMN model by ID
  getModelById(id: string, context?: HttpContext): Observable<BpmnModelResponse> {
    return this.http.get<BpmnModelResponse>(
      `${this.rootUrl}/bpmn/models/${id}`,
      { context }
    );
  }

  // Create new BPMN model
  createModel(params: BpmnModelRequest, context?: HttpContext): Observable<BpmnModelResponse> {
    return this.http.post<BpmnModelResponse>(
      `${this.rootUrl}/bpmn/models`,
      params,
      { context }
    );
  }

  // Update BPMN model
  updateModel(id: string, params: BpmnModelRequest, context?: HttpContext): Observable<BpmnModelResponse> {
    return this.http.put<BpmnModelResponse>(
      `${this.rootUrl}/bpmn/models/${id}`,
      params,
      { context }
    );
  }

  // Delete BPMN model
  deleteModel(id: string, context?: HttpContext): Observable<void> {
    return this.http.delete<void>(
      `${this.rootUrl}/bpmn/models/${id}`,
      { context }
    );
  }

  // Get BPMN XML for editor
  getModelXml(id: string, context?: HttpContext): Observable<string> {
    return this.http.get(
      `${this.rootUrl}/bpmn/editor/${id}/xml`,
      { context, responseType: 'text' }
    );
  }

  // Save BPMN XML
  saveModelXml(id: string, params: BpmnEditorRequest, context?: HttpContext): Observable<BpmnModelResponse> {
    return this.http.post<BpmnModelResponse>(
      `${this.rootUrl}/bpmn/editor/${id}/save`,
      params,
      { context }
    );
  }

  // Validate BPMN XML
  validateBpmnXml(bpmnXml: string, context?: HttpContext): Observable<{ valid: boolean; errors?: string[] }> {
    return this.http.post<{ valid: boolean; errors?: string[] }>(
      `${this.rootUrl}/bpmn/editor/validate`,
      { bpmnXml },
      { context }
    );
  }

  // Deploy BPMN model to Camunda
  deployModel(id: string, context?: HttpContext): Observable<{ deploymentId: string; processDefinitionKey: string }> {
    return this.http.post<{ deploymentId: string; processDefinitionKey: string }>(
      `${this.rootUrl}/bpmn/models/${id}/deploy`,
      {},
      { context }
    );
  }

  // Get process instances for a model
  getProcessInstances(processKey: string, context?: HttpContext): Observable<ProcessInstanceResponse[]> {
    return this.http.get<ProcessInstanceResponse[]>(
      `${this.rootUrl}/process/instances?processKey=${processKey}`,
      { context }
    );
  }

  // Start new process instance
  startProcessInstance(processKey: string, variables?: Record<string, any>, context?: HttpContext): Observable<ProcessInstanceResponse> {
    return this.http.post<ProcessInstanceResponse>(
      `${this.rootUrl}/process/start`,
      { processKey, variables },
      { context }
    );
  }

  // Get models by creator
  getModelsByCreator(creatorId: string, context?: HttpContext): Observable<BpmnModelResponse[]> {
    return this.http.get<BpmnModelResponse[]>(
      `${this.rootUrl}/bpmn/models/creator/${creatorId}`,
      { context }
    );
  }

  // Search models
  searchModels(query: string, context?: HttpContext): Observable<BpmnModelResponse[]> {
    return this.http.get<BpmnModelResponse[]>(
      `${this.rootUrl}/bpmn/models/search?q=${query}`,
      { context }
    );
  }
}
