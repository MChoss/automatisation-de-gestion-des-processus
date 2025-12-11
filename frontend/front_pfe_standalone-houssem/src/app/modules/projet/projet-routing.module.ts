import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { ProjectDetailComponent } from './pages/projet-detail/projet-detail.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
    {
        path: 'detail/:id',
        component: ProjectDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjetRoutingModule { }
