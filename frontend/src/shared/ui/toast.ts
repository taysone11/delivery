import { toast } from 'react-toastify';

const AUTH_REQUIRED_TOAST_ID = 'auth-required-toast';

export function showAuthRequiredToast(): void {
  if (toast.isActive(AUTH_REQUIRED_TOAST_ID)) {
    return;
  }

  toast.info('Войдите в аккаунт, чтобы добавлять товары в корзину и оформлять заказ', {
    toastId: AUTH_REQUIRED_TOAST_ID
  });
}

export function showSuccessToast(message: string): void {
  toast.success(message);
}

export function showErrorToast(message: string): void {
  toast.error(message);
}
