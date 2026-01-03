import React from 'react';
import html2canvas from 'html2canvas';

const TableScreenshot = ({ tableId, city }) => {
  const captureTable = async () => {
    const element = document.getElementById(tableId);
    if (!element) {
      alert('Table element not found');
      return null;
    }

    // Enhanced options for better mobile capture
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true, // Handle cross-origin images
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth, // Capture full width including scrolled content
      height: element.scrollHeight, // Capture full height
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    return canvas;
  };

  const handleDownload = async () => {
    try {
      const canvas = await captureTable();
      if (!canvas) return;

      const img = canvas.toDataURL('image/png', 1.0); // Max quality

      const link = document.createElement('a');
      link.href = img;
      link.download = `${city || 'Panchangam'}_${new Date().toISOString().split('T')[0]}.png`;
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

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'test.png', { type: 'image/png' })] })) {
        const file = new File([blob], `${city || 'Panchangam'}_${new Date().toISOString().split('T')[0]}.png`, { type: 'image/png' });
        
        await navigator.share({
          files: [file],
          title: `${city || 'Panchangam'} Table`,
          text: 'Check out this Panchang table!',
        });
      } else {
        // Fallback: Download instead
        alert('Sharing not supported. Downloading instead...');
        await handleDownload();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Share cancelled');
      } else {
        console.error('Error sharing the image:', error);
        alert('Failed to share. Please try downloading instead.');
      }
    }
  };

  return (
    <div className="download-button">
      <button className="share-button" onClick={handleDownload} title="Download Table">
        <i className="fa-solid fa-download"></i>
      </button>
      <button className="share-button" onClick={handleShare} title="Share Table">
        <i className="far fa-share-square"></i>
      </button>
{/* 
      <div className="download-button">
            <button className="share-button" onClick={takeScreenshot}>
                <i className="far fa-share-square"></i>
            </button>
          </div> */}

    </div>
  );
};

export default TableScreenshot;
