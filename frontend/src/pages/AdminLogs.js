import React, { useState, useEffect, useCallback } from 'react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [secret, setSecret] = useState(localStorage.getItem('adminSecret') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminSecret'));
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminSecret');
    setSecret('');
    setIsAuthenticated(false);
    setLogs([]);
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/admin/logs?page=${page}&limit=50`, {
        headers: {
          'x-admin-secret': secret
        }
      });

      if (response.status === 401) {
        handleLogout();
        setError('Invalid Admin Secret');
        return;
      }
      
      const data = await response.json();
      if (data.logs) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      } else {
         // Fallback if DB not connected/empty responses
         setLogs([]); 
      }
    } catch (err) {
      setError('Failed to fetch logs. DB might be disconnected.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, secret, handleLogout]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated, fetchLogs]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (secret) {
      localStorage.setItem('adminSecret', secret);
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Admin Panel Access</h2>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter Admin Secret"
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Access or Delete</button>
          </form>
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>System Logs</h1>
        <div style={styles.controls}>
          <button onClick={fetchLogs} style={styles.refreshBtn}>Refresh</button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.tableContainer}>
        {loading ? (
          <p style={styles.loading}>Loading logs...</p>
        ) : logs.length === 0 ? (
          <p style={styles.empty}>No logs found (or DB not connected).</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Level</th>
                <th style={styles.th}>Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} style={styles.tr}>
                  <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: log.level === 'error' ? '#ef4444' : log.level === 'warn' ? '#f59e0b' : '#10b981'
                    }}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.messageContent}>
                      {renderMessage(log.message)}
                      {log.meta && Object.keys(log.meta).length > 0 && (
                          <details style={{marginTop:'5px', color:'gray'}}>
                              <summary>Meta</summary>
                              <pre style={{fontSize:'12px'}}>{JSON.stringify(log.meta, null, 2)}</pre>
                          </details>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.pagination}>
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          style={styles.pageBtn}
        >
          Previous
        </button>
        <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
        <button 
          disabled={page === totalPages} 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          style={styles.pageBtn}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const renderMessage = (msg) => {
  if (typeof msg === 'string') return msg;
  return <pre style={{margin:0, whiteSpace:'pre-wrap', maxHeight:'200px', overflowY:'auto'}}>{JSON.stringify(msg, null, 2)}</pre>;
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111827', color: 'white' },
  card: { padding: '2rem', backgroundColor: '#1f2937', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  title: { marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.75rem', borderRadius: '5px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white' },
  button: { padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  error: { color: '#ef4444', marginTop: '1rem', fontSize: '0.875rem' },
  dashboard: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' },
  headerTitle: { fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' },
  controls: { display: 'flex', gap: '1rem' },
  refreshBtn: { padding: '0.5rem 1rem', backgroundColor: '#10b981', border: 'none', borderRadius: '5px', color:'white', cursor:'pointer' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#ef4444', border: 'none', borderRadius: '5px', color:'white', cursor:'pointer' },
  tableContainer: { overflowX: 'auto', backgroundColor: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '1rem', textAlign: 'left', backgroundColor: '#334155', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' },
  tr: { borderBottom: '1px solid #334155' },
  td: { padding: '1rem', verticalAlign: 'top', fontSize: '0.9rem' },
  badge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: 'white' },
  pagination: { display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', alignItems: 'center' },
  pageBtn: { padding: '0.5rem 1rem', backgroundColor: '#3b82f6', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', disabled: { opacity: 0.5, cursor: 'not-allowed' } },
  pageInfo: { color: '#94a3b8' },
  loading: { textAlign: 'center', padding: '2rem', color: '#94a3b8' },
  empty: { textAlign: 'center', padding: '2rem', color: '#94a3b8' },
  messageContent: { fontFamily: 'monospace', color: '#e2e8f0' },
  errorBanner: { padding: '1rem', backgroundColor: '#ef444433', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '5px', marginBottom: '1rem' }
};

export default AdminLogs;
