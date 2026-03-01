import { useAuthStore } from '../features/auth/authStore';
import { useCartStore } from '../features/cart/cartStore';

let initialized = false;

export function initStores(): void {
  if (initialized) {
    return;
  }

  initialized = true;

  let previousToken = useAuthStore.getState().accessToken;

  useAuthStore.subscribe((state) => {
    const nextToken = state.accessToken;

    if (!previousToken && nextToken) {
      void useCartStore.getState().fetch();
    }

    if (previousToken && !nextToken) {
      useCartStore.getState().reset();
    }

    previousToken = nextToken;
  });
}
