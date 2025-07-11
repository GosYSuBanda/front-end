import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSize } from '../../../core/models/index';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="modal-overlay"
      [class.active]="isOpen"
      (click)="onOverlayClick($event)"
      [@fadeInOut]
    >
      <div 
        #modalContent
        class="modal-content"
        [class]="'modal-' + size"
        [class.active]="isOpen"
        (click)="$event.stopPropagation()"
        [@slideInOut]
      >
        <div class="modal-header" *ngIf="title || showCloseButton">
          <h3 class="modal-title" *ngIf="title">{{ title }}</h3>
          <button 
            *ngIf="showCloseButton"
            type="button" 
            class="modal-close"
            (click)="close()"
            [attr.aria-label]="'Cerrar modal'"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        
        <div class="modal-footer" *ngIf="showFooter">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(4px);
    }

    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      max-height: 90vh;
      overflow-y: auto;
      transform: scale(0.95) translateY(-20px);
      transition: all 0.3s ease;
      margin: 20px;
    }

    .modal-content.active {
      transform: scale(1) translateY(0);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #666;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-footer {
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    /* Tamaños */
    .modal-small {
      width: 400px;
      max-width: 90vw;
    }

    .modal-medium {
      width: 600px;
      max-width: 90vw;
    }

    .modal-large {
      width: 800px;
      max-width: 90vw;
    }

    .modal-xlarge {
      width: 1000px;
      max-width: 95vw;
    }

    .modal-fullscreen {
      width: 100vw;
      height: 100vh;
      max-width: 100vw;
      max-height: 100vh;
      border-radius: 0;
      margin: 0;
    }

    @media (max-width: 768px) {
      .modal-content {
        margin: 10px;
      }
      
      .modal-small,
      .modal-medium,
      .modal-large,
      .modal-xlarge {
        width: 95vw;
        max-width: 95vw;
      }
    }
  `],
  animations: [
    // Animations would go here if needed
  ]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() size: ModalSize = 'md';
  @Input() title?: string;
  @Input() showCloseButton: boolean = true;
  @Input() showFooter: boolean = false;
  @Input() closeOnOverlayClick: boolean = true;
  @Input() closeOnEscape: boolean = true;
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onOpen = new EventEmitter<void>();
  
  @ViewChild('modalContent') modalContent!: ElementRef;

  ngOnInit() {
    if (this.isOpen) {
      this.onOpen.emit();
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  close() {
    this.onClose.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKeydown() {
    if (this.closeOnEscape && this.isOpen) {
      this.close();
    }
  }
} 