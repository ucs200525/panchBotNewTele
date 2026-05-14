const { Canvas } = require('skia-canvas');

/**
 * Renders a traditional South Indian (Square) Birth Chart
 */
async function drawSouthIndianChart(lagna, houseMaps) {
  try {
    const size = 600;
    const canvas = new Canvas(size, size);
    const ctx = canvas.getContext('2d');

    // Colors & Styles
    const bgColor = '#0a0c16';
    const gridColor = '#a855f7'; 
    const textColor = '#e2e8f0';
    const planetColor = '#c7d2fe';
    const lagnaColor = '#fbbf24';

    // Fill Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Draw Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 3;
    const cellSize = size / 4;

    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
    }

    // Clear central 2x2 area
    ctx.fillStyle = bgColor;
    ctx.fillRect(cellSize + 3, cellSize + 3, cellSize * 2 - 6, cellSize * 2 - 6);

    const gridMap = [
      { r: 11, x: 0, y: 0 }, { r: 0, x: 1, y: 0 }, { r: 1, x: 2, y: 0 }, { r: 2, x: 3, y: 0 },
      { r: 10, x: 0, y: 1 },                                           { r: 3, x: 3, y: 1 },
      { r: 9,  x: 0, y: 2 },                                           { r: 4, x: 3, y: 2 },
      { r: 8,  x: 0, y: 3 }, { r: 7, x: 1, y: 3 }, { r: 6, x: 2, y: 3 }, { r: 5, x: 3, y: 3 }
    ];

    const rashis = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];

    ctx.font = 'bold 16px sans-serif';
    gridMap.forEach(cell => {
      const x = cell.x * cellSize + 15;
      let y = cell.y * cellSize + 30;

      if (lagna.rashiIndex === cell.r) {
        ctx.fillStyle = lagnaColor;
        ctx.fillText("ASC", x, y);
        y += 20;
      }

      const cellPlanets = houseMaps.filter(h => h.rashiIndex === cell.r);
      cellPlanets.forEach(p => {
        ctx.fillStyle = planetColor;
        ctx.fillText(`${p.planetName.substring(0, 2)} ${p.degree.toFixed(0)}°`, x, y);
        y += 20;
      });
      
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '10px sans-serif';
      ctx.fillText(rashis[cell.r].toUpperCase(), cell.x * cellSize + 5, (cell.y + 1) * cellSize - 8);
      ctx.font = 'bold 16px sans-serif';
    });

    ctx.fillStyle = textColor;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Janma Kundali', size / 2, size / 2 - 10);
    ctx.font = '16px sans-serif';
    ctx.fillText('Bhargava Astro Engine', size / 2, size / 2 + 25);

    return await canvas.toBuffer('png');
  } catch (err) {
    console.error('Canvas Draw Error:', err);
    throw err;
  }
}

module.exports = { drawSouthIndianChart };

