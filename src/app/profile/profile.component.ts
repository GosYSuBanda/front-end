import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../core/services/user.service';
// import { PostService } from '../core/services/post.service';
import { AuthService } from '../core/services/auth.service';
import { User, UserMetrics, DisplayUser } from '../core/models/user.model';
import { AuthUser } from '../core/models/auth.model';
import { Post } from '../core/models/post.model';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
import { AvatarComponent } from '../shared/components/avatar/avatar.component';
import { TimeAgoPipe } from '../shared/pipes/time-ago.pipe';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { ButtonComponent } from '../shared/components/button/button.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    AvatarComponent,
    ModalComponent,
    ButtonComponent,
    TimeAgoPipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  profileUser: User | null = null;
  userPosts: Post[] = [];
  userMetrics: UserMetrics | null = null;
  isOwnProfile = false;
  isLoading = false;
  isLoadingPosts = false;
  isLoadingMetrics = false;
  error: string | null = null;

  // Profile sections
  activeTab: 'posts' | 'about' | 'metrics' | 'connections' = 'posts';
  
  // Edit profile modal
  showEditModal = false;
  editForm = {
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    phoneNumber: '',
    businessInfo: {
      companyName: '',
      position: '',
      industry: '',
      website: '',
      description: ''
    },
    preferences: {
      language: 'es',
      timezone: 'America/Lima',
      emailNotifications: true,
      pushNotifications: true,
      privacyLevel: 'friends' as 'public' | 'friends' | 'private'
    }
  };

  // Follow/Unfollow status
  isFollowing = false;
  isFollowLoading = false;

  // Posts pagination
  currentPage = 1;
  pageSize = 10;
  hasMorePosts = true;

  // Connections
  followers: DisplayUser[] = [];
  following: DisplayUser[] = [];
  showFollowersModal = false;
  showFollowingModal = false;

  private subscriptions: Subject<void> = new Subject();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.user$.pipe(takeUntil(this.subscriptions)).subscribe(user => {
      this.currentUser = user;
    });

    // Get user ID from route
    this.route.params.pipe(takeUntil(this.subscriptions)).subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.loadProfile(userId);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.next();
    this.subscriptions.complete();
  }

  loadProfile(userId: string): void {
    this.isLoading = true;
    this.error = null;

    // Check if it's own profile
    this.isOwnProfile = this.currentUser?._id === userId;

    this.userService.getUser(userId).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (user) => {
        this.profileUser = user;
        this.isLoading = false;
        
        // Load additional data
        this.loadUserPosts(userId);
        this.loadUserMetrics(userId);
        this.checkFollowStatus(userId);
        
        // Initialize edit form if own profile
        if (this.isOwnProfile) {
          this.initializeEditForm();
        }
      },
      error: (error) => {
        this.error = 'Error al cargar el perfil';
        this.isLoading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  loadUserPosts(userId: string): void {
    this.isLoadingPosts = true;
    // TODO: Implementar cuando PostService tenga getPostsByUser
    this.userPosts = [];
    this.hasMorePosts = false;
    this.isLoadingPosts = false;
  }

  loadUserMetrics(userId: string): void {
    this.isLoadingMetrics = true;

    this.userService.getUserMetrics(userId).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (metrics) => {
        this.userMetrics = metrics;
        this.isLoadingMetrics = false;
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
        this.isLoadingMetrics = false;
      }
    });
  }

  checkFollowStatus(userId: string): void {
    if (!this.currentUser || this.isOwnProfile) return;

    this.userService.checkFollowStatus(userId).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (isFollowing) => {
        this.isFollowing = isFollowing;
      },
      error: (error) => {
        console.error('Error checking follow status:', error);
      }
    });
  }

  toggleFollow(): void {
    if (!this.profileUser || this.isOwnProfile || this.isFollowLoading) return;

    this.isFollowLoading = true;

    const action = this.isFollowing ? 
      this.userService.unfollowUser(this.profileUser._id) :
      this.userService.followUser(this.profileUser._id);

    action.pipe(takeUntil(this.subscriptions)).subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        this.isFollowLoading = false;
        
        // Update follower count
        if (this.profileUser) {
          const currentFollowers = Array.isArray(this.profileUser.followers) 
            ? this.profileUser.followers.length 
            : 0;
          // We'll update the followers array properly
          this.loadUserMetrics(this.profileUser._id);
        }
      },
      error: (error) => {
        this.error = 'Error al actualizar el seguimiento';
        this.isFollowLoading = false;
        console.error('Error toggling follow:', error);
      }
    });
  }

  loadMorePosts(): void {
    if (!this.hasMorePosts || this.isLoadingPosts || !this.profileUser) return;

    this.currentPage++;
    this.loadUserPosts(this.profileUser._id);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab as 'posts' | 'about' | 'metrics' | 'connections';
  }

  openEditModal(): void {
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.initializeEditForm();
  }

  initializeEditForm(): void {
    if (!this.profileUser) return;

    this.editForm = {
      name: this.profileUser.name,
      email: this.profileUser.email,
      bio: this.profileUser.bio || '',
      location: this.profileUser.location || '',
      website: this.profileUser.website || '',
      phoneNumber: this.profileUser.phoneNumber || '',
      businessInfo: {
        companyName: this.profileUser.businessInfo?.companyName || '',
        position: this.profileUser.businessInfo?.position || '',
        industry: this.profileUser.businessInfo?.industry || '',
        website: this.profileUser.businessInfo?.website || '',
        description: this.profileUser.businessInfo?.description || ''
      },
      preferences: {
        language: this.profileUser.preferences?.language || 'es',
        timezone: this.profileUser.preferences?.timezone || 'America/Lima',
        emailNotifications: this.profileUser.preferences?.emailNotifications ?? true,
        pushNotifications: this.profileUser.preferences?.pushNotifications ?? true,
        privacyLevel: this.profileUser.preferences?.privacyLevel || 'friends'
      }
    };
  }

  saveProfile(): void {
    if (!this.profileUser) return;

    const updateData = {
      ...this.editForm,
      roles: Array.isArray(this.profileUser.roles) 
        ? this.profileUser.roles.map(role => typeof role === 'string' ? role : role.name)
        : this.profileUser.roles
    };

    this.userService.updateProfile(this.profileUser._id, updateData).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (updatedUser: User) => {
        this.profileUser = updatedUser;
        this.closeEditModal();
        
        // Update auth user if editing own profile
        if (this.isOwnProfile) {
          this.authService.updateUserProfile(updatedUser as any);
        }
      },
      error: (error: any) => {
        this.error = 'Error al actualizar el perfil';
        console.error('Error updating profile:', error);
      }
    });
  }

  loadFollowers(): void {
    if (!this.profileUser) return;

    this.userService.getFollowers(this.profileUser._id).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (response) => {
        this.followers = response.data;
        this.showFollowersModal = true;
      },
      error: (error) => {
        console.error('Error loading followers:', error);
      }
    });
  }

  loadFollowing(): void {
    if (!this.profileUser) return;

    this.userService.getFollowing(this.profileUser._id).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (response) => {
        this.following = response.data;
        this.showFollowingModal = true;
      },
      error: (error) => {
        console.error('Error loading following:', error);
      }
    });
  }

  closeFollowersModal(): void {
    this.showFollowersModal = false;
    this.followers = [];
  }

  closeFollowingModal(): void {
    this.showFollowingModal = false;
    this.following = [];
  }

  navigateToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
    this.closeFollowersModal();
    this.closeFollowingModal();
  }

  shareProfile(): void {
    if (!this.profileUser) return;

    const profileUrl = `${window.location.origin}/profile/${this.profileUser._id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${this.profileUser.name}`,
        text: `Mira el perfil de ${this.profileUser.name} en FinSmart Network`,
        url: profileUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(profileUrl).then(() => {
        alert('Link del perfil copiado al portapapeles');
      });
    }
  }

  sendMessage(): void {
    if (!this.profileUser) return;

    // Navigate to messages with this user
    this.router.navigate(['/messages'], {
      queryParams: { userId: this.profileUser._id }
    });
  }

  blockUser(): void {
    if (!this.profileUser || this.isOwnProfile) return;

    if (confirm(`¿Estás seguro de que quieres bloquear a ${this.profileUser.name}?`)) {
      this.userService.blockUser(this.profileUser._id).pipe(takeUntil(this.subscriptions)).subscribe({
        next: () => {
          this.router.navigate(['/feed']);
        },
        error: (error) => {
          this.error = 'Error al bloquear usuario';
          console.error('Error blocking user:', error);
        }
      });
    }
  }

  reportUser(): void {
    if (!this.profileUser || this.isOwnProfile) return;

    const reason = prompt('¿Por qué quieres reportar a este usuario?');
    if (reason && reason.trim()) {
      this.userService.reportUser(this.profileUser._id, reason).pipe(takeUntil(this.subscriptions)).subscribe({
        next: () => {
          alert('Usuario reportado exitosamente');
        },
        error: (error) => {
          this.error = 'Error al reportar usuario';
          console.error('Error reporting user:', error);
        }
      });
    }
  }

  getConnectionsCount(): number {
    const followersCount = Array.isArray(this.profileUser?.followers) 
      ? this.profileUser.followers.length 
      : 0;
    const followingCount = Array.isArray(this.profileUser?.following) 
      ? this.profileUser.following.length 
      : 0;
    return followersCount + followingCount;
  }

  getEngagementRate(): number {
    if (!this.userMetrics) return 0;

    const { totalPosts, totalComments } = this.userMetrics;
    const totalLikes = this.userMetrics.totalLikes || 0;
    
    if (totalPosts === 0) return 0;
    
    return Math.round(((totalLikes + totalComments) / totalPosts) * 100) / 100;
  }

  getProfileCompleteness(): number {
    if (!this.profileUser) return 0;

    const fields = [
      this.profileUser.name,
      this.profileUser.email,
      this.profileUser.bio,
      this.profileUser.location,
      this.profileUser.profilePicture,
      this.profileUser.businessInfo?.companyName,
      this.profileUser.businessInfo?.position
    ];

    const completedFields = fields.filter(field => field && field.trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  }
} 