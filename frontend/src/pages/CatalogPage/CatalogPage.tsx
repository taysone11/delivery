import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { CategoryTabs } from '../../features/catalog/ui/CategoryTabs';
import { ProductCard } from '../../features/catalog/ui/ProductCard';
import { cartApi } from '../../shared/api/endpoints/cart/cart.endpoints';
import { categoriesApi } from '../../shared/api/endpoints/categories/categories.endpoints';
import type { Category } from '../../shared/api/endpoints/categories/categories.types';
import { productsApi } from '../../shared/api/endpoints/products/products.endpoints';
import type { Product } from '../../shared/api/endpoints/products/products.types';
import { getApiErrorMessage } from '../../shared/lib/apiError';

export function CatalogPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setError(null);

        const data = await categoriesApi.listCategories();
        if (cancelled) {
          return;
        }

        setCategories(data);
        setSelectedCategoryId((prev) => prev ?? data[0]?.id ?? null);
      } catch (requestError: unknown) {
        if (!cancelled) {
          setError(getApiErrorMessage(requestError, 'Не удалось загрузить категории'));
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setError(null);

        const data = await productsApi.listProducts({ categoryId: selectedCategoryId });
        if (!cancelled) {
          setProducts(data);
        }
      } catch (requestError: unknown) {
        if (!cancelled) {
          setError(getApiErrorMessage(requestError, 'Не удалось загрузить товары'));
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) {
      return null;
    }

    const category = categories.find((item) => item.id === selectedCategoryId);
    return category?.name ?? null;
  }, [categories, selectedCategoryId]);

  const handleAddToCart = async (productId: number): Promise<void> => {
    try {
      setAddingProductId(productId);
      await cartApi.addToCart({ productId, quantity: 1 });
      setCartMessage('Товар добавлен в корзину');
    } catch (requestError: unknown) {
      setCartMessage(getApiErrorMessage(requestError, 'Не удалось добавить товар в корзину'));
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <Stack spacing={2} sx={{ py: 2 }}>
      <Typography variant="h4" component="h1">
        Каталог
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '260px 1fr' }
        }}
      >
        <Box>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <CategoryTabs
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onChange={setSelectedCategoryId}
              loading={loadingCategories}
            />
          </Box>
        </Box>

        <Box>
          <Stack spacing={2}>
            <Typography variant="h6" component="h2">
              {selectedCategoryName ?? 'Товары'}
            </Typography>

            {loadingProducts ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} />
              </Box>
            ) : products.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  В выбранной категории пока нет товаров.
                </Typography>
              ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))'
                  }
                }}
              >
                {products.map((product) => (
                  <Box key={product.id}>
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      isAdding={addingProductId === product.id}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Stack>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(cartMessage)}
        autoHideDuration={3000}
        onClose={() => setCartMessage(null)}
        message={cartMessage ?? ''}
      />
    </Stack>
  );
}
