import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginData = {
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

    // Simular login (en una app real, esto sería una llamada al backend)
    setTimeout(() => {
      // Ejemplo de respuesta del backend
      const mockUser = {
        _id: '6868a70d564b930d758ff13a', // ID del usuario que existe en la base de datos
        firstName: 'Juan',
        lastName: 'Pérez',
        email: this.loginData.email,
        roleId: 'user'
      };
      const mockToken = 'mock-jwt-token';

      // Guardar en AuthService
      this.authService.login(mockUser, mockToken);
      
      this.isSubmitting = false;
      
      // Redirigir al feed
      this.router.navigate(['/feed']);
    }, 1000);
  }

  // Método temporal para simular login sin backend
  quickLogin(): void {
    const mockUser = {
      _id: '6868a70d564b930d758ff13a', // ID del usuario que existe en la base de datos
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@test.com',
      roleId: 'user'
    };
    const mockToken = 'mock-jwt-token';

    this.authService.login(mockUser, mockToken);
    this.router.navigate(['/feed']);
  }
}
