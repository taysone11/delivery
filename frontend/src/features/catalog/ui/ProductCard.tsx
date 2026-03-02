import { useState } from 'react';
import { Button, Card, Flex, Image, Typography } from 'antd';

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
  const [isImageError, setIsImageError] = useState(false);
  const hasImage = Boolean(product.imageUrl) && !isImageError;

  return (
    <Card
      size="small"
      style={{ width: '100%', height: '100%' }}
      styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12, height: '100%' } }}
    >
      {hasImage ? (
        <Image
          src={product.imageUrl ?? undefined}
          alt={product.name}
          preview={false}
          height={180}
          style={{ width: '100%', objectFit: 'cover', borderRadius: 8 }}
          onError={() => {
            setIsImageError(true);
          }}
        />
      ) : (
        <div
          style={{
            height: 180,
            borderRadius: 8,
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            textAlign: 'center'
          }}
        >
          <Typography.Text type="secondary">Изображение недоступно</Typography.Text>
        </div>
      )}

      <Flex vertical gap={8} style={{ flex: 1 }}>
        <Typography.Title
          level={5}
          style={{
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.name}
        </Typography.Title>
        {product.description ? (
          <Typography.Text
            type="secondary"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.description}
          </Typography.Text>
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
