import React from 'react';
import html2canvas from 'html2canvas';

const TableScreenshot = ({ tableId, city }) => {
  const handleDownload = async () => {
    const element = document.getElementById(tableId);
    if (!element) {
      alert('Table element not found');
      return;
    }
    const canvas = await html2canvas(element);
    const img = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = img;
    link.download = `${city} Panchangam.png`;
    link.click();
  };

  const handleShare = async () => {
    const element = document.getElementById(tableId);
    if (!element) {
      alert('Table element not found');
      return;
    }
    const canvas = await html2canvas(element);
    const img = canvas.toDataURL('image/png');
    const blob = await (await fetch(img)).blob();

    if (navigator.share) {
      const file = new File([blob], `${city} Panchangam.png`, { type: 'image/png' });
      try {
        await navigator.share({
          files: [file],
          title: `${city} Panchangam`,
          text: 'Check out this Panchangam table!',
        });
      } catch (error) {
        console.error('Error sharing the image:', error);
      }
    } else {
      alert('Sharing is not supported on this device.');
    }
  };

  return (
    <div className="download-button">
      <button className="share-button" onClick={handleDownload}> <i class="fa-solid fa-download"></i></button>
      <button className="share-button" onClick={handleShare}> <i className="far fa-share-square"></i></button>
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
