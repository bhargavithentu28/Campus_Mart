import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface ProductFilters {
  search?: string;
  category?: string;
  condition?: string;
  transactionType?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

// 1. Fetch Paginated Marketplace Products
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: filters });
      return data;
    }
  });
}

// 2. Fetch Single Product Details
export function useProductDetails(productId: string | null) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data } = await api.get(`/products/${productId}`);
      return data.product;
    },
    enabled: !!productId
  });
}

// 3. Fetch Categories Taxonomy
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.categories || [];
    }
  });
}

// 4. Fetch User Wishlist
export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/wishlist');
      return data.products || [];
    }
  });
}

// 5. Toggle Wishlist Item Mutation
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.post(`/wishlist/${productId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}

// 6. Report Listing Mutation
export function useReportListing() {
  return useMutation({
    mutationFn: async ({ productId, reason }: { productId: string; reason: string }) => {
      const { data } = await api.post('/reports', { productId, reason });
      return data;
    }
  });
}
