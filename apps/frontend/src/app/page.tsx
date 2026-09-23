'use client';

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    party: '',
    union: '',
    occasionType: 'victory_day',
    headline: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterStatus, setPosterStatus] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 3)); // Max 3 photos
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPosterStatus('Uploading photos...');

    try {
      // 1. Upload photos first
      const photoUrls = [];
      for (const photo of photos) {
        const formData = new FormData();
        formData.append('photo', photo);
        // Note: URL would normally be dynamic based on env
        const uploadRes = await fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) photoUrls.push(uploadData.url);
      }

      setPosterStatus('Submitting poster generation request...');
      // 2. Submit form data to create poster
      const reqRes = await fetch('http://localhost:3001/api/posters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photoUrls,
          templateId: 'dummy-template-id' // Will be dynamic later
        }),
      });
      const reqData = await reqRes.json();
      
      if (reqData.id) {
        setPosterStatus('Generating... (this may take a few moments)');
        // 3. Poll for status
        pollStatus(reqData.id);
      } else {
        setPosterStatus('Failed to submit request.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setPosterStatus('Error occurred during submission.');
      setIsSubmitting(false);
    }
  };

  const pollStatus = async (posterId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posters/${posterId}`);
        const data = await res.json();
        
        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setPosterStatus('Completed!');
          setPosterUrl(data.generatedImageUrl);
          setIsSubmitting(false);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setPosterStatus('Generation failed.');
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error(error);
      }
    }, 3000);
  };

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>PolitiCraft AI - Poster Generator</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} />
        </label>
        
        <label>
          Designation (পদবি):
          <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} required style={inputStyle} />
        </label>

        <label>
          Party / Organization:
          <input type="text" name="party" value={formData.party} onChange={handleInputChange} required style={inputStyle} />
        </label>

        <label>
          Union / Thana / District (ইউনিয়ন/থানা/জেলা):
          <input type="text" name="union" value={formData.union} onChange={handleInputChange} style={inputStyle} />
        </label>

        <label>
          Occasion Type:
          <select name="occasionType" value={formData.occasionType} onChange={handleInputChange} style={inputStyle}>
            <option value="victory_day">Victory Day</option>
            <option value="condolence">Condolence / Tribute</option>
            <option value="campaign">Campaign</option>
          </select>
        </label>

        <label>
          Headline (Bangla):
          <input type="text" name="headline" value={formData.headline} onChange={handleInputChange} required style={inputStyle} placeholder="মহান বিজয় দিবস উপলক্ষে..." />
        </label>

        <label>
          Photos (Max 3):
          <input type="file" accept="image/*" multiple onChange={handlePhotoChange} style={inputStyle} />
        </label>

        <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem', background: '#006a4e', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
          {isSubmitting ? 'Processing...' : 'Generate Poster'}
        </button>
      </form>

      {posterStatus && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: posterStatus.includes('Error') || posterStatus.includes('failed') ? '#ffebee' : '#f0f0f0', 
          color: posterStatus.includes('Error') || posterStatus.includes('failed') ? '#c62828' : '#333',
          border: `1px solid ${posterStatus.includes('Error') || posterStatus.includes('failed') ? '#c62828' : '#ccc'}`,
          borderRadius: '4px' 
        }}>
          <strong>Status:</strong> {posterStatus}
        </div>
      )}

      {posterUrl && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Result:</h2>
          <img src={posterUrl} alt="Generated Poster" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ccc' }} />
        </div>
      )}
    </main>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.5rem',
  marginTop: '0.25rem',
  border: '1px solid #ccc',
  borderRadius: '4px'
};
