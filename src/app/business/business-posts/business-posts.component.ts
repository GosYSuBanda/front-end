import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { Post, BusinessPostFilters } from '../../core/models/post.model';
import { AuthUser } from '../../core/models/auth.model';
import { ButtonSize, ModalSize } from '../../core/models/ui.types';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

interface BusinessStats {
  totalPosts: number;
  totalInvoices: number;
  totalAmount: number;
  averageAmount: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  topSectors: { sector: string; count: number }[];
  monthlyTrends: { month: string; posts: number; amount: number }[];
}

@Component({
  selector: 'app-business-posts',
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
  templateUrl: './business-posts.component.html',
  styleUrl: './business-posts.component.scss'
})
export class BusinessPostsComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  businessPosts: Post[] = [];
  businessStats: BusinessStats | null = null;
  isLoading = false;
  isLoadingStats = false;
  error: string | null = null;

  // Filters
  filters: BusinessPostFilters = {
    sortBy: 'newest',
    limit: 20,
    page: 1,
    amountRange: {
      min: 0,
      max: 10000
    }
  };

  // Pagination
  currentPage = 1;
  pageSize = 20;
  hasMore = true;
  totalPosts = 0;

  // Filter options
  sectors = [
    'Tecnología', 'Finanzas', 'Salud', 'Educación', 'Retail',
    'Manufactura', 'Servicios', 'Construcción', 'Transporte',
    'Consultoría', 'Marketing', 'Inmobiliario', 'Otros'
  ];

  currencies = ['USD', 'EUR', 'PEN', 'MXN', 'COP', 'CLP', 'ARS'];

  invoiceStatuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagado' },
    { value: 'overdue', label: 'Vencido' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  sortOptions = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'popular', label: 'Más populares' },
    { value: 'amount_high', label: 'Monto mayor' },
    { value: 'amount_low', label: 'Monto menor' }
  ];

  // Create post modal
  showCreateModal = false;
  createPostForm = {
    content: '',
    type: 'experience' as Post['type'],
    businessInfo: {
      companyName: '',
      sector: '',
      invoiceNumber: '',
      amount: 0,
      currency: 'USD',
      dueDate: '',
      status: 'pending' as const,
      clientInfo: {
        name: '',
        email: '',
        phone: ''
      },
      services: [
        {
          description: '',
          quantity: 1,
          price: 0,
          total: 0
        }
      ]
    }
  };

  // Export modal
  showExportModal = false;
  exportFilters = {
    format: 'csv',
    dateRange: {
      start: '',
      end: ''
    },
    includeStats: true
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.subscriptions.push(
      this.authService.user$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadBusinessPosts();
          this.loadBusinessStats();
        }
      })
    );

    // Handle query parameters
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        this.updateFiltersFromParams(params);
        this.loadBusinessPosts();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBusinessPosts(): void {

  }

  loadBusinessStats(): void {
    this.isLoadingStats = true;

  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadBusinessPosts();
    this.loadBusinessStats();
    this.updateUrlParams();
  }

  clearFilters(): void {
    this.filters = {
      sortBy: 'newest',
      limit: 20,
      page: 1
    };
    this.currentPage = 1;
    this.loadBusinessPosts();
    this.loadBusinessStats();
    this.updateUrlParams();
  }

  loadMorePosts(): void {
    if (!this.hasMore || this.isLoading) return;

    this.currentPage++;
    this.filters.page = this.currentPage;
    this.loadBusinessPosts();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.initializeCreateForm();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.initializeCreateForm();
  }

  initializeCreateForm(): void {
    this.createPostForm = {
      content: '',
      type: 'experience',
      businessInfo: {
        companyName: this.currentUser?.businessInfo?.companyName || '',
        sector: this.currentUser?.businessInfo?.sector || '',
        invoiceNumber: '',
        amount: 0,
        currency: 'USD',
        dueDate: '',
        status: 'pending',
        clientInfo: {
          name: '',
          email: '',
          phone: ''
        },
        services: [
          {
            description: '',
            quantity: 1,
            price: 0,
            total: 0
          }
        ]
      }
    };
  }

  addService(): void {
    this.createPostForm.businessInfo.services.push({
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    });
  }

  removeService(index: number): void {
    if (this.createPostForm.businessInfo.services.length > 1) {
      this.createPostForm.businessInfo.services.splice(index, 1);
    }
  }

  calculateServiceTotal(index: number): void {
    const service = this.createPostForm.businessInfo.services[index];
    service.total = service.quantity * service.price;
    this.calculateTotalAmount();
  }

  calculateTotalAmount(): void {
    this.createPostForm.businessInfo.amount = this.createPostForm.businessInfo.services
      .reduce((total, service) => total + service.total, 0);
  }

  createBusinessPost(): void {
    if (!this.createPostForm.content.trim()) return;

    this.isLoading = true;

    const postData = {
      content: this.createPostForm.content,
      type: this.createPostForm.type,
      category: 'business' as const,
      businessInfo: this.createPostForm.businessInfo
    };

    this.postService.createPost(postData).subscribe({
      next: (post) => {
        this.businessPosts.unshift(post);
        this.totalPosts++;
        this.closeCreateModal();
        this.isLoading = false;
        this.loadBusinessStats(); // Refresh stats
      },
      error: (error) => {
        this.error = 'Error al crear post empresarial';
        this.isLoading = false;
        console.error('Error creating business post:', error);
      }
    });
  }

  openExportModal(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  exportBusinessData(): void {
    const exportData = {
      ...this.exportFilters,
      filters: this.filters
    };

    // In a real app, this would call an export service
    console.log('Exporting business data:', exportData);
    
    // Simulate export
    const data = this.businessPosts.map(post => ({
      fecha: post.createdAt,
      empresa: post.businessInfo?.companyName || 'N/A',
      sector: post.businessInfo?.sector || 'N/A',
      contenido: post.content,
      monto: post.businessInfo?.amount || 0,
      moneda: post.businessInfo?.currency || 'USD',
      estado: post.businessInfo?.status || 'N/A'
    }));

    this.downloadCSV(data, 'business_posts_export.csv');
    this.closeExportModal();
  }

  private downloadCSV(data: any[], filename: string): void {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' ? `"${val}"` : val
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  navigateToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
  }

  navigateToPost(postId: string): void {
    this.router.navigate(['/feed'], { queryParams: { postId } });
  }

  getTotalAmount(): number {
    return this.businessPosts.reduce((total, post) => 
      total + (post.businessInfo?.amount || 0), 0
    );
  }

  getInvoiceStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'primary';
    }
  }

  private updateFiltersFromParams(params: any): void {
    if (params.companyName) this.filters.companyName = params.companyName;
    if (params.sector) this.filters.sector = params.sector;
    if (params.currency) this.filters.currency = params.currency;
    if (params.invoiceStatus) this.filters.invoiceStatus = params.invoiceStatus;
    if (params.sortBy) this.filters.sortBy = params.sortBy;
    if (params.minAmount) this.filters.amountRange = { ...this.filters.amountRange, min: +params.minAmount };
    if (params.maxAmount) this.filters.amountRange = { ...this.filters.amountRange, max: +params.maxAmount };
  }

  private updateUrlParams(): void {
    const queryParams: any = {};

    if (this.filters.companyName) queryParams.companyName = this.filters.companyName;
    if (this.filters.sector) queryParams.sector = this.filters.sector;
    if (this.filters.currency) queryParams.currency = this.filters.currency;
    if (this.filters.invoiceStatus) queryParams.invoiceStatus = this.filters.invoiceStatus;
    if (this.filters.sortBy !== 'newest') queryParams.sortBy = this.filters.sortBy;
    if (this.filters.amountRange?.min) queryParams.minAmount = this.filters.amountRange.min;
    if (this.filters.amountRange?.max) queryParams.maxAmount = this.filters.amountRange.max;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
} 