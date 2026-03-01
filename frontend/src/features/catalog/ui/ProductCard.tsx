import { Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material';

import type { Product } from '../../../shared/api/endpoints/products/products.types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => Promise<void>;
  isAdding: boolean;
}

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(price)} ₽`;
}

export function ProductCard({ product, onAddToCart, isAdding }: ProductCardProps) {
  const weight = product.weightGrams ? `${product.weightGrams} г` : null;

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1}>
          <Typography variant="h6" component="h3">
            {product.name}
          </Typography>
          {product.description ? (
            <Typography variant="body2" color="text.secondary">
              {product.description}
            </Typography>
          ) : null}
          <Typography variant="subtitle1" fontWeight={700}>
            {formatPrice(product.price)}
          </Typography>
          {weight ? (
            <Typography variant="caption" color="text.secondary">
              {weight}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>

      <CardActions>
        <Button
          variant="contained"
          fullWidth
          disabled={isAdding}
          onClick={() => {
            void onAddToCart(product.id);
          }}
        >
          {isAdding ? 'Добавляем...' : 'В корзину'}
        </Button>
      </CardActions>
    </Card>
  );
}
