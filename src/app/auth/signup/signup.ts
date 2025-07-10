import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, SignupRequest } from '../../services/auth.service';
import { RoleService, Role } from '../../services/role.service';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup implements OnInit {
  signupData: SignupRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleId: ''
  };

  roles: Role[] = [];
  isLoading = false;
  isLoadingRoles = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.isLoadingRoles = true;
    this.roleService.getRoles().subscribe({
      next: (response) => {
        this.roles = response.data;
        this.isLoadingRoles = false;
        
        // Set default role to 'user' if available
        const defaultRole = this.roles.find(role => role.name === 'user');
        if (defaultRole) {
          this.signupData.roleId = defaultRole._id;
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.isLoadingRoles = false;
        this.errorMessage = 'Error al cargar los roles. Por favor recarga la página.';
      }
    });
  }

  getRoleDisplayName(roleName: string): string {
    const roleDisplayNames: { [key: string]: string } = {
      'admin': 'Administrador',
      'moderator': 'Moderador',
      'user': 'Usuario'
    };
    return roleDisplayNames[roleName] || roleName;
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Validate required fields
    if (!this.signupData.firstName || !this.signupData.lastName || 
        !this.signupData.email || !this.signupData.password || !this.signupData.roleId) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
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

    console.log(this.signupData);

    this.authService.signup(this.signupData).subscribe({
      next: (response) => {
        this.successMessage = 'Cuenta creada exitosamente';
        this.isLoading = false;
        
        // Redirect to login after successful signup
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
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
