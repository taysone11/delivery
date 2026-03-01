import { useMemo, useState } from 'react';
import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../features/auth/authStore';
import { getApiErrorMessage } from '../../shared/lib/apiError';
import { getRedirectPath } from '../../shared/lib/navigation';

interface LoginFormState {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const authLogin = useAuthStore((state) => state.login);
  const accessToken = useAuthStore((state) => state.accessToken);

  const fromPath = useMemo(() => getRedirectPath(location.state, '/'), [location.state]);

  const [form] = Form.useForm<LoginFormState>();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (accessToken) {
    return <Navigate to={fromPath} replace />;
  }

  const handleSubmit = async (values: LoginFormState): Promise<void> => {
    setRequestError(null);

    try {
      setIsSubmitting(true);
      await authLogin(values.email.trim(), values.password);
      navigate(fromPath, { replace: true });
    } catch (error: unknown) {
      setRequestError(getApiErrorMessage(error, 'Не удалось выполнить вход. Попробуйте снова.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 460, padding: '24px 0' }}>
      <Card>
        <Flex vertical gap={16}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Вход
            </Typography.Title>
            <Typography.Text type="secondary">
              Введите данные аккаунта, чтобы продолжить.
            </Typography.Text>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={isSubmitting}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Некорректный email' }
              ]}
            >
              <Input autoComplete="email" placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: 6, message: 'Пароль должен быть не короче 6 символов' }
              ]}
            >
              <Input.Password autoComplete="current-password" placeholder="••••••••" />
            </Form.Item>

            {requestError ? <Alert type="error" showIcon message={requestError} style={{ marginBottom: 16 }} /> : null}

            <Button block type="primary" htmlType="submit" loading={isSubmitting}>
              Войти
            </Button>
          </Form>
        </Flex>
      </Card>
    </div>
  );
}
