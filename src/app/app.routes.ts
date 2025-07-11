import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  // Public routes (NO MainLayout)
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
    title: 'Iniciar Sesión - FinSmart Network'
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup').then(m => m.Signup),
    title: 'Registrarse - FinSmart Network'
  },

  // Protected routes with main layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/feed',
        pathMatch: 'full'
      },
      {
        path: 'feed',
        loadComponent: () => import('./feed/feed').then(m => m.Feed),
        title: 'Feed - FinSmart Network'
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
        title: 'Mi Perfil - FinSmart Network'
      },
      {
        path: 'profile/:id',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
        title: 'Perfil - FinSmart Network'
      },
      {
        path: 'messages',
        loadComponent: () => import('./messages/messages.component').then(m => m.MessagesComponent),
        title: 'Mensajes - FinSmart Network'
      },
      {
        path: 'messages/:conversationId',
        loadComponent: () => import('./messages/messages.component').then(m => m.MessagesComponent),
        title: 'Mensajes - FinSmart Network'
      },
      {
        path: 'search',
        loadComponent: () => import('./search/search.component').then(m => m.SearchComponent),
        title: 'Búsqueda - FinSmart Network'
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Notificaciones - FinSmart Network'
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
        title: 'Configuración - FinSmart Network'
      },
      // Business routes as children
      {
        path: 'business',
        children: [
          {
            path: '',
            redirectTo: '/business/dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./business/dashboard/dashboard.component').then(m => m.DashboardComponent),
            title: 'Dashboard Empresarial - FinSmart Network'
          },
          {
            path: 'analytics',
            loadComponent: () => import('./business/analytics/analytics.component').then(m => m.AnalyticsComponent),
            title: 'Analíticas - FinSmart Network'
          },
          {
            path: 'invoices',
            loadComponent: () => import('./business/invoices/invoices.component').then(m => m.InvoicesComponent),
            title: 'Facturas - FinSmart Network'
          },
          {
            path: 'clients',
            loadComponent: () => import('./business/clients/clients.component').then(m => m.ClientsComponent),
            title: 'Clientes - FinSmart Network'
          }
        ]
      }
    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: '/login'
  }
];