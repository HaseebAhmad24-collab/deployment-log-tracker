import { useState } from 'react';
import { createLog } from '../api';
import { useToast } from '../toast';

export default function AddLogForm({ onLogAdded }) {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!message.trim()) {
      setError('Message is required');
      return;
    }
    if (!imageFile) {
      setError('Please choose an image');
      return;
    }

    setSubmitting(true);
    try {
      const newLog = await createLog(message.trim(), imageFile);
      setMessage('');
      setImageFile(null);
      e.target.reset();
      onLogAdded(newLog);
      showToast('Deployment log added');
    } catch (err) {
      setError(err.message || 'Failed to add log');
      showToast(err.message || 'Failed to add log', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="add-log-form" onSubmit={handleSubmit}>
      <h2>Add Deployment Log</h2>

      <div className="form-row">
        <label htmlFor="message">Message</label>
        <input
          id="message"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Deployed backend v1.2.3 to production"
          disabled={submitting}
        />
      </div>

      <div className="form-row">
        <label htmlFor="image">Screenshot</label>
        <input
          id="image"
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => setImageFile(e.target.files[0] || null)}
          disabled={submitting}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Uploading...' : 'Add'}
      </button>
    </form>
  );
}
