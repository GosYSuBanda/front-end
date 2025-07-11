import { Component, Output, EventEmitter } from '@angular/core';
import { FeedType } from '../../../core/models/post.model';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  selectedFilter: FeedType['type'] = 'following';
  
  @Output() filterChanged = new EventEmitter<FeedType['type']>();

  selectFilter(filter: FeedType['type']) {
    this.selectedFilter = filter;
    this.filterChanged.emit(filter);
  }
}
