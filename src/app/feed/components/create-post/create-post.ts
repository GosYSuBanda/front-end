import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../models/post.model';

interface FileWithPreview extends File {
  preview?: string;
  status?: 'loading' | 'ready' | 'error';
}

interface CreatePostRequest {
  content: string;
  type: Post['type'];
  media?: File[];
}

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.scss'
})
export class CreatePost {
  @Output() postCreated = new EventEmitter<Post>();
  
  postData = {
    content: '',
    type: 'text' as Post['type']
  };
  
  selectedFiles: FileWithPreview[] = [];
  isSubmitting = false;
  error: string | null = null;
  uploadProgress = 0;
  isDragOver = false;
  textareaValue = ''; // Para debug

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  onContentChange(event?: Event): void {
    console.log('📝 onContentChange triggered');
    
    // Forzar actualización del modelo si es necesario
    if (event) {
      const target = event.target as HTMLTextAreaElement;
      this.postData.content = target.value;
      this.textareaValue = target.value; // Para debug
    }
    
    console.log('📝 Content changed:', this.postData.content);
    console.log('📝 Content length:', (this.postData.content || '').length);
    console.log('📝 Trimmed length:', (this.postData.content || '').trim().length);
    
    this.detectPostType();
    
    // Forzar detección de cambios
    this.error = null;
    this.cdr.detectChanges();
  }

  onImageError(event: Event): void {
    console.log('❌ Image load error:', event);
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRkY2NTY1Ii8+Cjwvc3ZnPgo=';
  }

  private detectPostType(): void {
    const content = (this.postData.content || '').toLowerCase();
    console.log('🔍 Detecting post type for content:', content);
    
    // Detectar tipo basado en contenido
    if (this.selectedFiles.length > 0) {
      const hasImages = this.selectedFiles.some(file => file.type.startsWith('image/'));
      const hasDocuments = this.selectedFiles.some(file => !file.type.startsWith('image/'));
      
      if (hasImages && !hasDocuments) {
        this.postData.type = 'image';
      } else if (hasDocuments) {
        this.postData.type = 'text'; // Documento como texto enriquecido
      }
    } else {
      // Detectar por palabras clave
      if (content.includes('factura') || content.includes('invoice') || content.includes('cobro')) {
        this.postData.type = 'invoice';
      } else if (content.includes('trabajo') || content.includes('empleo') || content.includes('job') || 
                content.includes('vacante') || content.includes('contratando')) {
        this.postData.type = 'job';
      } else if (content.includes('evento') || content.includes('event') || content.includes('reunión') || 
                content.includes('conferencia') || content.includes('workshop')) {
        this.postData.type = 'event';
      } else if (content.includes('experiencia') || content.includes('aprendí') || content.includes('recomiendo') ||
                content.includes('consejo') || content.includes('tip')) {
        this.postData.type = 'experience';
      } else {
        this.postData.type = 'text';
      }
    }
    
    console.log('📋 Post type detected:', this.postData.type);
  }

  getFileStatus(file: FileWithPreview): string {
    if (file.preview && file.type.startsWith('image/')) {
      return 'ready';
    } else if (file.type.startsWith('image/') && !file.preview) {
      return 'loading';
    } else if (!file.type.startsWith('image/')) {
      return 'ready';
    }
    return 'error';
  }

  getPostTypeClass(): string {
    const typeClasses: Record<string, string> = {
      'text': 'type-text',
      'image': 'type-image',
      'video': 'type-video',
      'experience': 'type-experience',
      'invoice': 'type-invoice',
      'job': 'type-job',
      'event': 'type-event',
      'link': 'type-link',
      'poll': 'type-poll'
    };
    return typeClasses[this.postData.type] || 'type-text';
  }

  getPostTypeIcon(): string {
    const typeIcons: Record<string, string> = {
      'text': 'fas fa-font',
      'image': 'fas fa-image',
      'video': 'fas fa-video',
      'experience': 'fas fa-lightbulb',
      'invoice': 'fas fa-file-invoice',
      'job': 'fas fa-briefcase',
      'event': 'fas fa-calendar-alt',
      'link': 'fas fa-link',
      'poll': 'fas fa-poll'
    };
    return typeIcons[this.postData.type] || 'fas fa-font';
  }

  getPostTypeLabel(): string {
    const typeLabels: Record<string, string> = {
      'text': 'Texto',
      'image': 'Imagen',
      'video': 'Video',
      'experience': 'Experiencia',
      'invoice': 'Factura',
      'job': 'Trabajo',
      'event': 'Evento',
      'link': 'Enlace',
      'poll': 'Encuesta'
    };
    return typeLabels[this.postData.type] || 'Texto';
  }

  canSubmit(): boolean {
    // Verificar contenido
    const content = this.postData.content || '';
    const hasContent = content.trim().length > 0;
    // Verificar que no esté enviando
    const isNotSubmitting = !this.isSubmitting;
    
    const canSubmit = hasContent && isNotSubmitting;
    
    console.log('🔍 canSubmit check:', { 
      hasContent, 
      contentLength: content.length,
      trimmedLength: content.trim().length,
      isNotSubmitting, 
      canSubmit,
      content: `"${content.trim()}"`
    });
    
    return canSubmit;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    console.log('📁 Handling files:', files.length, 'files');
    
    // Validar número de archivos (máximo 8)
    const totalFiles = this.selectedFiles.length + files.length;
    if (totalFiles > 8) {
      this.error = 'Máximo 8 archivos permitidos';
      return;
    }

    // Validar tamaño de archivos (máximo 5MB cada uno)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = files.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      this.error = `Algunos archivos son demasiado grandes. Máximo 5MB por archivo.`;
      return;
    }

    // Validar tipos de archivo
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const invalidTypes = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      this.error = 'Algunos archivos no son del tipo permitido. Solo imágenes y documentos.';
      return;
    }

    // Procesar archivos válidos
    files.forEach((file, index) => {
      const fileWithPreview = file as FileWithPreview;
      console.log(`📄 Processing file ${index + 1}:`, file.name, file.type, file.size);
      
      // Crear preview para imágenes inmediatamente
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileWithPreview.preview = e.target?.result as string;
          console.log(`📸 Preview created for ${file.name}:`, fileWithPreview.preview ? 'SUCCESS' : 'FAILED');
          
          // Forzar re-renderizado
          this.selectedFiles = [...this.selectedFiles];
        };
        reader.onerror = (e) => {
          console.error(`❌ Error reading file ${file.name}:`, e);
        };
        reader.readAsDataURL(file);
      }
      
      // Agregar archivo a la lista inmediatamente
      this.selectedFiles.push(fileWithPreview);
    });

    console.log('📁 Total selected files:', this.selectedFiles.length);
    this.error = null;
    this.detectPostType(); // Redetectar tipo cuando se agregan archivos
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.detectPostType(); // Redetectar tipo cuando se eliminan archivos
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async onSubmit(): Promise<void> {
    console.log('🚀 onSubmit called');
    
    // Verificar autenticación PRIMERO
    if (!this.authService.isAuthenticated()) {
      console.log('❌ User not authenticated');
      this.error = 'Debes iniciar sesión para crear posts';
      return;
    }
    
    const currentUser = this.authService.getCurrentUserValue();
    const token = this.authService.getCurrentAccessToken();
    console.log('🔐 Auth status:', {
      isAuthenticated: this.authService.isAuthenticated(),
      hasUser: !!currentUser,
      hasToken: !!token,
      userEmail: currentUser?.email
    });
    
    if (!this.canSubmit()) {
      console.log('❌ Cannot submit, validation failed');
      this.error = 'Por favor, escribe algo antes de publicar';
      return;
    }

    // Validar contenido nuevamente
    const content = this.postData.content?.trim() || '';
    if (content.length === 0) {
      console.log('❌ Empty content after trim');
      this.error = 'El contenido no puede estar vacío';
      return;
    }

    if (content.length > 1500) {
      console.log('❌ Content too long');
      this.error = 'El contenido no puede exceder 1500 caracteres';
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.uploadProgress = 0;

    try {
      console.log('📝 Preparing post data...');
      
      // Crear objeto de datos según CreatePostRequest
      const postRequest: CreatePostRequest = {
        content: content,
        type: this.postData.type,
        media: this.selectedFiles.length > 0 ? this.selectedFiles : undefined
      };

      console.log('📤 Sending request to backend...');
      console.log('📤 Post request data:', postRequest);

      // Simular progreso de subida
      this.uploadProgress = 25;
      await this.delay(300);
      this.uploadProgress = 50;
      await this.delay(300);
      this.uploadProgress = 75;

      // Crear el post usando el servicio
      const postObservable = this.postService.createPost(postRequest);
      
      // Convertir Observable a Promise para usar async/await
      const response = await postObservable.toPromise();
      
      console.log('✅ Backend response:', response);
      
      this.uploadProgress = 100;
      
      // Verificar respuesta del backend
      if (response && response.success) {
        console.log('🎉 Post created successfully!');
        console.log('🎉 Post data:', response.data);
        console.log('🎉 Files uploaded:', response.filesUploaded || 0);
        
        // Emitir evento de post creado
        this.postCreated.emit(response.data);
        
        // Limpiar formulario
        this.resetForm();
        
        // Mostrar mensaje de éxito
        this.showSuccessMessage();
      } else {
        console.error('❌ Backend returned error:', response?.message || 'Unknown error');
        this.error = response?.message || 'Error al crear el post';
      }

    } catch (error) {
      console.error('❌ Error creating post:', error);
      
      // Manejar diferentes tipos de errores
      if (error && typeof error === 'object' && 'error' in error) {
        const errorObj = error as any;
        if (errorObj.error && errorObj.error.message) {
          this.error = errorObj.error.message;
        } else if (errorObj.message) {
          this.error = errorObj.message;
        } else {
          this.error = 'Error al crear el post';
        }
      } else if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error = 'Error interno del servidor. Inténtalo más tarde.';
      }
      
      this.uploadProgress = 0;
    } finally {
      this.isSubmitting = false;
    }
  }

  private generateTitle(content: string): string {
    if (!content || content.trim().length === 0) {
      return 'Post sin título';
    }
    
    // Tomar las primeras palabras hasta 50 caracteres
    let title = content.trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    // Limpiar caracteres especiales y múltiples espacios
    title = title.replace(/[^\w\s\-áéíóúüñÁÉÍÓÚÜÑ]/g, '')
                 .replace(/\s+/g, ' ')
                 .trim();
    
    return title || 'Post sin título';
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_áéíóúüñÁÉÍÓÚÜÑ]+/g;
    const hashtags = content.match(hashtagRegex) || [];
    return hashtags.map(tag => tag.replace('#', ''));
  }

  private resetForm(): void {
    this.postData = {
      content: '',
      type: 'text'
    };
    this.selectedFiles = [];
    this.uploadProgress = 0;
    this.error = null;
    this.textareaValue = '';
  }

  private showSuccessMessage(): void {
    // Crear un indicador visual de éxito
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        font-weight: bold;
        animation: slideIn 0.3s ease-in-out;
      ">
        <i class="fas fa-check-circle"></i>
        ¡Post publicado exitosamente!
      </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      document.body.removeChild(successDiv);
    }, 3000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 