import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.loginData.email.trim() || !this.loginData.password.trim()) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        // Login successful - redirect to feed
        this.isSubmitting = false;
        this.router.navigate(['/feed']);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        
        if (error.error && error.error.message) {
          this.error = error.error.message;
        } else if (error.status === 401) {
          this.error = 'Email o contraseña incorrectos';
        } else {
          this.error = 'Error al iniciar sesión. Por favor intenta nuevamente.';
        }
        
        console.error('Login error:', error);
      }
    });
  }
}
