import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { AuthUser } from '../core/models/auth.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h1>Configuración</h1>
      </div>

      <div class="settings-content">
        <div class="settings-nav">
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'profile'"
            (click)="setActiveTab('profile')">
            Perfil
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'privacy'"
            (click)="setActiveTab('privacy')">
            Privacidad
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'notifications'"
            (click)="setActiveTab('notifications')">
            Notificaciones
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'account'"
            (click)="setActiveTab('account')">
            Cuenta
          </button>
        </div>

        <div class="settings-panel">
          <!-- Profile Settings -->
          <div *ngIf="activeTab === 'profile'" class="settings-section">
            <h2>Configuración del Perfil</h2>
            <div class="form-group">
              <label for="name">Nombre</label>
              <input 
                type="text" 
                id="name" 
                [(ngModel)]="userSettings.name" 
                class="form-control">
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                [(ngModel)]="userSettings.email" 
                class="form-control">
            </div>
            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input 
                type="tel" 
                id="phone" 
                [(ngModel)]="userSettings.phoneNumber" 
                class="form-control">
            </div>
            <button class="btn btn-primary" (click)="saveProfile()">
              Guardar Cambios
            </button>
          </div>

          <!-- Privacy Settings -->
          <div *ngIf="activeTab === 'privacy'" class="settings-section">
            <h2>Configuración de Privacidad</h2>
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="userSettings.profilePublic">
                Perfil público
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="userSettings.showEmail">
                Mostrar email en perfil
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="userSettings.allowMessages">
                Permitir mensajes de desconocidos
              </label>
            </div>
            <button class="btn btn-primary" (click)="savePrivacy()">
              Guardar Cambios
            </button>
          </div>

          <!-- Notification Settings -->
          <div *ngIf="activeTab === 'notifications'" class="settings-section">
            <h2>Configuración de Notificaciones</h2>
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="userSettings.emailNotifications">
                Notificaciones por email
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="userSettings.pushNotifications">
                Notificaciones push
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="userSettings.smsNotifications">
                Notificaciones SMS
              </label>
            </div>
            <button class="btn btn-primary" (click)="saveNotifications()">
              Guardar Cambios
            </button>
          </div>

          <!-- Account Settings -->
          <div *ngIf="activeTab === 'account'" class="settings-section">
            <h2>Configuración de Cuenta</h2>
            <div class="form-group">
              <label for="language">Idioma</label>
              <select 
                id="language" 
                [(ngModel)]="userSettings.language" 
                class="form-control">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div class="form-group">
              <label for="theme">Tema</label>
              <select 
                id="theme" 
                [(ngModel)]="userSettings.theme" 
                class="form-control">
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div class="danger-zone">
              <h3>Zona de Peligro</h3>
              <button class="btn btn-danger" (click)="deleteAccount()">
                Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .settings-header {
      margin-bottom: 30px;
    }

    .settings-content {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 30px;
    }

    .settings-nav {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .nav-item {
      padding: 12px 16px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background: #f5f5f5;
    }

    .nav-item.active {
      background: #007bff;
      color: white;
    }

    .settings-panel {
      min-height: 400px;
    }

    .settings-section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .settings-section h2 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .danger-zone {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #eee;
    }

    .danger-zone h3 {
      color: #dc3545;
      margin-bottom: 15px;
    }

    @media (max-width: 768px) {
      .settings-content {
        grid-template-columns: 1fr;
      }
      
      .settings-nav {
        flex-direction: row;
        overflow-x: auto;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  activeTab: 'profile' | 'privacy' | 'notifications' | 'account' = 'profile';
  currentUser: AuthUser | null = null;
  
  userSettings = {
    name: '',
    email: '',
    phoneNumber: '',
    profilePublic: true,
    showEmail: false,
    allowMessages: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    language: 'es',
    theme: 'light'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserSettings(user);
      }
    });
  }

  setActiveTab(tab: 'profile' | 'privacy' | 'notifications' | 'account'): void {
    this.activeTab = tab;
  }

  loadUserSettings(user: AuthUser): void {
    this.userSettings = {
      name: user.name || '',
      email: user.email || '',
      phoneNumber: '', // Add phone number to user model if needed
      profilePublic: true,
      showEmail: false,
      allowMessages: true,
      emailNotifications: user.preferences?.notifications || true,
      pushNotifications: true,
      smsNotifications: false,
      language: user.preferences?.language || 'es',
      theme: user.preferences?.theme || 'light'
    };
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    const updatedUser = {
      ...this.currentUser,
      name: this.userSettings.name,
      email: this.userSettings.email
    };

    this.authService.updateUserProfile(updatedUser).subscribe({
      next: () => {
        console.log('Perfil actualizado correctamente');
        // Show success message
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        // Show error message
      }
    });
  }

  savePrivacy(): void {
    console.log('Configuración de privacidad guardada:', {
      profilePublic: this.userSettings.profilePublic,
      showEmail: this.userSettings.showEmail,
      allowMessages: this.userSettings.allowMessages
    });
    // Implement privacy settings save logic
  }

  saveNotifications(): void {
    console.log('Configuración de notificaciones guardada:', {
      emailNotifications: this.userSettings.emailNotifications,
      pushNotifications: this.userSettings.pushNotifications,
      smsNotifications: this.userSettings.smsNotifications
    });
    // Implement notifications settings save logic
  }

  deleteAccount(): void {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      console.log('Eliminando cuenta...');
      // Implement account deletion logic
    }
  }
} 