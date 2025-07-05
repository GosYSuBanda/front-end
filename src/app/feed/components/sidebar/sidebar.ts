import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  selectedFilter: string = 'inicio';
  
  @Output() filterChanged = new EventEmitter<string>();

  selectFilter(filter: string) {
    this.selectedFilter = filter;
    this.filterChanged.emit(filter);
  }
}
