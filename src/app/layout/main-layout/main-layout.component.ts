import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Header } from '../../public/header/header';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isAuthenticated = true; // Siempre mostrar header/sidebar en MainLayout
  isSidebarCollapsed = false;
  
  private authSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Verificar estado de autenticación para funcionalidades adicionales
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuth => {
      console.log('🔄 Auth state in MainLayout:', isAuth);
      // Mantener isAuthenticated = true para mostrar siempre header/sidebar
      // ya que este componente solo se usa para rutas protegidas
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onSidebarToggle(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
    console.log('📱 Sidebar toggled:', collapsed);
  }
} 