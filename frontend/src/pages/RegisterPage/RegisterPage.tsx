import { useMemo, useState } from 'react';
import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/authStore';
import { getApiErrorMessage } from '../../shared/lib/apiError';
import { getRedirectPath } from '../../shared/lib/navigation';

interface RegisterFormState {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const authRegister = useAuthStore((state) => state.register);
  const accessToken = useAuthStore((state) => state.accessToken);

  const fromPath = useMemo(() => getRedirectPath(location.state, '/'), [location.state]);

  const [form] = Form.useForm<RegisterFormState>();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (accessToken) {
    return <Navigate to={fromPath} replace />;
  }

  const handleSubmit = async (values: RegisterFormState): Promise<void> => {
    setRequestError(null);

    try {
      setIsSubmitting(true);
      await authRegister({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone?.trim() || undefined
      });
      navigate(fromPath, { replace: true });
    } catch (error: unknown) {
      setRequestError(getApiErrorMessage(error, 'Не удалось зарегистрироваться. Попробуйте снова.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 520, padding: '24px 0' }}>
      <Card>
        <Flex vertical gap={16}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Регистрация
            </Typography.Title>
            <Typography.Text type="secondary">Создайте аккаунт, чтобы оформить заказ.</Typography.Text>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={isSubmitting}>
            <Form.Item
              label="Имя"
              name="fullName"
              rules={[
                { required: true, message: 'Введите имя' },
                { min: 2, message: 'Минимум 2 символа' }
              ]}
            >
              <Input placeholder="Иван Иванов" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { min: 4, message: 'Минимум 4 символа' }
              ]}
            >
              <Input autoComplete="email" placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: 6, message: 'Минимум 6 символов' }
              ]}
            >
              <Input.Password autoComplete="new-password" placeholder="••••••••" />
            </Form.Item>

            <Form.Item
              label="Телефон"
              name="phone"
              rules={[{ min: 6, message: 'Минимум 6 символов' }]}
            >
              <Input placeholder="+79991234567" />
            </Form.Item>

            {requestError ? (
              <Alert type="error" showIcon message={requestError} style={{ marginBottom: 16 }} />
            ) : null}

            <Flex vertical gap={8}>
              <Button block type="primary" htmlType="submit" loading={isSubmitting}>
                Зарегистрироваться
              </Button>
              <Button block type="default">
                <Link to="/login">У меня уже есть аккаунт</Link>
              </Button>
            </Flex>
          </Form>
        </Flex>
      </Card>
    </div>
  );
}
