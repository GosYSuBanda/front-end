import { Component, ViewChild } from '@angular/core';
import { Sidebar } from './components/sidebar/sidebar';
import { FeedList } from './feed-list/feed-list';
import { Asesores } from './components/asesores/asesores';
import { CreatePost } from './components/create-post/create-post';

@Component({
  selector: 'app-feed',
  imports: [Sidebar, FeedList, Asesores, CreatePost],
  templateUrl: './feed.html',
  styleUrl: './feed.scss'
})
export class Feed {
  @ViewChild('feedList') feedList!: FeedList;

  onFilterChanged(filter: string): void {
    if (this.feedList) {
      this.feedList.onFilterChanged(filter);
    }
  }
}
