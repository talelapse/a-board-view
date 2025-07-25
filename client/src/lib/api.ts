// API client for backend integration
export interface BackendUser {
  id: string;
  name: string;
  email: string;
  gender: string;
  birthYear: number;
  verified: boolean;
  role: string;
  profileImageUrls: string[];
  location?: string;
  preferredLanguage?: string;
  aboutMe?: string;
  isBot: boolean;
  createdAt: string;
  lastLoginAt?: string;
  suspendedUntil?: string;
}

export interface BackendPost {
  id: string;
  text: string;
  attachments: Array<{
    id: string;
    url: string;
    type: string;
    name: string;
  }>;
  gender?: string;
  anonymousId: string;
  createdAt: string;
  deleted: boolean;
  reportCount: number;
  viewCount: number;
  canDelete: boolean;
  comments: BackendComment[];
  likes: BackendLike[];
}

export interface BackendComment {
  id: string;
  text: string;
  attachments?: Array<{
    id: string;
    url: string;
    type: string;
    name: string;
  }>;
  anonymousId?: string;
  parentCommentId?: string;
  createdAt: string;
  deleted: boolean;
  canDelete: boolean;
  replies?: BackendComment[];
}

export interface BackendLike {
  id: string;
  userId: string;
}

export interface LoginResponse {
  token: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  gender: string;
  birthYear: number;
  profileImageUrls?: string[];
  location?: string;
  preferredLanguage?: string;
  aboutMe?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePostRequest {
  text: string;
  attachments?: Array<{
    id: string;
    url: string;
    type: string;
    name: string;
  }>;
  gender?: string;
}

export interface CreateCommentRequest {
  text: string;
  attachments?: Array<{
    id: string;
    url: string;
    type: string;
    name: string;
  }>;
  parentCommentId?: string;
}

class BackendAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Check if we should use direct backend connection or proxy
    const useDirectBackend = import.meta.env.VITE_USE_DIRECT_BACKEND === 'true';
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
    
    if (useDirectBackend) {
      this.baseURL = backendUrl; // Direct connection to backend
    } else {
      this.baseURL = '/api/backend'; // Use Express proxy
    }
    
    console.log(`Backend API URL: ${this.baseURL}`);
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async signup(data: SignupRequest): Promise<BackendUser> {
    return this.request<BackendUser>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    await this.request<void>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resendVerification(email: string): Promise<void> {
    await this.request<void>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/token', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    // Clear token after successful logout from backend
    this.clearToken();
  }

  // Posts endpoints
  async getPosts(offset = 0, limit?: number): Promise<BackendPost[]> {
    const params = new URLSearchParams({ offset: offset.toString() });
    if (limit) {
      params.set('limit', limit.toString());
    }
    
    const response = await this.request<any>(`/posts?${params}`);
    console.log('getPosts response:', response);
    
    // Handle different response formats from backend
    if (Array.isArray(response)) {
      return response;
    } else if (response && Array.isArray(response.flow)) {
      return response.flow;
    } else if (response && Array.isArray(response.content)) {
      return response.content;
    } else if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  }

  async createPost(data: CreatePostRequest): Promise<BackendPost> {
    return this.request<BackendPost>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPost(id: string): Promise<BackendPost> {
    const response = await this.request<any>(`/posts/${id}`);
    console.log('getPost response:', response);
    console.log('getPost response keys:', Object.keys(response || {}));
    console.log('getPost response comments:', response?.comments);
    
    // Handle different response formats from backend
    if (response && typeof response === 'object') {
      // If it's wrapped in another object, extract the post data
      if (response.data) {
        return response.data;
      } else if (response.post) {
        return response.post;
      } else {
        // Assume the response itself is the post
        return response;
      }
    }
    
    throw new Error('Invalid post data received from backend');
  }

  async addComment(postId: string, data: CreateCommentRequest): Promise<BackendComment> {
    return this.request<BackendComment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleLike(postId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async getLikes(postId: string): Promise<{ likes: BackendLike[] }> {
    return this.request<{ likes: BackendLike[] }>(`/posts/${postId}/likes`);
  }

  // Users endpoints
  async getCurrentUser(): Promise<BackendUser> {
    return this.request<BackendUser>('/users/me');
  }

  async getUsers(): Promise<BackendUser[]> {
    const response = await this.request<{ flow?: BackendUser[] }>('/users');
    return Array.isArray(response) ? response : [];
  }

  async getUser(id: string): Promise<BackendUser> {
    return this.request<BackendUser>(`/users/${id}`);
  }

  // File upload
  async getPresignedUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
    return this.request<{ uploadUrl: string; fileUrl: string }>('/api/files/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ fileName, contentType }),
    });
  }
}

export const backendAPI = new BackendAPI();