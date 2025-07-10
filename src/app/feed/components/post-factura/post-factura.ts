import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Reactions } from '../../../models/post.model';

@Component({
  selector: 'app-post-factura',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-factura.html',
  styleUrl: './post-factura.scss'
})
export class PostFactura {
  @Input() postId: string = '';
  @Input() profileName: string = '';
  @Input() postText: string = '';
  @Input() postImage: string = '';
  @Input() post: any = null; // Para acceder a imageUrls
  @Input() inversionesProgreso: number = 0; // porcentaje 0-100
  @Input() comentarios: number = 0;
  @Input() likes: number = 0;
  @Input() reactions: Reactions = { like: 0, love: 0, laugh: 0 };

  @Output() reaction = new EventEmitter<'like' | 'love' | 'laugh'>();
  @Output() comment = new EventEmitter<string>();

  ngOnInit() {
    console.log('PostFactura - Reactions received:', this.reactions);
    console.log('PostFactura - Reactions type:', typeof this.reactions);
    console.log('PostFactura - Reactions isArray:', Array.isArray(this.reactions));
    console.log('PostFactura - Likes count:', this.reactions.like);
    console.log('PostFactura - Love count:', this.reactions.love);
    console.log('PostFactura - Laugh count:', this.reactions.laugh);
  }

  onReaction(type: 'like' | 'love' | 'laugh'): void {
    this.reaction.emit(type);
  }

  onComment(commentText: string): void {
    this.comment.emit(commentText);
  }
}
