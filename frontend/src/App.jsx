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
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 24" width="34" height="20">
              <circle cx="16" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
              <circle cx="24" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </span>
          <span className="brand-name">Deployment Log Tracker</span>
        </div>

        <nav className="site-nav">
          <a href="#hero">Overview</a>
          <a href="#add-log">Add Log</a>
          <a href="#history">History</a>
        </nav>

        <div className="header-actions">
          <a className="pill pill-light" href="#history">
            History
          </a>
          <a className="pill pill-dark" href="#add-log">
            <span className="pill-arrow" aria-hidden="true">
              <svg viewBox="0 0 12 12" width="9" height="9">
                <path
                  d="M2 6h8m0 0-3-3m3 3-3 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Add Log
          </a>
        </div>
      </header>

      <section id="hero" className="hero">
        <div className="hero-sky" aria-hidden="true" />
        <h1 className="hero-title">
          One place for every
          <br />
          deployment you ship
        </h1>
        <p className="hero-subtitle">
          Log a message and screenshot for every release, store it safely in
          S3, and review your team&apos;s deployment history in one place.
        </p>
        <div className="hero-cta">
          <a className="pill pill-dark" href="#add-log">
            <span className="pill-arrow" aria-hidden="true">
              <svg viewBox="0 0 12 12" width="9" height="9">
                <path
                  d="M2 6h8m0 0-3-3m3 3-3 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Add a deployment log
          </a>
          <a className="pill pill-light" href="#history">
            View history
          </a>
        </div>
      </section>

      <main className="content">
        <section id="add-log" className="section">
          <AddLogForm onLogAdded={handleLogAdded} />
        </section>

        <section id="history" className="section">
          <h2 className="section-title">Deployment history</h2>
          <LogList
            logs={logs}
            loading={loading}
            error={error}
            onLogDeleted={handleLogDeleted}
          />
        </section>
      </main>

      <footer className="site-footer">
        <p>Deployment Log Tracker — messages and screenshots stored in MySQL &amp; S3.</p>
      </footer>
    </div>
  );
}
