'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !file) {
      setStatusMessage('❌ App Title and File package are required!');
      return;
    }

    setUploading(true);
    setStatusMessage('🚀 Uploading file to storage and registering app...');
    setDownloadUrl('');

    try {
      // Package all input fields into standard multi-part Form Data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('developerName', developerName);
      formData.append('file', file);

      // Hit the unified backend route we created earlier
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatusMessage('✅ App uploaded and listed permanently!');
        // Extract the saved download URL from the nested database response array
        if (result.app && result.app[0]?.download_url) {
          setDownloadUrl(result.app[0].download_url);
        }
        // Reset form inputs
        setTitle('');
        setDescription('');
        setDeveloperName('');
        setFile(null);
        e.target.reset();
      } else {
        setStatusMessage(`❌ Error: ${result.error || 'Upload failed'}`);
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('❌ Network error. Failed to connect to server.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Deploy New App</h1>
        <p style={styles.subheading}>Fill out the fields below to list your package on the store marketplace permanently.</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>App Title *</label>
            <input 
              type="text" 
              placeholder="e.g. My Awesome Game"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Developer / Team Name</label>
            <input 
              type="text" 
              placeholder="e.g. Acme Studios"
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              disabled={uploading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea 
              placeholder="Provide a brief summary of what the app does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              style={{...styles.input, ...styles.textarea}}
              rows={4}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Application Package (.apk, .zip, .ipa) *</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              disabled={uploading}
              style={styles.fileInput}
              required
            />
          </div>

          <button type="submit" disabled={uploading} style={styles.button}>
            {uploading ? 'Processing Deployment...' : 'Publish App'}
          </button>
        </form>

        {statusMessage && <p style={styles.status}>{statusMessage}</p>}

        {downloadUrl && (
          <div style={styles.successBox}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#047857' }}>🎉 Live Persistent URL:</p>
            <a href={downloadUrl} target="_blank" rel="noreferrer" style={styles.link}>
              {downloadUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Clean inline UI styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '2rem'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    width: '100%',
    maxWidth: '500px'
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 0.5rem 0'
  },
  subheading: {
    color: '#4b5563',
    fontSize: '0.95rem',
    margin: '0 0 2rem 0',
    lineHeight: '1.4'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    color: '#111827',
    backgroundColor: '#f9fafb',
    outline: 'none'
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  fileInput: {
    fontSize: '0.95rem',
    color: '#4b5563',
    padding: '0.5rem 0'
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '0.85rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background-color 0.2s'
  },
  status: {
    marginTop: '1.25rem',
    fontSize: '0.95rem',
    textAlign: 'center',
    fontWeight: '500',
    color: '#1f2937'
  },
  successBox: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    padding: '1rem',
    marginTop: '1.5rem',
    wordBreak: 'break-all'
  },
  link: {
    color: '#059669',
    textDecoration: 'underline',
    fontSize: '0.9rem'
  }
};
