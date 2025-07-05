import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comment.html',
  styleUrl: './comment.scss'
})
export class Comment {
  @Input() profileName: string = '';
  @Input() commentText: string = '';
  @Input() profileImage: string = '';
}
