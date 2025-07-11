import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  Conversation, 
  Message, 
  CreateConversationRequest, 
  SendMessageRequest, 
  ConversationFilters, 
  MessageFilters,
  ConversationStats,
  TypingIndicator,
  MessageStatus,
  MessageStatusUpdate,
  ConversationPreview,
  PaginatedResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  // Cache management
  private conversationCache = new Map<string, BehaviorSubject<Conversation>>();
  private messageCache = new Map<string, BehaviorSubject<Message[]>>();
  private conversationListCache = new BehaviorSubject<ConversationPreview[]>([]);
  
  // Real-time events
  private newMessageSubject = new Subject<Message>();
  private messageStatusSubject = new Subject<MessageStatusUpdate>();
  private typingSubject = new Subject<TypingIndicator>();
  private conversationUpdatedSubject = new Subject<Conversation>();
  
  // Observables for real-time updates
  public newMessage$ = this.newMessageSubject.asObservable();
  public messageStatus$ = this.messageStatusSubject.asObservable();
  public typing$ = this.typingSubject.asObservable();
  public conversationUpdated$ = this.conversationUpdatedSubject.asObservable();
  public conversationList$ = this.conversationListCache.asObservable();
  
  // Current conversation tracking
  private currentConversationId = new BehaviorSubject<string | null>(null);
  public currentConversationId$ = this.currentConversationId.asObservable();
  
  // Unread count tracking
  private unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCount.asObservable();

  constructor(private apiService: ApiService) {
    this.initializeRealTimeUpdates();
  }

  /**
   * Initialize real-time updates (WebSocket or similar)
   */
  private initializeRealTimeUpdates(): void {
    // This would typically initialize WebSocket connections
    // For now, we'll use polling as a fallback
    // In a real implementation, you'd use Socket.IO or similar
    this.startPeriodicUpdates();
  }

  /**
   * Start periodic updates for real-time-like behavior
   */
  private startPeriodicUpdates(): void {
    // Poll for new messages every 30 seconds
    setInterval(() => {
      this.refreshConversationList();
    }, 30000);
  }

  /**
   * Get all conversations
   */
  getConversations(filters?: ConversationFilters): Observable<PaginatedResponse<ConversationPreview>> {
    return this.apiService.getPaginated<ConversationPreview>('/messages/conversations', filters)
      .pipe(
        tap(response => {
          this.conversationListCache.next(response.data);
          this.updateUnreadCount(response.data);
        }),
        shareReplay(1)
      );
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): Observable<Conversation> {
    const cacheKey = `conversation_${conversationId}`;
    
    if (this.conversationCache.has(cacheKey)) {
      const cachedConversation = this.conversationCache.get(cacheKey);
      if (cachedConversation) {
        return cachedConversation.asObservable();
      }
    }

    return this.apiService.get<Conversation>(`/messages/conversations/${conversationId}`)
      .pipe(
        tap(conversation => {
          this.updateConversationCache(cacheKey, conversation);
        }),
        shareReplay(1)
      );
  }

  /**
   * Create new conversation
   */
  createConversation(conversationData: CreateConversationRequest): Observable<Conversation> {
    const formData = new FormData();
    
    formData.append('type', conversationData.type);
    formData.append('participants', JSON.stringify(conversationData.participants));
    
    if (conversationData.name) {
      formData.append('name', conversationData.name);
    }
    
    if (conversationData.description) {
      formData.append('description', conversationData.description);
    }
    
    if (conversationData.avatar) {
      formData.append('avatar', conversationData.avatar);
    }
    
    if (conversationData.settings) {
      formData.append('settings', JSON.stringify(conversationData.settings));
    }

    return this.apiService.post<Conversation>('/messages/conversations', formData)
      .pipe(
        tap(conversation => {
          this.updateConversationCache(`conversation_${conversation._id}`, conversation);
          this.refreshConversationList();
        })
      );
  }

  /**
   * Update conversation
   */
  updateConversation(conversationId: string, updates: any): Observable<Conversation> {
    return this.apiService.patch<Conversation>(`/messages/conversations/${conversationId}`, updates)
      .pipe(
        tap(conversation => {
          this.updateConversationCache(`conversation_${conversationId}`, conversation);
          this.conversationUpdatedSubject.next(conversation);
        })
      );
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId: string): Observable<any> {
    return this.apiService.delete(`/messages/conversations/${conversationId}`)
      .pipe(
        tap(() => {
          this.conversationCache.delete(`conversation_${conversationId}`);
          this.messageCache.delete(`messages_${conversationId}`);
          this.refreshConversationList();
        })
      );
  }

  /**
   * Get messages for a conversation
   */
  getMessages(conversationId: string, filters?: MessageFilters): Observable<PaginatedResponse<Message>> {
    const params = { conversationId, ...filters };
    
    return this.apiService.getPaginated<Message>('/messages', params)
      .pipe(
        tap(response => {
          this.updateMessageCache(`messages_${conversationId}`, response.data);
        }),
        shareReplay(1)
      );
  }

  /**
   * Send message
   */
  sendMessage(messageData: SendMessageRequest): Observable<Message> {
    const formData = new FormData();
    
    formData.append('conversationId', messageData.conversationId);
    formData.append('type', messageData.type);
    formData.append('content', messageData.content);
    
    if (messageData.replyTo) {
      formData.append('replyTo', messageData.replyTo);
    }
    
    if (messageData.metadata) {
      formData.append('metadata', JSON.stringify(messageData.metadata));
    }
    
    if (messageData.media && messageData.media.length > 0) {
      messageData.media.forEach(file => {
        formData.append('media', file);
      });
    }

    return this.apiService.post<Message>('/messages', formData)
      .pipe(
        tap(message => {
          this.newMessageSubject.next(message);
          this.updateMessageCacheWithNewMessage(message);
        })
      );
  }

  /**
   * Edit message
   */
  editMessage(messageId: string, content: string): Observable<Message> {
    return this.apiService.patch<Message>(`/messages/${messageId}`, { content })
      .pipe(
        tap(message => {
          this.updateMessageInCache(message);
        })
      );
  }

  /**
   * Delete message
   */
  deleteMessage(messageId: string, deleteForEveryone = false): Observable<any> {
    const params = { deleteForEveryone };
    
    return this.apiService.delete(`/messages/${messageId}`, { params })
      .pipe(
        tap(() => {
          this.removeMessageFromCache(messageId);
        })
      );
  }

  /**
   * React to message
   */
  reactToMessage(messageId: string, emoji: string): Observable<any> {
    return this.apiService.post(`/messages/${messageId}/react`, { emoji })
      .pipe(
        tap(() => {
          this.refreshMessageInCache(messageId);
        })
      );
  }

  /**
   * Remove reaction from message
   */
  removeReaction(messageId: string, emoji: string): Observable<any> {
    return this.apiService.delete(`/messages/${messageId}/react`, { params: { emoji } })
      .pipe(
        tap(() => {
          this.refreshMessageInCache(messageId);
        })
      );
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId: string): Observable<any> {
    return this.apiService.post(`/messages/${messageId}/read`, {})
      .pipe(
        tap(() => {
          this.messageStatusSubject.next({
            messageId,
            status: 'read',
            timestamp: new Date().toISOString()
          });
        })
      );
  }

  /**
   * Mark conversation as read
   */
  markConversationAsRead(conversationId: string): Observable<any> {
    return this.apiService.post(`/messages/conversations/${conversationId}/read`, {})
      .pipe(
        tap(() => {
          this.refreshConversationList();
        })
      );
  }

  /**
   * Search messages
   */
  searchMessages(conversationId: string, query: string, filters?: MessageFilters): Observable<PaginatedResponse<Message>> {
    const params = { conversationId, search: query, ...filters };
    
    return this.apiService.getPaginated<Message>('/messages/search', params)
      .pipe(shareReplay(1));
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(conversationId: string): Observable<ConversationStats> {
    return this.apiService.get<ConversationStats>(`/messages/conversations/${conversationId}/stats`)
      .pipe(shareReplay(1));
  }

  /**
   * Add participants to conversation
   */
  addParticipants(conversationId: string, userIds: string[]): Observable<any> {
    return this.apiService.post(`/messages/conversations/${conversationId}/participants`, { userIds })
      .pipe(
        tap(() => {
          this.refreshConversation(conversationId);
        })
      );
  }

  /**
   * Remove participant from conversation
   */
  removeParticipant(conversationId: string, userId: string): Observable<any> {
    return this.apiService.delete(`/messages/conversations/${conversationId}/participants/${userId}`)
      .pipe(
        tap(() => {
          this.refreshConversation(conversationId);
        })
      );
  }

  /**
   * Leave conversation
   */
  leaveConversation(conversationId: string): Observable<any> {
    return this.apiService.post(`/messages/conversations/${conversationId}/leave`, {})
      .pipe(
        tap(() => {
          this.conversationCache.delete(`conversation_${conversationId}`);
          this.messageCache.delete(`messages_${conversationId}`);
          this.refreshConversationList();
        })
      );
  }

  /**
   * Archive conversation
   */
  archiveConversation(conversationId: string): Observable<any> {
    return this.apiService.post(`/messages/conversations/${conversationId}/archive`, {})
      .pipe(
        tap(() => {
          this.refreshConversation(conversationId);
        })
      );
  }

  /**
   * Unarchive conversation
   */
  unarchiveConversation(conversationId: string): Observable<any> {
    return this.apiService.post(`/messages/conversations/${conversationId}/unarchive`, {})
      .pipe(
        tap(() => {
          this.refreshConversation(conversationId);
        })
      );
  }

  /**
   * Mute conversation
   */
  muteConversation(conversationId: string): Observable<any> {
    return this.apiService.post(`/messages/conversations/${conversationId}/mute`, {})
      .pipe(
        tap(() => {
          this.refreshConversation(conversationId);
        })
      );
  }

  /**
   * Unmute conversation
   */
  unmuteConversation(conversationId: string): Observable<any> {
    return this.apiService.post(`/messages/conversations/${conversationId}/unmute`, {})
      .pipe(
        tap(() => {
          this.refreshConversation(conversationId);
        })
      );
  }

  /**
   * Pin conversation
   */
  pinConversation(conversationId: string): Observable<any> {
    return this.apiService.post(`/messages/conversations/${conversationId}/pin`, {})
      .pipe(
        tap(() => {
          this.refreshConversationList();
        })
      );
  }

  /**
   * Unpin conversation
   */
  unpinConversation(conversationId: string): Observable<any> {
    return this.apiService.post(`/messages/conversations/${conversationId}/unpin`, {})
      .pipe(
        tap(() => {
          this.refreshConversationList();
        })
      );
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    // In a real implementation, this would send via WebSocket
    this.typingSubject.next({
      conversationId,
      userId: 'current-user-id', // This would come from auth service
      userName: 'Current User',
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Set current conversation
   */
  setCurrentConversation(conversationId: string | null): void {
    this.currentConversationId.next(conversationId);
  }

  /**
   * Get current conversation
   */
  getCurrentConversation(): string | null {
    return this.currentConversationId.value;
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCount.value;
  }

  /**
   * Upload media for message
   */
  uploadMedia(files: File[]): Observable<any> {
    return this.apiService.uploadFiles('/messages/upload', files);
  }

  /**
   * Cache management methods
   */
  private updateConversationCache(cacheKey: string, conversation: Conversation): void {
    if (!this.conversationCache.has(cacheKey)) {
      this.conversationCache.set(cacheKey, new BehaviorSubject<Conversation>(conversation));
    } else {
      this.conversationCache.get(cacheKey)?.next(conversation);
    }
  }

  private updateMessageCache(cacheKey: string, messages: Message[]): void {
    if (!this.messageCache.has(cacheKey)) {
      this.messageCache.set(cacheKey, new BehaviorSubject<Message[]>(messages));
    } else {
      this.messageCache.get(cacheKey)?.next(messages);
    }
  }

  private updateMessageCacheWithNewMessage(message: Message): void {
    const cacheKey = `messages_${message.conversation}`;
    const cached = this.messageCache.get(cacheKey);
    
    if (cached) {
      const currentMessages = cached.value;
      const updatedMessages = [...currentMessages, message];
      cached.next(updatedMessages);
    }
  }

  private updateMessageInCache(message: Message): void {
    const cacheKey = `messages_${message.conversation}`;
    const cached = this.messageCache.get(cacheKey);
    
    if (cached) {
      const currentMessages = cached.value;
      const updatedMessages = currentMessages.map(m => 
        m._id === message._id ? message : m
      );
      cached.next(updatedMessages);
    }
  }

  private removeMessageFromCache(messageId: string): void {
    this.messageCache.forEach((cached, key) => {
      const currentMessages = cached.value;
      const updatedMessages = currentMessages.filter(m => m._id !== messageId);
      cached.next(updatedMessages);
    });
  }

  private refreshConversation(conversationId: string): void {
    this.getConversation(conversationId).subscribe();
  }

  private refreshMessageInCache(messageId: string): void {
    // In a real implementation, you'd fetch the updated message
    // For now, we'll just refresh the entire conversation
    this.refreshConversationList();
  }

  private refreshConversationList(): void {
    this.getConversations().subscribe();
  }

  private updateUnreadCount(conversations: ConversationPreview[]): void {
    const totalUnread = conversations.reduce((count, conv) => count + conv.unreadCount, 0);
    this.unreadCount.next(totalUnread);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.conversationCache.clear();
    this.messageCache.clear();
    this.conversationListCache.next([]);
    this.unreadCount.next(0);
  }

  /**
   * Disconnect real-time updates
   */
  disconnect(): void {
    // This would close WebSocket connections
    this.clearCache();
  }
} 