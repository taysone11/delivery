import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Divider, Flex, List, Space, Typography } from 'antd';

import { useAuthStore } from '../../features/auth/authStore';
import type { CartStoreItem } from '../../features/cart/cartStore';
import { useCartStore } from '../../features/cart/cartStore';

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(price)} ₽`;
}

export function CartPage() {
  const navigate = useNavigate();

  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);

  const items = useCartStore((state) => state.items);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const fetchCart = useCartStore((state) => state.fetch);
  const inc = useCartStore((state) => state.inc);
  const dec = useCartStore((state) => state.dec);
  const remove = useCartStore((state) => state.remove);
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return;
    }

    void fetchCart();
  }, [accessToken, fetchCart, isHydrated]);

  return (
    <Flex vertical gap={16} style={{ padding: '8px 0' }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        Корзина
      </Typography.Title>

      {!accessToken ? (
        <Alert
          type="info"
          showIcon
          message="Войдите в аккаунт, чтобы использовать серверную корзину."
        />
      ) : null}

      {error ? <Alert type="error" showIcon message={error} /> : null}

      <Flex gap={16} wrap="wrap" align="flex-start">
        <Card style={{ flex: '1 1 600px' }} loading={isLoading && items.length === 0}>
          {items.length === 0 ? (
            <Typography.Text type="secondary">Корзина пуста.</Typography.Text>
          ) : (
            <List<CartStoreItem>
              split
              dataSource={items}
              renderItem={(item) => (
                <List.Item>
                  <Flex justify="space-between" align="center" style={{ width: '100%', gap: 12 }}>
                    <div>
                      <Typography.Text strong>{item.product.name}</Typography.Text>
                      <br />
                      <Typography.Text type="secondary">
                        {formatPrice(item.product.price)} за шт.
                      </Typography.Text>
                      <br />
                      <Typography.Text>
                        Стоимость: {formatPrice(item.product.price * item.quantity)}
                      </Typography.Text>
                    </div>

                    <Space>
                      <Button
                        onClick={() => {
                          if (item.quantity === 1) {
                            remove(item.product.id);
                          } else {
                            dec(item.product.id);
                          }
                        }}
                        disabled={isLoading}
                      >
                        -
                      </Button>
                      <Typography.Text>{item.quantity}</Typography.Text>
                      <Button
                        onClick={() => {
                          void inc(item.product.id);
                        }}
                        disabled={isLoading}
                      >
                        +
                      </Button>
                      <Button
                        danger
                        onClick={() => {
                          void remove(item.product.id);
                        }}
                        disabled={isLoading}
                      >
                        Удалить
                      </Button>
                    </Space>
                  </Flex>
                </List.Item>
              )}
            />
          )}
        </Card>

        <Card style={{ width: 320, maxWidth: '100%' }}>
          <Flex vertical gap={12}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Итого
            </Typography.Title>
            <Typography.Text type="secondary">Позиций: {totalItems}</Typography.Text>
            <Divider style={{ margin: '8px 0' }} />
            <Typography.Title level={3} style={{ margin: 0 }}>
              {formatPrice(totalPrice)}
            </Typography.Title>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/checkout')}
              disabled={items.length === 0}
            >
              Перейти к оформлению
            </Button>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}
