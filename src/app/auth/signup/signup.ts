import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/auth.model';
import { RoleService, Role } from '../../services/role.service';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup implements OnInit {
  signupData: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleId: '', // Will be selected by user
    confirmPassword: '',
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
  
  // New properties for roles
  availableRoles: Role[] = [];
  isLoadingRoles = false;

  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  /**
   * Load available roles from the server
   */
  loadRoles(): void {
    this.isLoadingRoles = true;
    this.roleService.getRoles().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableRoles = response.data;
          console.log('Roles loaded:', this.availableRoles);
        } else {
          this.errorMessage = 'Error al cargar los roles disponibles';
        }
        this.isLoadingRoles = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.errorMessage = 'Error al cargar los roles disponibles';
        this.isLoadingRoles = false;
      }
    });
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
    if (!this.signupData.firstName || !this.signupData.lastName || !this.signupData.email || 
        !this.signupData.password || !this.signupData.confirmPassword || !this.signupData.phoneNumber) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      this.isLoading = false;
      return;
    }

    // Validate role selection
    if (!this.signupData.roleId) {
      this.errorMessage = 'Por favor selecciona un rol';
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

    // Prepare data for backend (only send required fields)
    const registrationData = {
      firstName: this.signupData.firstName,
      lastName: this.signupData.lastName,
      email: this.signupData.email,
      password: this.signupData.password,
      phoneNumber: this.signupData.phoneNumber,
      roleId: this.signupData.roleId
    };

    console.log('Signup data:', registrationData);

    this.authService.register(registrationData).subscribe({
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
