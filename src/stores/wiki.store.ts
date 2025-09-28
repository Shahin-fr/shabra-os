'use client';

import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

export interface WikiItem {
  id: string;
  title: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId: string | null;
  content?: string | null;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  children?: WikiItem[];
  // File upload fields
  fileUrl?: string;
  filePublicId?: string;
  fileType?: string;
  originalName?: string;
  fileSize?: number;
  // Markdown document fields
  slug?: string;
  originalSlug?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

interface WikiStore {
  selectedDocument: string | null;
  setSelectedDocument: (id: string | null) => void;
}

export const useWikiStore = create<WikiStore>((set) => ({
  selectedDocument: null,
  setSelectedDocument: (id) => set({ selectedDocument: id }),
}));

// API functions
const fetchWikiItems = async (): Promise<WikiItem[]> => {
  try {
    console.log('[WIKI STORE] Fetching wiki items from /api/wiki...');
    const response = await fetch('/api/wiki');
    
    console.log('[WIKI STORE] API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('[WIKI STORE] API Error Response:', error);
      throw new Error(error.error?.message || `Failed to fetch wiki items (${response.status})`);
    }
    const result = await response.json();
    
    console.log('[WIKI STORE] API Success Response:', {
      success: result.success,
      dataType: Array.isArray(result.data) ? 'array' : typeof result.data,
      dataLength: Array.isArray(result.data) ? result.data.length : 'N/A',
    });
    
    // Validate response structure
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Invalid response format from server');
    }
    
    return result.data;
  } catch (error) {
    console.error('[WIKI STORE] Error fetching wiki items:', error);
    throw error;
  }
};

const fetchWikiItem = async (id: string): Promise<WikiItem> => {
  try {
    const response = await fetch(`/api/wiki/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to fetch wiki item (${response.status})`);
    }
    const result = await response.json();
    
    // Validate response structure
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from server');
    }
    
    return result.data;
  } catch (error) {
    console.error('[WIKI STORE] Error fetching wiki item:', error);
    throw error;
  }
};

const createWikiItem = async (data: {
  title: string;
  content?: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId?: string | null;
}): Promise<WikiItem> => {
  try {
    const response = await fetch('/api/wiki', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to create wiki item (${response.status})`);
    }
    const result = await response.json();
    
    // Validate response structure
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from server');
    }
    
    return result.data;
  } catch (error) {
    console.error('[WIKI STORE] Error creating wiki item:', error);
    throw error;
  }
};

const updateWikiItem = async (id: string, data: {
  title: string;
  content?: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId?: string | null;
}): Promise<WikiItem> => {
  try {
    const response = await fetch(`/api/wiki/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to update wiki item (${response.status})`);
    }
    const result = await response.json();
    
    // Validate response structure
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from server');
    }
    
    return result.data;
  } catch (error) {
    console.error('[WIKI STORE] Error updating wiki item:', error);
    throw error;
  }
};

const deleteWikiItem = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/wiki/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to delete wiki item (${response.status})`);
    }
  } catch (error) {
    console.error('[WIKI STORE] Error deleting wiki item:', error);
    throw error;
  }
};

const uploadWikiFile = async (formData: FormData): Promise<WikiItem> => {
  try {
    const response = await fetch('/api/wiki/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to upload file (${response.status})`);
    }
    const result = await response.json();
    
    // Validate response structure
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from server');
    }
    
    return result.data;
  } catch (error) {
    console.error('[WIKI STORE] Error uploading wiki file:', error);
    throw error;
  }
};

const reorderWikiItems = async (items: { id: string; order: number }[]): Promise<void> => {
  try {
    const response = await fetch('/api/wiki/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to reorder items (${response.status})`);
    }
  } catch (error) {
    console.error('[WIKI STORE] Error reordering wiki items:', error);
    throw error;
  }
};

// React Query hooks
export const useWikiItems = () => {
  return useQuery({
    queryKey: ['wiki-items'],
    queryFn: async () => {
      console.log('[WIKI STORE] Fetching wiki items...');
      const data = await fetchWikiItems();
      console.log('[WIKI STORE] Fetched wiki items:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWikiItem = (id: string | null) => {
  return useQuery({
    queryKey: ['wiki-item', id],
    queryFn: () => fetchWikiItem(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateWikiItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWikiItem,
    onSuccess: (data) => {
      console.log('[WIKI STORE] Create success, invalidating queries:', data);
      // Invalidate and refetch to ensure immediate update
      queryClient.invalidateQueries({ queryKey: ['wiki-items'] });
      queryClient.refetchQueries({ queryKey: ['wiki-items'] });
    },
    onError: (error) => {
      console.error('[WIKI STORE] Create error:', error);
      logger.error('Failed to create wiki item:', error);
    },
  });
};

export const useUpdateWikiItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateWikiItem(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch to ensure immediate update
      queryClient.invalidateQueries({ queryKey: ['wiki-items'] });
      queryClient.invalidateQueries({ queryKey: ['wiki-item', id] });
      queryClient.refetchQueries({ queryKey: ['wiki-items'] });
    },
    onError: (error) => {
      console.error('[WIKI STORE] Update error:', error);
      logger.error('Failed to update wiki item:', error);
    },
  });
};

export const useDeleteWikiItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteWikiItem,
    onSuccess: () => {
      // Invalidate and refetch to ensure immediate update
      queryClient.invalidateQueries({ queryKey: ['wiki-items'] });
      queryClient.refetchQueries({ queryKey: ['wiki-items'] });
    },
    onError: (error) => {
      console.error('[WIKI STORE] Delete error:', error);
      logger.error('Failed to delete wiki item:', error);
    },
  });
};

export const useUploadWikiFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: uploadWikiFile,
    onSuccess: () => {
      // Invalidate and refetch to ensure immediate update
      queryClient.invalidateQueries({ queryKey: ['wiki-items'] });
      queryClient.refetchQueries({ queryKey: ['wiki-items'] });
    },
    onError: (error) => {
      console.error('[WIKI STORE] Upload error:', error);
      logger.error('Failed to upload wiki file:', error);
    },
  });
};

export const useReorderWikiItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reorderWikiItems,
    onSuccess: () => {
      // Invalidate and refetch to ensure immediate update
      queryClient.invalidateQueries({ queryKey: ['wiki-items'] });
      queryClient.refetchQueries({ queryKey: ['wiki-items'] });
    },
    onError: (error) => {
      console.error('[WIKI STORE] Reorder error:', error);
      logger.error('Failed to reorder wiki items:', error);
    },
  });
};
