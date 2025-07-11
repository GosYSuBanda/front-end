import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, DisplayUser } from '../../../core/models/user.model';
import { AuthUser } from '../../../core/models/auth.model';
import { AvatarSize } from '../../../core/models/index';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="avatar-container"
      [class]="'avatar-' + size"
      [attr.title]="user?.name || 'Usuario'"
    >
      <img 
        *ngIf="user?.profilePicture != null && user?.profilePicture !== '' ; else initialsTemplate"
        [src]="user?.profilePicture || ''"
        [alt]="user?.name ? user!.name : 'Usuario'"
        class="avatar-image"
        (error)="onImageError()"
      >
      
      <ng-template #initialsTemplate>
        <div class="avatar-initials">
          {{ getInitials() }}
        </div>
      </ng-template>
      
      <div 
        *ngIf="showBadge && user?.isVerified"
        class="verification-badge"
      >
        <i class="fas fa-check"></i>
      </div>
      
      <div 
        *ngIf="showOnlineStatus"
        class="online-status"
        [class.online]="isOnline"
        [class.offline]="!isOnline"
      >
      </div>
    </div>
  `,
  styles: [`
    .avatar-container {
      position: relative;
      display: inline-block;
      border-radius: 50%;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      text-align: center;
      line-height: 1;
      flex-shrink: 0;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .avatar-initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      text-transform: uppercase;
    }

    .verification-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 20px;
      height: 20px;
      background: #1976d2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .online-status {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .online-status.online {
      background-color: #4caf50;
    }

    .online-status.offline {
      background-color: #757575;
    }

    /* Tamaños */
    .avatar-xs {
      width: 24px;
      height: 24px;
      font-size: 10px;
    }

    .avatar-sm {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }

    .avatar-md {
      width: 48px;
      height: 48px;
      font-size: 16px;
    }

    .avatar-lg {
      width: 64px;
      height: 64px;
      font-size: 20px;
    }

    .avatar-xl {
      width: 96px;
      height: 96px;
      font-size: 28px;
    }

    .avatar-xs .verification-badge {
      width: 12px;
      height: 12px;
      font-size: 6px;
    }

    .avatar-sm .verification-badge {
      width: 16px;
      height: 16px;
      font-size: 8px;
    }

    .avatar-xs .online-status,
    .avatar-sm .online-status {
      width: 8px;
      height: 8px;
      border-width: 1px;
    }
  `]
})
export class AvatarComponent implements OnInit, OnDestroy {
  @Input() user: DisplayUser | User | AuthUser | null = null;
  @Input() size: AvatarSize = 'md';
  @Input() showBadge: boolean = true;
  @Input() showOnlineStatus: boolean = false;
  @Input() isOnline: boolean = false;

  private imageError = false;

  ngOnInit() {
    this.imageError = false;
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  getInitials(): string {
    if (!this.user?.name) return 'U';
    
    const names = this.user.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  onImageError() {
    this.imageError = true;
  }
} 