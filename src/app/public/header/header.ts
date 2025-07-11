import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SearchService } from '../../core/services/search.service';
import { AuthUser } from '../../core/models/auth.model';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, AvatarComponent, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  isMenuOpen = false;
  isSearchFocused = false;
  searchQuery = '';
  searchSuggestions: any[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.subscriptions.push(
      this.authService.user$.subscribe((user: AuthUser | null) => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onSearchFocus(): void {
    this.isSearchFocused = true;
  }

  onSearchBlur(): void {
    // Delay to allow click on suggestions
    setTimeout(() => {
      this.isSearchFocused = false;
      this.searchSuggestions = [];
    }, 150);
  }

  onSearchInput(): void {
    if (this.searchQuery.trim().length > 2) {
      this.searchService.getSearchSuggestions(this.searchQuery).subscribe({
        next: (suggestions) => {
          this.searchSuggestions = suggestions.slice(0, 5);
        },
        error: (error) => {
          console.error('Error getting search suggestions:', error);
        }
      });
    } else {
      this.searchSuggestions = [];
    }
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery } 
      });
      this.searchQuery = '';
      this.searchSuggestions = [];
      this.isSearchFocused = false;
    }
  }

  selectSuggestion(suggestion: any): void {
    if (suggestion.type === 'user') {
      this.router.navigate(['/profile', suggestion.id]);
    } else if (suggestion.type === 'post') {
      this.router.navigate(['/feed'], { 
        queryParams: { postId: suggestion.id } 
      });
    }
    this.searchQuery = '';
    this.searchSuggestions = [];
    this.isSearchFocused = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error during logout:', error);
        // Force logout by navigation - the auth service will handle cleanup
        this.router.navigate(['/login']);
      }
    });
    this.closeMenu();
  }

  navigateToProfile(): void {
    if (this.currentUser) {
      this.router.navigate(['/profile', this.currentUser._id]);
    }
    this.closeMenu();
  }

  navigateToMessages(): void {
    this.router.navigate(['/messages']);
    this.closeMenu();
  }

  navigateToFeed(): void {
    this.router.navigate(['/feed']);
    this.closeMenu();
  }

  navigateToSearch(): void {
    this.router.navigate(['/search']);
    this.closeMenu();
  }
}
