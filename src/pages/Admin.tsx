import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Payment {
  id: string;
  user_id: string;
  content_id: string;
  amount_kip: number;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  content_title?: string;
  user_phone?: string;
}

export function Admin() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [confirming, setConfirming] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPayments();
  }, [filter]);

  async function loadPayments() {
    setLoading(true);
    let query = supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter === 'pending') {
      query = query.eq('status', 'pending');
    }

    const { data, error } = await query;

    if (error || !data) {
      setPayments([]);
      setLoading(false);
      return;
    }

    // Enrich with content titles and user phone numbers
    const enriched = await Promise.all(
      data.map(async (payment: Payment) => {
        const [contentRes, userRes] = await Promise.all([
          supabase
            .from('content')
            .select('title')
            .eq('id', payment.content_id)
            .single(),
          supabase.auth.admin.getUserById(payment.user_id),
        ]);

        return {
          ...payment,
          content_title: contentRes.data?.title ?? 'Unknown',
          user_phone: userRes.data?.user?.phone ?? payment.user_id.slice(0, 8),
        };
      })
    );

    setPayments(enriched);
    setLoading(false);
  }

  async function handleConfirm(paymentId: string) {
    setConfirming((prev) => new Set(prev).add(paymentId));
    await supabase.rpc('confirm_payment', { p_payment_id: paymentId });
    loadPayments();
    setConfirming((prev) => {
      const next = new Set(prev);
      next.delete(paymentId);
      return next;
    });
  }

  async function handleReject(paymentId: string) {
    setConfirming((prev) => new Set(prev).add(paymentId));
    await supabase.rpc('reject_payment', { p_payment_id: paymentId });
    loadPayments();
    setConfirming((prev) => {
      const next = new Set(prev);
      next.delete(paymentId);
      return next;
    });
  }

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <div className="admin">
      <header className="library-header">
        <h1>Admin</h1>
        <nav>
          <Link to="/">← Library</Link>
          {pendingCount > 0 && (
            <span className="pending-count">{pendingCount} pending</span>
          )}
        </nav>
      </header>

      <div className="admin-tabs">
        <button
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="empty"><p>No payments found.</p></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Book</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    {new Date(payment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="mono">{payment.user_phone}</td>
                  <td>{payment.content_title}</td>
                  <td>{payment.amount_kip.toLocaleString()} kip</td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {payment.status === 'pending' && (
                      <>
                        <button
                          className="action-btn confirm"
                          onClick={() => handleConfirm(payment.id)}
                          disabled={confirming.has(payment.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleReject(payment.id)}
                          disabled={confirming.has(payment.id)}
                        >
                          ✗
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
