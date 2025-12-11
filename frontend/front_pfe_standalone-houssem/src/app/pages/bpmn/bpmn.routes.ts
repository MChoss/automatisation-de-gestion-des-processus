import { Routes } from '@angular/router';
import { BpmnModelsListComponent } from './bpmn-models-list/bpmn-models-list.component';
import { BpmnEditorComponent } from './bpmn-editor/bpmn-editor.component';

export const bpmnRoutes: Routes = [
  {
    path: 'models',
    component: BpmnModelsListComponent
  },
  {
    path: 'editor',
    component: BpmnEditorComponent
  },
  {
    path: 'editor/:id',
    component: BpmnEditorComponent
  }
];
