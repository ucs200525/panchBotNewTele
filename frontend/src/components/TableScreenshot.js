import React from 'react';
import html2canvas from 'html2canvas';

const TableScreenshot = ({ tableId, city }) => {
  const [capturing, setCapturing] = React.useState(false);

  const captureTable = async () => {
    const element = document.getElementById(tableId);
    if (!element) {
      alert('Table element not found');
      return null;
    }

    setCapturing(true);

    try {
      // Ensure fonts are loaded
      if (document.fonts) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // 1. CRITICAL: Reset HTML font size and zoom from the parent containers
          clonedDoc.documentElement.style.fontSize = '16px';
          
          const appContainer = clonedDoc.querySelector('.app-container');
          if (appContainer) {
            appContainer.style.zoom = '1';
            appContainer.style.transform = 'none';
            appContainer.style.width = 'auto';
            appContainer.style.maxWidth = 'none';
          }

          const clonedElement = clonedDoc.getElementById(tableId);
          if (clonedElement) {
            // 2. Hide unwanted UI elements
            const toHide = clonedElement.querySelectorAll('.download-button-container, .download-button, .table-footer-actions, .information, .floating-section button, .secondary-btn-hero, .info-note, .hero-form, .hero-section');
            toHide.forEach(el => el.style.display = 'none');

            // 3. Reset the captured element specifically
            clonedElement.style.width = '1000px';
            clonedElement.style.minWidth = '1000px';
            clonedElement.style.margin = '0';
            clonedElement.style.padding = '30px';
            clonedElement.style.background = '#ffffff';
            clonedElement.style.borderRadius = '20px';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.zoom = '1'; /* Ensure direct zoom reset */
            clonedElement.style.transform = 'none';

            // 4. Add professional Branding Header (Refined for City/Date alignment)
            const branding = clonedDoc.createElement('div');
            branding.innerHTML = `
              <div style="background: #1e293b; color: white; padding: 16px 25px; display: flex; justify-content: space-between; align-items: center; border-radius: 12px 12px 0 0; font-family: sans-serif; margin-bottom: 2px;">
                <span style="font-size: 18px; font-weight: 800; letter-spacing: 2px; font-family: inherit;">PANCHAKA RAHU MUHURTHAM</span>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 13px; font-weight: 700; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px;">${city || 'Location'}</span>
                  <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.3);"></div>
                  <span style="font-size: 12px; opacity: 0.8;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            `;
            clonedElement.prepend(branding);

            // 5. Force Tables to be stable and readable
            const tables = clonedElement.getElementsByTagName('table');
            for (let table of tables) {
              table.style.width = '100%';
              table.style.margin = '0';
              table.style.borderCollapse = 'collapse';
              table.style.tableLayout = 'auto'; // Auto is safer for font spacing
              table.style.fontSize = '16px';
              table.style.fontFamily = "sans-serif"; // Use safe font for capture to prevent squashing
              
              const cells = table.querySelectorAll('th, td');
              cells.forEach(cell => {
                cell.style.padding = '15px 20px';
                cell.style.border = '1px solid #e2e8f0';
                cell.style.backgroundColor = '#ffffff';
                cell.style.color = '#1e293b';
                cell.style.whiteSpace = 'normal';
                cell.style.letterSpacing = 'normal';
                cell.style.wordSpacing = 'normal';
                cell.style.textRendering = 'optimizeLegibility';
                cell.style.fontVariantLigatures = 'none';
                cell.style.textAlign = 'center'; // Center all content
              });

              // Apply colors to special segments
              const periods = table.querySelectorAll('.period-ashubh, .PERIOD-ASHUBH, .badge-evil, .badge-danger, .badge-bad');
              periods.forEach(p => {
                p.style.backgroundColor = '#fecaca'; // Soft red
                p.style.color = '#7f1d1d';
                p.style.textAlign = 'center';
              });
              
              const goodPeriods = table.querySelectorAll('.period-special, .badge-good, .cat-good');
              goodPeriods.forEach(p => {
                p.style.backgroundColor = '#d1fae5'; // Soft green
                p.style.color = '#065f46';
                p.style.textAlign = 'center';
              });

              // Specifically center the badges themselves
              const badges = table.querySelectorAll('.category-badge');
              badges.forEach(badge => {
                badge.style.display = 'inline-block';
                badge.style.marginTop = '6px';
                badge.style.padding = '4px 12px';
                badge.style.borderRadius = '6px';
                badge.style.fontSize = '11px';
                badge.style.fontWeight = '800';
                badge.style.textAlign = 'center';
                badge.style.minWidth = '70px';
              });
            }

            // 6. Force body of clone to be wide enough
            clonedDoc.body.style.width = '1200px';
            clonedDoc.body.style.background = 'transparent';
          }
        }
      });

      setCapturing(false);
      return canvas;
    } catch (error) {
      console.error('Capture failed:', error);
      setCapturing(false);
      throw error;
    }
  };

  const handleDownload = async () => {
    try {
      const canvas = await captureTable();
      if (!canvas) return;

      const img = canvas.toDataURL('image/jpeg', 0.95);
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

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'panchang.jpg', { type: 'image/jpeg' })] })) {
        const file = new File([blob], `Panchanga_${city || 'Report'}.jpg`, { type: 'image/jpeg' });

        await navigator.share({
          files: [file],
          title: `Panchangam Report - ${city}`,
          text: 'Sharing my daily Vedic timings from Panchangam.ai',
        });
      } else {
        await handleDownload();
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing image:', error);
        alert('Failed to share. Please try downloading instead.');
      }
    }
  };

  return (
    <div className="download-button-container" style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '30px 0' }}>
      <button
        onClick={handleDownload}
        disabled={capturing}
        style={{
          background: '#0ea5e9',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '10px',
          cursor: capturing ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '700',
          boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)'
        }}
      >
        {capturing ? (
          <>
            <span className="spinner-small" style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
            Capturing...
          </>
        ) : (
          <>
            <i className="fa-solid fa-download"></i> Download JPG
          </>
        )}
      </button>
      <button
        onClick={handleShare}
        disabled={capturing}
        style={{
          background: '#10b981',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '10px',
          cursor: capturing ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '700',
          boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)'
        }}
      >
        {capturing ? 'Please wait...' : (
          <>
            <i className="far fa-share-square"></i> Share
          </>
        )}
      </button>
    </div>
  );
};

export default TableScreenshot;
