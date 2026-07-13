import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './hooks/useAuth';
import { Library } from './pages/Library';
import { BookDetail } from './pages/BookDetail';
import { Purchase } from './pages/Purchase';
import { Reader } from './pages/Reader';
import { MyLibrary } from './pages/MyLibrary';

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="app">
          <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/purchase/:id" element={<Purchase />} />
          <Route path="/read/:id" element={<Reader />} />
          <Route path="/my-library" element={<MyLibrary />} />
        </Routes>
      </div>
    </ErrorBoundary>
  </AuthProvider>
  );
}
