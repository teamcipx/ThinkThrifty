
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
  createdAt: number;
}

export type View = 'home' | 'detail' | 'admin';

export interface AppState {
  currentView: View;
  selectedImageId: string | null;
  searchQuery: string;
  isAdminAuthenticated: boolean;
}
