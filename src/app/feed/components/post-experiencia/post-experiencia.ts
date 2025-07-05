import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Reactions } from '../../../models/post.model';

@Component({
  selector: 'app-post-experiencia',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-experiencia.html',
  styleUrl: './post-experiencia.scss'
})
export class PostExperiencia {
  @Input() postId: string = '';
  @Input() profileName: string = '';
  @Input() postText: string = '';
  @Input() postImage: string = '';
  @Input() post: any = null; // Para acceder a imageUrls
  @Input() comentarios: number = 0;
  @Input() likes: number = 0;
  @Input() reactions: Reactions = { like: 0, love: 0, laugh: 0 };

  @Output() reaction = new EventEmitter<'like' | 'love' | 'laugh'>();
  @Output() comment = new EventEmitter<string>();

  onReaction(type: 'like' | 'love' | 'laugh'): void {
    this.reaction.emit(type);
  }

  onComment(commentText: string): void {
    this.comment.emit(commentText);
  }
}
