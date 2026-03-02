import { useEffect, useState } from 'react';
import { Alert, Button, Card, Flex, Form, Input, Select, Space, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/authStore';
import { useCartStore } from '../../features/cart/cartStore';
import { cartApi } from '../../shared/api/endpoints/cart/cart.endpoints';
import { ordersApi } from '../../shared/api/endpoints/orders/orders.endpoints';
import { getApiErrorMessage } from '../../shared/lib/apiError';
import { showSuccessToast } from '../../shared/ui/toast';

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  comment?: string;
  paymentMethod: 'cash';
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const items = useCartStore((state) => state.items);
  const isCartLoading = useCartStore((state) => state.isLoading);
  const fetchCart = useCartStore((state) => state.fetch);
  const resetCart = useCartStore((state) => state.reset);
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());

  const [form] = Form.useForm<CheckoutFormState>();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    form.setFieldsValue({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      paymentMethod: 'cash'
    });
  }, [form, user]);

  const handleSubmit = async (values: CheckoutFormState): Promise<void> => {
    setRequestError(null);

    try {
      setIsSubmitting(true);
      const cartView = await cartApi.getMyCart();

      await ordersApi.createOrder({
        cartId: cartView.cart.id,
        address: values.address.trim(),
        comment: values.comment?.trim() || undefined
      });

      resetCart();
      showSuccessToast('Заказ успешно оформлен');
      navigate('/profile', { replace: true });
    } catch (error: unknown) {
      setRequestError(getApiErrorMessage(error, 'Не удалось оформить заказ. Попробуйте снова.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 760, padding: '24px 0' }}>
      <Card>
        <Flex vertical gap={20}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Оформление заказа
            </Typography.Title>
            <Typography.Text type="secondary">
              Проверьте контактные данные и укажите адрес доставки.
            </Typography.Text>
          </div>

          <Card size="small">
            <Space direction="vertical" size={4}>
              <Typography.Text>Товаров: {totalItems}</Typography.Text>
              <Typography.Text strong>Сумма: {new Intl.NumberFormat('ru-RU').format(totalPrice)} ₽</Typography.Text>
            </Space>
          </Card>

          {items.length === 0 && !isCartLoading ? (
            <Alert
              type="info"
              showIcon
              message="Корзина пуста. Добавьте товары перед оформлением заказа."
              action={
                <Link to="/catalog">
                  <Button size="small">Перейти в каталог</Button>
                </Link>
              }
            />
          ) : null}

          <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={isSubmitting}>
            <Form.Item
              label="Имя заказчика"
              name="fullName"
              rules={[
                { required: true, message: 'Введите имя заказчика' },
                { min: 2, message: 'Минимум 2 символа' }
              ]}
            >
              <Input placeholder="Иван Иванов" />
            </Form.Item>

            <Form.Item
              label="Email для отправки чека"
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Некорректный email' }
              ]}
            >
              <Input placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Номер телефона"
              name="phone"
              rules={[
                { required: true, message: 'Введите номер телефона' },
                { min: 6, message: 'Минимум 6 символов' }
              ]}
            >
              <Input placeholder="+79991234567" />
            </Form.Item>

            <Form.Item
              label="Адрес"
              name="address"
              rules={[
                { required: true, message: 'Введите адрес доставки' },
                { min: 5, message: 'Минимум 5 символов' }
              ]}
            >
              <Input.TextArea placeholder="Город, улица, дом, квартира" rows={3} />
            </Form.Item>

            <Form.Item label="Комментарий" name="comment">
              <Input.TextArea placeholder="Комментарий к заказу (необязательно)" rows={3} />
            </Form.Item>

            <Form.Item label="Способ оплаты" name="paymentMethod" rules={[{ required: true }]}>
              <Select options={[{ value: 'cash', label: 'Наличный расчет' }]} />
            </Form.Item>

            {requestError ? <Alert type="error" showIcon message={requestError} style={{ marginBottom: 16 }} /> : null}

            <Button
              block
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={items.length === 0}
            >
              Оформить заказ
            </Button>
          </Form>
        </Flex>
      </Card>
    </div>
  );
}
