import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Descriptions, Flex, Space, Spin, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/authStore';
import { ordersApi } from '../../shared/api/endpoints/orders/orders.endpoints';
import type { OrderStatus, OrderWithItems } from '../../shared/api/endpoints/orders/orders.types';
import { getApiErrorMessage } from '../../shared/lib/apiError';

const ACTIVE_STATUSES: OrderStatus[] = ['new', 'preparing', 'delivering'];

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'new':
      return 'Новый';
    case 'confirmed':
      return 'Подтвержден';
    case 'preparing':
      return 'Готовится';
    case 'delivering':
      return 'Доставляется';
    case 'completed':
      return 'Завершен';
    case 'canceled':
      return 'Отменен';
    default:
      return status;
  }
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'new':
      return 'blue';
    case 'confirmed':
      return 'cyan';
    case 'preparing':
      return 'orange';
    case 'delivering':
      return 'gold';
    case 'completed':
      return 'green';
    case 'canceled':
      return 'red';
    default:
      return 'default';
  }
}

function OrderCard({ orderWithItems }: { orderWithItems: OrderWithItems }) {
  const { order, items } = orderWithItems;

  return (
    <Card size="small">
      <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
        <Typography.Text strong>Заказ №{order.id}</Typography.Text>
        <Tag color={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Tag>
      </Flex>

      <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
        <Typography.Text>Сумма: {formatPrice(order.total)}</Typography.Text>
        <Typography.Text>Адрес: {order.address}</Typography.Text>
        {order.comment ? <Typography.Text>Комментарий: {order.comment}</Typography.Text> : null}
        <Typography.Text strong style={{ marginTop: 4 }}>
          Товары:
        </Typography.Text>
        {items.length === 0 ? (
          <Typography.Text type="secondary">Состав заказа недоступен.</Typography.Text>
        ) : (
          items.map((item) => (
            <Typography.Text key={item.id}>
              • {item.productName || (item.productId ? `Товар #${item.productId}` : 'Удаленный товар')} x {item.quantity}
            </Typography.Text>
          ))
        )}
        <Typography.Text type="secondary">{formatDate(order.createdAt)}</Typography.Text>
      </Space>
    </Card>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isActiveExpanded, setIsActiveExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  useEffect(() => {
    const fetchOrders = async (): Promise<void> => {
      try {
        setIsLoadingOrders(true);
        setOrdersError(null);
        const response = await ordersApi.getMyOrders();
        setOrders(response.orders);
      } catch (error: unknown) {
        setOrdersError(getApiErrorMessage(error, 'Не удалось загрузить заказы.'));
      } finally {
        setIsLoadingOrders(false);
      }
    };

    void fetchOrders();
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((orderWithItems) => ACTIVE_STATUSES.includes(orderWithItems.order.status)),
    [orders]
  );
  const historyOrders = useMemo(
    () => orders.filter((orderWithItems) => !ACTIVE_STATUSES.includes(orderWithItems.order.status)),
    [orders]
  );
  const visibleActiveOrders = useMemo(
    () => (isActiveExpanded ? activeOrders : activeOrders.slice(0, 1)),
    [activeOrders, isActiveExpanded]
  );
  const visibleHistoryOrders = useMemo(
    () => (isHistoryExpanded ? historyOrders : historyOrders.slice(0, 1)),
    [historyOrders, isHistoryExpanded]
  );

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <Flex vertical gap={16} style={{ width: '100%', maxWidth: 860, padding: '16px 0' }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        Профиль
      </Typography.Title>

      <Card title="Данные пользователя">
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Имя">{user?.fullName || 'Не указано'}</Descriptions.Item>
          <Descriptions.Item label="Почта">{user?.email || 'Не указано'}</Descriptions.Item>
          <Descriptions.Item label="Телефон">{user?.phone || 'Не указано'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Активные заказы"
        extra={
          activeOrders.length > 1 ? (
            <Button type="link" onClick={() => setIsActiveExpanded((prev) => !prev)}>
              {isActiveExpanded ? 'Свернуть' : 'Показать все'}
            </Button>
          ) : null
        }
      >
        {isLoadingOrders ? <Spin /> : null}
        {ordersError ? <Alert type="error" showIcon message={ordersError} /> : null}
        {!isLoadingOrders && !ordersError && activeOrders.length === 0 ? (
          <Typography.Text type="secondary">Сейчас активных заказов нет.</Typography.Text>
        ) : null}
        {!isLoadingOrders && !ordersError ? (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {visibleActiveOrders.map((orderWithItems) => (
              <OrderCard key={orderWithItems.order.id} orderWithItems={orderWithItems} />
            ))}
          </Space>
        ) : null}
      </Card>

      <Card
        title="История заказов"
        extra={
          historyOrders.length > 1 ? (
            <Button type="link" onClick={() => setIsHistoryExpanded((prev) => !prev)}>
              {isHistoryExpanded ? 'Свернуть' : 'Показать все'}
            </Button>
          ) : null
        }
      >
        {!isLoadingOrders && !ordersError && historyOrders.length === 0 ? (
          <Typography.Text type="secondary">История заказов пуста.</Typography.Text>
        ) : null}
        {!isLoadingOrders && !ordersError ? (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {visibleHistoryOrders.map((orderWithItems) => (
              <OrderCard key={orderWithItems.order.id} orderWithItems={orderWithItems} />
            ))}
          </Space>
        ) : null}
      </Card>

      <Button type="primary" danger onClick={handleLogout} style={{ alignSelf: 'flex-start' }}>
        Выйти
      </Button>
    </Flex>
  );
}
