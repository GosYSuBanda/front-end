import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  imports: [
    CommonModule,
    LoadingSpinnerComponent
  ],
  template: `
    <button 
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getButtonClasses()"
      (click)="onClick()">
      
      <app-loading-spinner 
        *ngIf="loading" 
        size="small" 
        class="button-spinner">
      </app-loading-spinner>
      
      <span *ngIf="icon && !loading" [class]="getIconClasses()">
        {{ icon }}
      </span>
      
      <span [class.button-text--loading]="loading">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      outline: none;
      position: relative;
      overflow: hidden;
    }

    button:focus {
      outline: 2px solid var(--primary-color, #3b82f6);
      outline-offset: 2px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Sizes */
    .button--small {
      padding: 8px 16px;
      font-size: 14px;
      min-height: 36px;
    }

    .button--medium {
      padding: 12px 24px;
      font-size: 16px;
      min-height: 44px;
    }

    .button--large {
      padding: 16px 32px;
      font-size: 18px;
      min-height: 52px;
    }

    /* Variants */
    .button--primary {
      background: var(--primary-color, #3b82f6);
      color: white;
    }

    .button--primary:hover:not(:disabled) {
      background: var(--primary-color-hover, #2563eb);
      transform: translateY(-1px);
    }

    .button--secondary {
      background: var(--secondary-color, #6b7280);
      color: white;
    }

    .button--secondary:hover:not(:disabled) {
      background: var(--secondary-color-hover, #4b5563);
      transform: translateY(-1px);
    }

    .button--outline {
      background: transparent;
      color: var(--primary-color, #3b82f6);
      border: 2px solid var(--primary-color, #3b82f6);
    }

    .button--outline:hover:not(:disabled) {
      background: var(--primary-color, #3b82f6);
      color: white;
    }

    .button--ghost {
      background: transparent;
      color: var(--primary-color, #3b82f6);
    }

    .button--ghost:hover:not(:disabled) {
      background: var(--primary-color-light, #eff6ff);
    }

    .button--danger {
      background: var(--danger-color, #ef4444);
      color: white;
    }

    .button--danger:hover:not(:disabled) {
      background: var(--danger-color-hover, #dc2626);
      transform: translateY(-1px);
    }

    .button--success {
      background: var(--success-color, #10b981);
      color: white;
    }

    .button--success:hover:not(:disabled) {
      background: var(--success-color-hover, #059669);
      transform: translateY(-1px);
    }

    /* Full width */
    .button--full-width {
      width: 100%;
    }

    /* Loading state */
    .button-spinner {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .button-text--loading {
      opacity: 0;
    }

    /* Icon */
    .button-icon {
      font-size: 1.2em;
    }

    .button-icon--left {
      margin-right: -4px;
    }

    .button-icon--right {
      margin-left: -4px;
    }

    /* Animations */
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }

    .button-ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      width: 20px;
      height: 20px;
      animation: ripple 0.6s linear;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  
  @Output() click = new EventEmitter<MouseEvent>();

  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.click.emit();
    }
  }

  getButtonClasses(): string {
    const classes = ['button'];
    
    classes.push(`button--${this.variant}`);
    classes.push(`button--${this.size}`);
    
    if (this.fullWidth) {
      classes.push('button--full-width');
    }
    
    if (this.loading) {
      classes.push('button--loading');
    }
    
    return classes.join(' ');
  }

  getIconClasses(): string {
    const classes = ['button-icon'];
    
    if (this.iconPosition === 'left') {
      classes.push('button-icon--left');
    } else {
      classes.push('button-icon--right');
    }
    
    return classes.join(' ');
  }
} 