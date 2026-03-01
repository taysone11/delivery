import { create } from 'zustand';

import { cartApi } from '../../shared/api/endpoints/cart/cart.endpoints';
import type { CartView } from '../../shared/api/endpoints/cart/cart.types';
import { productsApi } from '../../shared/api/endpoints/products/products.endpoints';
import type { Product } from '../../shared/api/endpoints/products/products.types';
import { normalizeApiError } from '../../shared/api/errors';
import { showAuthRequiredToast, showErrorToast, showSuccessToast } from '../../shared/ui/toast';
import { useAuthStore } from '../auth/authStore';

export interface CartStoreItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartStoreItem[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (product: Product) => Promise<void>;
  inc: (productId: number | string) => Promise<void>;
  dec: (productId: number | string) => Promise<void>;
  remove: (productId: number | string) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

function toProductId(productId: number | string): number | null {
  const value = typeof productId === 'string' ? Number(productId) : productId;
  return Number.isInteger(value) && value > 0 ? value : null;
}

function createUnknownProduct(productId: number, price: number): Product {
  const now = new Date().toISOString();

  return {
    id: productId,
    categoryId: null,
    name: `Товар #${productId}`,
    description: null,
    price,
    weightGrams: null,
    imageUrl: null,
    createdAt: now,
    updatedAt: now
  };
}

function ensureAuthorized(): boolean {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    return true;
  }

  showAuthRequiredToast();
  return false;
}

export const useCartStore = create<CartState>((set, get) => {
  let productCache: Record<number, Product> = {};

  const applyCart = (cartView: CartView): void => {
    const nextItems: CartStoreItem[] = cartView.items.map((item) => {
      const cached = productCache[item.productId];

      if (cached) {
        const updatedProduct = { ...cached, price: item.price };
        productCache = {
          ...productCache,
          [item.productId]: updatedProduct
        };

        return {
          product: updatedProduct,
          quantity: item.quantity
        };
      }

      return {
        product: createUnknownProduct(item.productId, item.price),
        quantity: item.quantity
      };
    });

    set({ items: nextItems, isLoading: false, error: null });
  };

  const runMutation = async (request: () => Promise<void>, successMessage?: string): Promise<void> => {
    set({ isLoading: true, error: null });

    try {
      await request();
      await get().fetch();

      if (successMessage) {
        showSuccessToast(successMessage);
      }
    } catch (error: unknown) {
      const normalized = normalizeApiError(error);
      set({ isLoading: false, error: normalized.message });
      showErrorToast(normalized.message);
    }
  };

  return {
    items: [],
    isLoading: false,
    error: null,

    fetch: async () => {
      if (!useAuthStore.getState().accessToken) {
        set({ items: [], isLoading: false, error: null });
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const cartView = await cartApi.getMyCart();
        const missingIds = cartView.items
          .map((item) => item.productId)
          .filter((productId) => !productCache[productId]);

        if (missingIds.length > 0) {
          const missingProducts = await Promise.allSettled(
            missingIds.map((productId) => productsApi.getProductById({ productId }))
          );

          for (const result of missingProducts) {
            if (result.status === 'fulfilled') {
              const product = result.value;
              productCache = {
                ...productCache,
                [product.id]: product
              };
            }
          }
        }

        applyCart(cartView);
      } catch (error: unknown) {
        const normalized = normalizeApiError(error);
        set({ isLoading: false, error: normalized.message });
        showErrorToast(normalized.message);
      }
    },

    add: async (product: Product) => {
      if (!ensureAuthorized()) {
        return;
      }

      productCache = {
        ...productCache,
        [product.id]: product
      };

      await runMutation(async () => {
        await cartApi.addToCart({ productId: product.id, quantity: 1 });
      }, 'Товар добавлен в корзину');
    },

    inc: async (productId: number | string) => {
      if (!ensureAuthorized()) {
        return;
      }

      const parsedId = toProductId(productId);
      if (!parsedId) {
        return;
      }

      await runMutation(async () => {
        await cartApi.addToCart({ productId: parsedId, quantity: 1 });
      });
    },

    dec: async (productId: number | string) => {
      if (!ensureAuthorized()) {
        return;
      }

      const parsedId = toProductId(productId);
      if (!parsedId) {
        return;
      }

      await runMutation(async () => {
        const item = get().items.find((cartItem) => cartItem.product.id === parsedId);

        if (item && item.quantity <= 1) {
          await cartApi.removeCartItem({ productId: parsedId });
          return;
        }

        await cartApi.decrementCartItem({ productId: parsedId }, { quantity: 1 });
      });
    },

    remove: async (productId: number | string) => {
      if (!ensureAuthorized()) {
        return;
      }

      const parsedId = toProductId(productId);
      if (!parsedId) {
        return;
      }

      await runMutation(async () => {
        await cartApi.removeCartItem({ productId: parsedId });
      });
    },

    clear: async () => {
      if (!ensureAuthorized()) {
        return;
      }

      await runMutation(async () => {
        const items = get().items;

        await Promise.all(items.map((item) => cartApi.removeCartItem({ productId: item.product.id })));
      });
    },

    reset: () => {
      productCache = {};
      set({ items: [], isLoading: false, error: null });
    },

    totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  };
});
