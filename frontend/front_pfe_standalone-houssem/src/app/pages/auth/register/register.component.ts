import { Component } from '@angular/core';
import { RegistrationRequest } from '../../../services/models/registration-request';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { NgForOf, NgIf } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../services/services/authentication.service';

@Component({
    selector: 'app-register',
    imports: [FormsModule, Button, NgForOf, InputText, NgIf],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class Register {
    registerRequest: RegistrationRequest = { email: '', nom: '', prenom: '', password: '' };
    errorMsg: Array<string> = [];


    constructor(
        private router: Router,
        private authService: AuthenticationService

    ) {}

    register() {
        this.errorMsg = [];
        this.authService.register({
            body: this.registerRequest
        }).subscribe({
            next: () => {
                this.router.navigate(['auth/activate-account']);
            },
            error: (err) => {
                this.errorMsg = err.error.validationErrors;
            }
        })
    }

    login() {
        this.router.navigate(['/auth/login']);
    }
}
