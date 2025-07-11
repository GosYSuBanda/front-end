import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner" [class.loading-spinner--small]="size === 'small'" 
         [class.loading-spinner--large]="size === 'large'">
      <div class="spinner" [style.color]="color">
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
      </div>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .spinner {
      display: inline-block;
      position: relative;
      width: 40px;
      height: 40px;
    }

    .loading-spinner--small .spinner {
      width: 20px;
      height: 20px;
    }

    .loading-spinner--large .spinner {
      width: 60px;
      height: 60px;
    }

    .spinner-circle {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-circle:nth-child(2) {
      animation-delay: -0.33s;
      border-top-color: rgba(var(--primary-color, 59, 130, 246), 0.7);
    }

    .spinner-circle:nth-child(3) {
      animation-delay: -0.66s;
      border-top-color: rgba(var(--primary-color, 59, 130, 246), 0.4);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-message {
      margin-top: 12px;
      font-size: 14px;
      color: var(--text-secondary, #6b7280);
      text-align: center;
    }

    .loading-spinner--small .loading-message {
      font-size: 12px;
      margin-top: 8px;
    }

    .loading-spinner--large .loading-message {
      font-size: 16px;
      margin-top: 16px;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = 'var(--primary-color, #3b82f6)';
  @Input() message: string = '';
} 