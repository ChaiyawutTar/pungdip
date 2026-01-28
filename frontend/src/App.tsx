import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicGame } from './pages/PublicGame';
import { AdminPanel } from './pages/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicGame />} />
          <Route path="/secret-admin-control" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
