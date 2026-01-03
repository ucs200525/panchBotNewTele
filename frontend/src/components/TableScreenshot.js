import React from 'react';
import html2canvas from 'html2canvas';

const TableScreenshot = ({ tableId, city }) => {
  const captureTable = async () => {
    const element = document.getElementById(tableId);
    if (!element) {
      alert('Table element not found');
      return null;
    }

    // Store original styles
    const originalStyles = {
      height: element.style.height,
      maxHeight: element.style.maxHeight,
      overflow: element.style.overflow,
      position: element.style.position,
    };

    // Find all parent containers and store their styles
    const parents = [];
    let parent = element.parentElement;
    while (parent) {
      parents.push({
        element: parent,
        height: parent.style.height,
        maxHeight: parent.style.maxHeight,
        overflow: parent.style.overflow,
      });
      parent = parent.parentElement;
    }

    try {
      // Temporarily modify styles for full capture
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
      element.style.position = 'relative';

      // Modify parent containers
      parents.forEach(p => {
        p.element.style.height = 'auto';
        p.element.style.maxHeight = 'none';
        p.element.style.overflow = 'visible';
      });

      // Find all tables within the element and expand them
      const tables = element.getElementsByTagName('table');
      const tableStyles = [];
      for (let table of tables) {
        tableStyles.push({
          element: table,
          height: table.style.height,
          maxHeight: table.style.maxHeight,
          overflow: table.style.overflow,
        });
        table.style.height = 'auto';
        table.style.maxHeight = 'none';
        table.style.overflow = 'visible';
      }

      // Wait a moment for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture with enhanced options
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          // Ensure tables are fully expanded in the clone
          const clonedElement = clonedDoc.getElementById(tableId);
          if (clonedElement) {
            clonedElement.style.height = 'auto';
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.overflow = 'visible';
            
            const clonedTables = clonedElement.getElementsByTagName('table');
            for (let table of clonedTables) {
              table.style.height = 'auto';
              table.style.maxHeight = 'none';
            }
          }
        }
      });

      // Restore original styles
      element.style.height = originalStyles.height;
      element.style.maxHeight = originalStyles.maxHeight;
      element.style.overflow = originalStyles.overflow;
      element.style.position = originalStyles.position;

      parents.forEach(p => {
        p.element.style.height = p.height;
        p.element.style.maxHeight = p.maxHeight;
        p.element.style.overflow = p.overflow;
      });

      tableStyles.forEach(t => {
        t.element.style.height = t.height;
        t.element.style.maxHeight = t.maxHeight;
        t.element.style.overflow = t.overflow;
      });

      return canvas;
    } catch (error) {
      // Restore styles even if capture fails
      element.style.height = originalStyles.height;
      element.style.maxHeight = originalStyles.maxHeight;
      element.style.overflow = originalStyles.overflow;
      element.style.position = originalStyles.position;

      parents.forEach(p => {
        p.element.style.height = p.height;
        p.element.style.maxHeight = p.maxHeight;
        p.element.style.overflow = p.overflow;
      });

      throw error;
    }
  };

  const handleDownload = async () => {
    try {
      const canvas = await captureTable();
      if (!canvas) return;

      const img = canvas.toDataURL('image/png', 1.0);

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
      <button className="share-button" onClick={handleDownload} title="Download Complete Table">
        <i className="fa-solid fa-download"></i>
      </button>
      <button className="share-button" onClick={handleShare} title="Share Complete Table">
        <i className="far fa-share-square"></i>
      </button>
    </div>
  );
};

export default TableScreenshot;
