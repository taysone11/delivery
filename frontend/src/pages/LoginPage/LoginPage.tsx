import { type FormEvent, useMemo, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
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

  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormState>>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (accessToken) {
    return <Navigate to={fromPath} replace />;
  }

  const handleEmailChange = (value: string) => {
    setForm((prev) => ({ ...prev, email: value }));
  };

  const handlePasswordChange = (value: string) => {
    setForm((prev) => ({ ...prev, password: value }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<LoginFormState> = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Введите email';
    } else if (!form.email.includes('@')) {
      nextErrors.email = 'Некорректный email';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Введите пароль';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Пароль должен быть не короче 6 символов';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestError(null);

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await authLogin(form.email.trim(), form.password);
      navigate(fromPath, { replace: true });
    } catch (error: unknown) {
      setRequestError(getApiErrorMessage(error, 'Не удалось выполнить вход. Попробуйте снова.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 460, py: 4 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
          <Box>
            <Typography variant="h5" component="h1">
              Вход
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Введите данные аккаунта, чтобы продолжить.
            </Typography>
          </Box>

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => handleEmailChange(event.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            error={Boolean(errors.email)}
            helperText={errors.email}
            disabled={isSubmitting}
            fullWidth
          />

          <TextField
            label="Пароль"
            type="password"
            value={form.password}
            onChange={(event) => handlePasswordChange(event.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            error={Boolean(errors.password)}
            helperText={errors.password}
            disabled={isSubmitting}
            fullWidth
          />

          {requestError ? <Alert severity="error">{requestError}</Alert> : null}

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Входим...' : 'Войти'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
