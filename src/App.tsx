import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPrompt } from './components/InstallPrompt';
import { AuthProvider } from './hooks/useAuth';
import { Library } from './pages/Library';
import { BookDetail } from './pages/BookDetail';
import { Purchase } from './pages/Purchase';
import { Reader } from './pages/Reader';
import { StudioDashboard, StudioEditor } from './pages/Studio';
import { MyLibrary } from './pages/MyLibrary';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="app">
          <InstallPrompt />
          <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/purchase/:id" element={<Purchase />} />
          <Route path="/read/:id" element={<Reader />} />
          <Route path="/my-library" element={<MyLibrary />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/studio" element={<StudioDashboard />} />
          <Route path="/studio/:type/:id" element={<StudioEditor />} />
        </Routes>
      </div>
    </ErrorBoundary>
  </AuthProvider>
  );
}
