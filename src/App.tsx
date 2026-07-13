import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Library } from './pages/Library';
import { BookDetail } from './pages/BookDetail';
import { MyLibrary } from './pages/MyLibrary';

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/my-library" element={<MyLibrary />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
