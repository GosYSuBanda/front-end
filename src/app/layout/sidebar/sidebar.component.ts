import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser } from '../../core/models/auth.model';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() sidebarToggle = new EventEmitter<boolean>();
  
  currentUser: AuthUser | null = null;
  isCollapsed = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.subscriptions.push(
      this.authService.user$.subscribe((user: AuthUser | null) => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    console.log('🔄 Sidebar toggled from sidebar component:', this.isCollapsed);
    this.sidebarToggle.emit(this.isCollapsed);
  }

  navigateToProfile(): void {
    if (this.currentUser) {
      this.router.navigate(['/profile', this.currentUser._id]);
    }
  }

  navigateToMessages(): void {
    this.router.navigate(['/messages']);
  }

  navigateToFeed(): void {
    this.router.navigate(['/feed']);
  }

  navigateToSearch(): void {
    this.router.navigate(['/search']);
  }

  navigateToBusiness(): void {
    this.router.navigate(['/business']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error during logout:', error);
        // Force logout by navigation - the auth service will handle cleanup
        this.router.navigate(['/login']);
      }
    });
  }
} 