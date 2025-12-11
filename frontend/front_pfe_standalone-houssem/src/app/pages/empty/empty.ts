import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MainViewComponent } from './main-view/main-view.component';

@Component({
    selector: 'app-empty',
    standalone: true,
    imports: [
        CommonModule,
        FontAwesomeModule,
        MainViewComponent
    ],
    template: '<app-main-view></app-main-view>'

})
export class Empty {}
