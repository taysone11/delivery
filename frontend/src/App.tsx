import { useEffect } from 'react';

import { AppRouter } from './app/router';
import { useAuthStore } from './features/auth/authStore';

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <AppRouter />;
}

export default App;
