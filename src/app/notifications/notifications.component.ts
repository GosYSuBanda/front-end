import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

export interface Notification {
  _id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'mention' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div class="notifications-header">
        <h1>Notificaciones</h1>
        <div class="header-actions">
          <button 
            class="btn btn-outline" 
            (click)="markAllAsRead()"
            [disabled]="!hasUnreadNotifications">
            Marcar todo como leído
          </button>
        </div>
      </div>

      <div class="notifications-content">
        <div class="notification-filters">
          <button 
            class="filter-btn" 
            [class.active]="selectedFilter === 'all'"
            (click)="onFilterChange('all')">
            Todas
          </button>
          <button 
            class="filter-btn" 
            [class.active]="selectedFilter === 'unread'"
            (click)="onFilterChange('unread')">
            No leídas
          </button>
          <button 
            class="filter-btn" 
            [class.active]="selectedFilter === 'mentions'"
            (click)="onFilterChange('mentions')">
            Menciones
          </button>
        </div>

        <div class="notifications-list">
          <div 
            *ngFor="let notification of filteredNotifications" 
            class="notification-item"
            [class.unread]="!notification.isRead"
            (click)="markAsRead(notification._id)">
            <div class="notification-icon">
              <i [class]="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-content">
              <h3>{{ notification.title }}</h3>
              <p>{{ notification.message }}</p>
              <small class="notification-time">
                {{ notification.createdAt | date:'short' }}
              </small>
            </div>
          </div>

          <div *ngIf="filteredNotifications.length === 0" class="no-notifications">
            <p>No tienes notificaciones</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .notification-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .filter-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }

    .filter-btn.active {
      background: #007bff;
      color: white;
    }

    .notification-item {
      display: flex;
      gap: 15px;
      padding: 15px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
    }

    .notification-item.unread {
      background: #f8f9fa;
      border-left: 4px solid #007bff;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-content h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
    }

    .notification-content p {
      margin: 0 0 5px 0;
      color: #666;
    }

    .notification-time {
      color: #999;
      font-size: 12px;
    }

    .no-notifications {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-outline {
      background: white;
      border: 1px solid #ddd;
      color: #333;
    }

    .btn-outline:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  selectedFilter: 'all' | 'unread' | 'mentions' = 'all';
  private subscriptions: Subscription[] = [];

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.isRead);
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications(): void {
    // Mock data for now
    this.notifications = [
      {
        _id: '1',
        userId: 'user1',
        type: 'like',
        title: 'Nueva reacción',
        message: 'A Juan le gustó tu publicación',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        userId: 'user1',
        type: 'comment',
        title: 'Nuevo comentario',
        message: 'María comentó en tu publicación',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    this.applyFilter();
  }

  onFilterChange(filter: 'all' | 'unread' | 'mentions'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.selectedFilter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.isRead);
        break;
      case 'mentions':
        this.filteredNotifications = this.notifications.filter(n => n.type === 'mention');
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n._id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.applyFilter();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.applyFilter();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'like':
        return 'fas fa-heart';
      case 'comment':
        return 'fas fa-comment';
      case 'follow':
        return 'fas fa-user-plus';
      case 'message':
        return 'fas fa-envelope';
      case 'mention':
        return 'fas fa-at';
      default:
        return 'fas fa-bell';
    }
  }
} 