import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MessageService } from '../core/services/message.service';
import { UserService } from '../core/services/user.service';
import { AuthService } from '../core/services/auth.service';
import { Conversation, Message, SendMessageRequest, ConversationPreview, CreateConversationRequest, ConversationParticipant } from '../core/models/message.model';
import { AuthUser } from '../core/models/auth.model';
import { User, DisplayUser } from '../core/models/user.model';
import { PaginatedResponse } from '../core/models/api-response.model';
import { ModalSize } from '../core/models/ui.types';
import { AvatarComponent } from '../shared/components/avatar/avatar.component';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { TimeAgoPipe } from '../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    AvatarComponent,
    TimeAgoPipe,
    ModalComponent
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit, OnDestroy {
  // ViewChild properties removed as per new_code
  // @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  // @ViewChild('newConversationModal') newConversationModal!: ModalComponent;

  currentUser: AuthUser | null = null;
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  isLoadingMessages = false;
  isLoadingConversations = false;
  error: string | null = null;

  // Search and filters
  searchQuery = '';
  filteredConversations: Conversation[] = [];
  conversationFilter: 'all' | 'unread' | 'groups' | 'direct' = 'all';
  
  filters = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'unread' as const, label: 'No leídas' },
    { value: 'groups' as const, label: 'Grupos' },
    { value: 'direct' as const, label: 'Directos' }
  ];

  // New conversation
  showNewConversationModal = false;
  selectedUsers: DisplayUser[] = [];
  newConversationName = '';
  availableUsers: DisplayUser[] = [];
  userSearchQuery = '';

  // Typing indicators
  typingUsers: { [conversationId: string]: string[] } = {};
  typingTimeout: any;

  // File upload
  selectedFiles: File[] = [];

  private subscriptions: Subject<void> = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
    // private route: ActivatedRoute // Removed as per new_code
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.user$.pipe(takeUntil(this.subscriptions)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadConversations();
      }
    });

    // Check for conversation ID in route
    // this.subscriptions.push( // Removed as per new_code
    //   this.route.params.subscribe(params => {
    //     if (params['conversationId']) {
    //       this.selectConversationById(params['conversationId']);
    //     }
    //   })
    // );

    // Subscribe to real-time updates
    this.messageService.newMessage$.pipe(takeUntil(this.subscriptions)).subscribe(message => {
      this.handleNewMessage(message);
    });

    // Note: messageRead$ and typingUpdate$ observables don't exist in MessageService yet
    // Commenting them out until they're implemented
    // this.messageService.messageRead$.pipe(takeUntil(this.subscriptions)).subscribe(({ conversationId, messageId, userId }) => {
    //   this.handleMessageRead(conversationId, messageId, userId);
    // });

    // this.messageService.typingUpdate$.pipe(takeUntil(this.subscriptions)).subscribe(({ conversationId, userId, isTyping }) => {
    //   this.handleTypingUpdate(conversationId, userId, isTyping);
    // });
  }

  ngOnDestroy(): void {
    this.subscriptions.next();
    this.subscriptions.complete();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  loadConversations(): void {
    this.isLoadingConversations = true;
    this.error = null;

    this.messageService.getConversations().pipe(takeUntil(this.subscriptions)).subscribe({
      next: (response) => {
        this.conversations = response.data.map(p => p.conversation);
        this.isLoadingConversations = false;
        
        // Select first conversation if none selected
        if (!this.selectedConversation && response.data.length > 0) {
          this.selectConversation(response.data[0].conversation);
        }
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.error = 'Error al cargar las conversaciones';
        this.isLoadingConversations = false;
      }
    });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.messages = [];
    this.loadMessages(conversation._id);
    this.markConversationAsRead(conversation._id);

    // Update URL
    this.router.navigate(['/messages', conversation._id]);
  }

  selectConversationById(conversationId: string): void {
    const conversation = this.conversations.find(c => c._id === conversationId);
    if (conversation) {
      this.selectConversation(conversation);
    }
  }

  loadMessages(conversationId: string): void {
    this.isLoadingMessages = true;

    this.messageService.getMessages(conversationId).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (response) => {
        this.messages = response.data;
        this.isLoadingMessages = false;
        this.scrollToBottom();
      },
      error: (error) => {
        this.error = 'Error al cargar mensajes';
        this.isLoadingMessages = false;
        console.error('Error loading messages:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.selectedConversation || (!this.newMessage.trim() && this.selectedFiles.length === 0)) {
      return;
    }

    const messageData: SendMessageRequest = {
      conversationId: this.selectedConversation._id,
      content: this.newMessage.trim(),
      type: this.selectedFiles.length > 0 ? 'file' : 'text'
    };

    this.messageService.sendMessage(messageData).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.newMessage = '';
        this.selectedFiles = [];
        this.scrollToBottom();
        this.updateConversationLastMessage(message);
      },
      error: (error) => {
        this.error = 'Error al enviar mensaje';
        console.error('Error sending message:', error);
      }
    });
  }

  onMessageInput(): void {
    if (!this.selectedConversation || !this.currentUser) return;

    // Send typing indicator
    this.messageService.sendTypingIndicator(this.selectedConversation._id, true);

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Stop typing after 2 seconds
    this.typingTimeout = setTimeout(() => {
      this.messageService.sendTypingIndicator(this.selectedConversation!._id, false);
    }, 2000);
  }

  markConversationAsRead(conversationId: string): void {
    this.messageService.markConversationAsRead(conversationId).pipe(takeUntil(this.subscriptions)).subscribe({
      next: () => {
        // Update conversation unread count
        const conversation = this.conversations.find(c => c._id === conversationId);
        if (conversation) {
          conversation.unreadCount = 0;
        }
      },
      error: (error) => {
        console.error('Error marking conversation as read:', error);
      }
    });
  }

  deleteMessage(messageId: string): void {
    if (!this.selectedConversation) return;

    if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      this.messageService.deleteMessage(messageId).pipe(takeUntil(this.subscriptions)).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m._id !== messageId);
        },
        error: (error) => {
          this.error = 'Error al eliminar mensaje';
          console.error('Error deleting message:', error);
        }
      });
    }
  }

  openNewConversationModal(): void {
    this.showNewConversationModal = true;
    this.loadAvailableUsers();
  }

  closeNewConversationModal(): void {
    this.showNewConversationModal = false;
    this.selectedUsers = [];
    this.newConversationName = '';
    this.userSearchQuery = '';
  }

  loadAvailableUsers(): void {
    this.userService.searchUsers({ limit: 50 }).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (response) => {
        this.availableUsers = response.data.filter(user => 
          user._id !== this.currentUser?._id
        );
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  searchUsers(): void {
    if (this.userSearchQuery.trim().length > 2) {
      this.userService.searchUsers({ query: this.userSearchQuery }).pipe(takeUntil(this.subscriptions)).subscribe({
        next: (response) => {
          this.availableUsers = response.data.filter(user => 
            user._id !== this.currentUser?._id
          );
        },
        error: (error) => {
          console.error('Error searching users:', error);
        }
      });
    }
  }

  toggleUserSelection(user: DisplayUser): void {
    const index = this.selectedUsers.findIndex(u => u._id === user._id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  isUserSelected(user: DisplayUser): boolean {
    return this.selectedUsers.some(u => u._id === user._id);
  }

  createConversation(): void {
    if (this.selectedUsers.length === 0) return;

    const isGroup = this.selectedUsers.length > 1;
    const participantIds = this.selectedUsers.map(u => u._id);

    this.messageService.createConversation({
      type: isGroup ? 'group' : 'private',
      participants: participantIds,
      name: isGroup ? this.newConversationName : undefined
    }).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (conversation) => {
        this.conversations.unshift(conversation);
        this.filterConversations();
        this.selectConversation(conversation);
        this.closeNewConversationModal();
      },
      error: (error) => {
        this.error = 'Error al crear conversación';
        console.error('Error creating conversation:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  filterConversations(): void {
    let filtered = [...this.conversations];

    // Apply search filter
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(conv => 
        conv.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        conv.participants.some(p => 
          p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      );
    }

    // Apply type filter
    switch (this.conversationFilter) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'groups':
        filtered = filtered.filter(conv => conv.isGroup);
        break;
      case 'direct':
        filtered = filtered.filter(conv => !conv.isGroup);
        break;
    }

    this.filteredConversations = filtered;
  }

  onSearchChange(): void {
    this.filterConversations();
  }

  onFilterChange(filter: typeof this.conversationFilter): void {
    this.conversationFilter = filter;
    this.filterConversations();
  }

  getConversationName(conversation: Conversation): string {
    if (conversation.name) {
      return conversation.name;
    }
    
    if (conversation.isGroup) {
      return conversation.participants.map(p => p.name).join(', ');
    }
    
    const otherParticipant = conversation.participants.find(p => p._id !== this.currentUser?._id);
    return otherParticipant?.name || 'Usuario desconocido';
  }

  getConversationAvatar(conversation: Conversation): any {
    if (!conversation.isGroup) {
      return conversation.participants.find(p => p._id !== this.currentUser?._id);
    }
    return null; // Group avatar logic
  }

  getTypingIndicator(conversationId: string): string {
    const typing = this.typingUsers[conversationId];
    if (!typing || typing.length === 0) return '';

    if (typing.length === 1) {
      return `${typing[0]} está escribiendo...`;
    } else if (typing.length === 2) {
      return `${typing[0]} y ${typing[1]} están escribiendo...`;
    } else {
      return `${typing.length} personas están escribiendo...`;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      // if (this.messagesContainer) { // Removed as per new_code
      //   const element = this.messagesContainer.nativeElement;
      //   element.scrollTop = element.scrollHeight;
      // }
    }, 100);
  }

  private handleNewMessage(message: Message): void {
    // Add to current conversation if it matches
    if (this.selectedConversation && message.conversation === this.selectedConversation._id) {
      this.messages.push(message);
      this.scrollToBottom();
    }

    // Update conversation last message
    this.updateConversationLastMessage(message);
  }

  private handleMessageRead(conversationId: string, messageId: string, userId: string): void {
    if (this.selectedConversation && this.selectedConversation._id === conversationId) {
      const message = this.messages.find(m => m._id === messageId);
      if (message && !message.readBy.find(r => r.user === userId)) {
        message.readBy.push({ user: userId, readAt: new Date().toISOString() });
      }
    }
  }

  private handleTypingUpdate(conversationId: string, userId: string, isTyping: boolean): void {
    if (!this.typingUsers[conversationId]) {
      this.typingUsers[conversationId] = [];
    }

    const typingList = this.typingUsers[conversationId];
    const index = typingList.indexOf(userId);

    if (isTyping && index === -1) {
      typingList.push(userId);
    } else if (!isTyping && index > -1) {
      typingList.splice(index, 1);
    }
  }

  private updateConversationLastMessage(message: Message): void {
    const conversation = this.conversations.find(c => c._id === message.conversation);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = message.createdAt;
      
      // Update unread count if not current conversation
      if (this.selectedConversation?._id !== conversation._id) {
        conversation.unreadCount++;
      }

      // Sort conversations by last message time
      this.conversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      this.filterConversations();
    }
  }

  handleEnterKey(event: Event | KeyboardEvent): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      this.sendMessage();
      event.preventDefault();
    }
  }
} 