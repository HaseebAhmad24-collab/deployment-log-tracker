import { useState } from 'react';
import { deleteLog } from '../api';
import { useToast } from '../toast';

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

export default function LogList({ logs, loading, error, hasLoaded, onLogDeleted }) {
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const showToast = useToast();

  const handleDelete = async (id) => {
    setDeleteError('');
    setDeletingId(id);
    try {
      await deleteLog(id);
      onLogDeleted(id);
      showToast('Deployment log deleted');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete log');
      showToast(err.message || 'Failed to delete log', 'error');
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

  if (!hasLoaded) {
    return <p className="status-text">Click "List History" to load deployment logs.</p>;
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
