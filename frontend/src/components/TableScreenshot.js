import React from 'react';
import html2canvas from 'html2canvas';

const TableScreenshot = ({ tableId, city }) => {
  const captureTable = async () => {
    const element = document.getElementById(tableId);
    if (!element) {
      alert('Table element not found');
      return null;
    }

    // Capture with enhanced options
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(tableId);
          if (clonedElement) {
            // 1. Hide unwanted UI elements from the screenshot
            const toHide = clonedElement.querySelectorAll('.download-button-container, .download-button, .table-footer-actions, .information, .floating-section button, .secondary-btn-hero');
            toHide.forEach(el => el.style.display = 'none');

            // 2. Add professional Branding Header (Ultra Compact Thin Bar)
            const branding = clonedDoc.createElement('div');
            branding.innerHTML = `
              <div style="background: #0f172a; color: white; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; border-radius: 12px 12px 0 0; font-family: 'Outfit', sans-serif;">
                <span style="font-size: 14px; font-weight: 800; letter-spacing: 1px;">PANCHANGAM.AI</span>
                <span style="font-size: 11px; opacity: 0.7;">${city || 'Vedic Astrology'} • ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            `;
            clonedElement.prepend(branding);

            // 3. Ensure full width capture for no-wrap tables
            clonedElement.style.width = 'max-content';
            clonedElement.style.minWidth = '800px';
            clonedElement.style.margin = '0 auto';
            clonedElement.style.padding = '20px'; /* Add some breathing room around the table */
            clonedElement.style.background = '#ffffff';
            clonedElement.style.borderRadius = '12px';

            // Ensure tables are fully expanded
            const tables = clonedElement.getElementsByTagName('table');
            for (let table of tables) {
              table.style.width = '100%';
              table.style.fontSize = '14px';
              table.style.margin = '0';
            }

            // Fix full-bleed issues in capture
            const wrappers = clonedElement.querySelectorAll('.table-wrapper');
            wrappers.forEach(w => {
              w.style.width = '100%';
              w.style.margin = '0';
              w.style.borderRadius = '0';
            });
          }
        }
      });

      return canvas;
    } catch (error) {
      console.error('Capture failed:', error);
      throw error;
    }
  };

  const handleDownload = async () => {
    try {
      const canvas = await captureTable();
      if (!canvas) return;

      // Convert to JPEG as requested
      const img = canvas.toDataURL('image/jpeg', 0.9);

      const link = document.createElement('a');
      link.href = img;
      link.download = `Panchanga_${city || 'Report'}_${new Date().toISOString().split('T')[0]}.jpg`;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const canvas = await captureTable();
      if (!canvas) return;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'panchang.jpg', { type: 'image/jpeg' })] })) {
        const file = new File([blob], `Panchanga_${city || 'Report'}.jpg`, { type: 'image/jpeg' });

        await navigator.share({
          files: [file],
          title: `Panchangam Report - ${city}`,
          text: 'Sharing my daily Vedic timings from Panchangam.ai',
        });
      } else {
        alert('Sharing not supported on this browser. Downloading instead...');
        await handleDownload();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Share cancelled');
      } else {
        console.error('Error sharing image:', error);
        alert('Failed to share. Please try downloading instead.');
      }
    }
  };

  return (
    <div className="download-button-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
      <button
        onClick={handleDownload}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600'
        }}
      >
        <i className="fa-solid fa-download"></i> Download JPG
      </button>
      <button
        onClick={handleShare}
        style={{
          background: '#10b981',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600'
        }}
      >
        <i className="far fa-share-square"></i> Share
      </button>
    </div>
  );
};

export default TableScreenshot;
