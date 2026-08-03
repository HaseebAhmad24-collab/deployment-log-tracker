import { useState } from 'react';
import { deleteLog } from '../api';

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

export default function LogList({ logs, loading, error, onLogDeleted }) {
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (id) => {
    setDeleteError('');
    setDeletingId(id);
    try {
      await deleteLog(id);
      onLogDeleted(id);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete log');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="status-text">Loading logs...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (logs.length === 0) {
    return <p className="status-text">No deployment logs yet.</p>;
  }

  return (
    <div className="log-list">
      {deleteError && <p className="error-text">{deleteError}</p>}
      {logs.map((log) => (
        <div className="log-card" key={log.id}>
          <img src={log.image_url} alt={log.message} className="log-image" />
          <div className="log-card-body">
            <p className="log-message">{log.message}</p>
            <p className="log-date">{formatDate(log.created_at)}</p>
            <button
              className="delete-button"
              onClick={() => handleDelete(log.id)}
              disabled={deletingId === log.id}
            >
              {deletingId === log.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
