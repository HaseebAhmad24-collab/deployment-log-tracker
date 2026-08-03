import { useEffect, useState } from 'react';
import AddLogForm from './components/AddLogForm';
import LogList from './components/LogList';
import { fetchLogs } from './api';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleLogAdded = () => {
    loadLogs();
  };

  const handleLogDeleted = (id) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  return (
    <div className="app">
      <h1>Deployment Log Tracker</h1>
      <AddLogForm onLogAdded={handleLogAdded} />
      <LogList
        logs={logs}
        loading={loading}
        error={error}
        onLogDeleted={handleLogDeleted}
      />
    </div>
  );
}
