import React from 'react';
import html2canvas from 'html2canvas';

const TableScreenshot = ({ tableId, city, date, backendEndpoint, backendData }) => {
  const [capturing, setCapturing] = React.useState(false);

  // Function to call backend for image generation
  const handleBackendCapture = async (mode = 'download') => {
    setCapturing(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}${backendEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city,
          date: date,
          ...backendData
        })
      });

      if (!response.ok) throw new Error('Backend failed to generate image');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      if (mode === 'share') {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'panchang.png', { type: 'image/png' })] })) {
          const file = new File([blob], `Panchangam_${city || 'Report'}.png`, { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: `Panchangam Report - ${city}`,
            text: 'Sharing my daily Vedic timings from Panchangam.ai',
          });
        } else {
          // Fallback to download if share not supported
          const link = document.createElement('a');
          link.href = url;
          link.download = `Panchangam_${city || 'Report'}_${date || ''}.png`;
          link.click();
        }
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Panchangam_${city || 'Report'}_${date || ''}.png`;
        link.click();
      }

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backend image error:', error);
      alert('Failed to generate image on the server. Please try again later.');
    } finally {
      setCapturing(false);
    }
  };

  const captureTableLocal = async () => {
    const element = document.getElementById(tableId);
    if (!element) return null;

    setCapturing(true);
    try {
      if (document.fonts) await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(tableId);
          if (clonedElement) {
            const toHide = clonedElement.querySelectorAll('.download-button-container, .download-button, .table-footer-actions, .information');
            toHide.forEach(el => el.style.display = 'none');
            clonedElement.style.padding = '30px';
          }
        }
      });
      return canvas;
    } catch (error) {
      console.error('Capture failed:', error);
      throw error;
    } finally {
      setCapturing(false);
    }
  };

  const handleDownloadLocal = async () => {
    try {
      const canvas = await captureTableLocal();
      if (!canvas) return;
      const img = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = img;
      link.download = `Panchanga_${city || 'Report'}.jpg`;
      link.click();
    } catch (e) { alert('Capture failed'); }
  };

  const handleShareLocal = async () => {
    try {
      const canvas = await captureTableLocal();
      if (!canvas) return;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (navigator.share) {
        const file = new File([blob], 'panchang.jpg', { type: 'image/jpeg' });
        await navigator.share({ files: [file], title: 'Panchangam' });
      } else {
        handleDownloadLocal();
      }
    } catch (e) { alert('Share failed'); }
  };

  const onDownload = backendEndpoint ? () => handleBackendCapture('download') : handleDownloadLocal;
  const onShare = backendEndpoint ? () => handleBackendCapture('share') : handleShareLocal;

  return (
    <div className="download-button-container" style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '30px 0' }}>
      <button
        onClick={onDownload}
        disabled={capturing}
        style={{
          background: '#0ea5e9',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '12px',
          cursor: capturing ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '700',
          transition: 'all 0.2s ease'
        }}
      >
        {capturing ? <span className="spinner-small"></span> : <i className="fa-solid fa-download"></i>}
        {capturing ? 'Processing...' : 'Download Image'}
      </button>

      <button
        onClick={onShare}
        disabled={capturing}
        style={{
          background: '#10b981',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '12px',
          cursor: capturing ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '700',
          transition: 'all 0.2s ease'
        }}
      >
        {capturing ? <span className="spinner-small"></span> : <i className="far fa-share-square"></i>}
        {capturing ? 'Preparing...' : 'Share Now'}
      </button>
    </div>
  );
};

export default TableScreenshot;
