import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup implements OnInit {
  signupData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    acceptTerms: false,
    businessInfo: {
      companyName: '',
      ruc: '',
      sector: '',
      size: 'small'
    }
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showBusinessInfo = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // No need to load roles - they're handled by backend
  }

  toggleBusinessInfo(): void {
    this.showBusinessInfo = !this.showBusinessInfo;
    if (!this.showBusinessInfo) {
      // Clear business info if toggled off
      this.signupData.businessInfo = undefined;
    } else {
      this.signupData.businessInfo = {
        companyName: '',
        ruc: '',
        sector: '',
        size: 'small'
      };
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Validate required fields
    if (!this.signupData.name || !this.signupData.email || 
        !this.signupData.password || !this.signupData.confirmPassword) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      this.isLoading = false;
      return;
    }

    // Validate password confirmation
    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.isLoading = false;
      return;
    }

    // Validate terms acceptance
    if (!this.signupData.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      this.isLoading = false;
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.signupData.email)) {
      this.errorMessage = 'Por favor ingresa un email válido';
      this.isLoading = false;
      return;
    }

    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(this.signupData.password)) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres, incluir mayúsculas, minúsculas y números';
      this.isLoading = false;
      return;
    }

    // Validate business info if provided
    if (this.showBusinessInfo && this.signupData.businessInfo) {
      if (!this.signupData.businessInfo.companyName || !this.signupData.businessInfo.sector) {
        this.errorMessage = 'Por favor completa la información empresarial';
        this.isLoading = false;
        return;
      }
    }

    console.log('Signup data:', this.signupData);

    this.authService.register(this.signupData).subscribe({
      next: (response: any) => {
        this.successMessage = 'Cuenta creada exitosamente';
        this.isLoading = false;
        
        // Redirect to login after successful signup
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Error al crear la cuenta. Por favor intenta nuevamente.';
        }
        console.error('Signup error:', error);
      }
    });
  }
}
