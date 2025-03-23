import { lazy, Suspense } from 'react';
import { ChakraProvider, Spinner, Center, extendTheme } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Import components
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat.new';
import Forum from './pages/Forum.new';
import VerificationDemo from './pages/VerificationDemo';
import { AuthProvider } from './lib/authContext';

// Lazy load admin dashboard
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserSettings = lazy(() => import('./pages/UserSettings'));

// Create Chakra UI theme with WheelWorker colors
const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795', // Primary teal color
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "500",
        borderRadius: "md",
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "lg",
          overflow: "hidden",
        }
      }
    }
  },
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={
              <Center h="100vh">
                <Spinner size="xl" color="teal.500" />
              </Center>
            }>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="forum" element={<Forum />} />
                  <Route path="verify" element={<VerificationDemo />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="settings" element={<UserSettings />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App