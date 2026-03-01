import { useEffect, useMemo, useState } from 'react';
import { Alert, Col, Flex, Row, Spin, Typography } from 'antd';

import { CategoryTabs } from '../../features/catalog/ui/CategoryTabs';
import { ProductCard } from '../../features/catalog/ui/ProductCard';
import { useCartStore } from '../../features/cart/cartStore';
import { categoriesApi } from '../../shared/api/endpoints/categories/categories.endpoints';
import type { Category } from '../../shared/api/endpoints/categories/categories.types';
import { productsApi } from '../../shared/api/endpoints/products/products.endpoints';
import type { Product } from '../../shared/api/endpoints/products/products.types';
import { getApiErrorMessage } from '../../shared/lib/apiError';

export function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartAdd = useCartStore((state) => state.add);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

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

  const handleAddToCart = async (product: Product): Promise<void> => {
    try {
      setAddingProductId(product.id);
      await cartAdd(product);
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <Flex vertical gap={16} style={{ padding: '8px 0' }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        Каталог
      </Typography.Title>

      {error ? <Alert type="error" message={error} showIcon /> : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={7} lg={6}>
          <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
            <CategoryTabs
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onChange={setSelectedCategoryId}
              loading={loadingCategories}
            />
          </div>
        </Col>

        <Col xs={24} md={17} lg={18}>
          <Flex vertical gap={16}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {selectedCategoryName ?? 'Товары'}
            </Typography.Title>

            {loadingProducts ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <Spin size="large" />
              </div>
            ) : products.length === 0 ? (
              <Typography.Text type="secondary">В выбранной категории пока нет товаров.</Typography.Text>
            ) : (
              <Row gutter={[16, 16]}>
                {products.map((product) => (
                  <Col key={product.id} xs={24} sm={12} xl={8}>
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      isAdding={addingProductId === product.id}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Flex>
        </Col>
      </Row>
    </Flex>
  );
}
