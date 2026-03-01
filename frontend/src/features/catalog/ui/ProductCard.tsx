import { Button, Card, Flex, Typography } from 'antd';

import type { Product } from '../../../shared/api/endpoints/products/products.types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => Promise<void>;
  isAdding: boolean;
}

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(price)} ₽`;
}

export function ProductCard({ product, onAddToCart, isAdding }: ProductCardProps) {
  const weight = product.weightGrams ? `${product.weightGrams} г` : null;

  return (
    <Card
      size="small"
      styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12, minHeight: 220 } }}
    >
      <Flex vertical gap={8} style={{ flex: 1 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {product.name}
        </Typography.Title>
        {product.description ? (
          <Typography.Text type="secondary">{product.description}</Typography.Text>
        ) : null}
        <Typography.Text strong>{formatPrice(product.price)}</Typography.Text>
        {weight ? <Typography.Text type="secondary">{weight}</Typography.Text> : null}
      </Flex>

      <Button
        type="primary"
        loading={isAdding}
        onClick={() => {
          void onAddToCart(product);
        }}
      >
        В корзину
      </Button>
    </Card>
  );
}
