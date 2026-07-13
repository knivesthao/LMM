import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Content {
  id: string;
  title: string;
  creator_name: string;
  language: string;
  reading_level: string;
  cover_image_url: string;
  price_kip: number;
}

export function MyLibrary() {
  const [books, setBooks] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPurchases() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: purchases, error } = await supabase
        .from('purchases')
        .select('content_id')
        .eq('user_id', user.id);

      if (error || !purchases?.length) {
        setBooks([]);
        setLoading(false);
        return;
      }

      const contentIds = purchases.map((p) => p.content_id);
      const { data: content, error: contentError } = await supabase
        .from('content')
        .select('*')
        .in('id', contentIds);

      if (!contentError) {
        setBooks(content || []);
      }
      setLoading(false);
    }

    fetchPurchases();
  }, [user]);

  if (loading) {
    return (
      <div className="my-library">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="my-library">
      <header className="library-header">
        <h1>My Library</h1>
        <Link to="/">← Back to Library</Link>
      </header>

      {!user ? (
        <div className="empty">
          <p>Log in to see your purchased books.</p>
        </div>
      ) : books.length === 0 ? (
        <div className="empty">
          <p>No books purchased yet. Browse the library!</p>
          <Link to="/" className="browse-link">
            Browse books
          </Link>
        </div>
      ) : (
        <div className="content-grid" role="list">
          {books.map((book) => (
            <Link
              to={`/book/${book.id}`}
              key={book.id}
              className="content-card"
              role="listitem"
            >
              <img
                src={book.cover_image_url || '/mock/cover-placeholder.png'}
                alt={book.title}
                loading="lazy"
              />
              <div className="card-body">
                <h2>{book.title}</h2>
                <span className="badge">{book.language}</span>
                <span className="badge">{book.reading_level}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
