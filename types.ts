export interface ImageMetadata {
  id: string;
  url: string;
  deleteUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  slug: string;
  author: string;
  createdAt: number;
  downloadCount: number;
}

export type View = 'home' | 'detail' | 'admin' | 'privacy' | 'about';

export interface AppState {
  currentView: View;
  selectedImageId: string | null;
  searchQuery: string;
  isAdminAuthenticated: boolean;
}