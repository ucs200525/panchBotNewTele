const { Canvas, FontLibrary } = require('skia-canvas');
const path = require('path');
const fs = require('fs');

// Register common system fonts for Linux/Vercel environments
const fontFallbacks = '"Inter", "DejaVu Sans", "Liberation Sans", "Bitstream Vera Sans", "Arial", sans-serif';
const headerFontFallbacks = '"Outfit", "Inter", "DejaVu Sans", sans-serif';

/**
 * Helper to wrap text into multiple lines
 */
function wrapText(ctx, text, maxWidth) {
    if (!text) return [];
    const words = text.split(/(?<=[ ,])\s*/);
    const lines = [];
    let currentLine = "";

    for (let word of words) {
        const testLine = currentLine + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width < maxWidth && currentLine !== "") {
            currentLine = testLine;
        } else if (currentLine === "") {
            currentLine = word;
        } else {
            lines.push(currentLine.trim());
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine.trim());
    return lines;
}

/**
 * Renders a standard astrological table using Skia-Canvas with dynamic row heights and text wrapping.
 */
async function renderAstrologyTable(title, city, date, headers, rows, type = 'standard') {
    // Log available fonts in production to debug
    if (process.env.VERCEL) {
        console.log("Available Font Families:", FontLibrary.families);
    }

    const width = 1200;
    const padding = 60;
    const headerHeight = 80;
    const tableHeaderHeight = 50; 
    const baseRowHeight = 60;
    const cardWidth = width - (padding * 2);
    
    // Measurement setup
    const measureCanvas = new Canvas(100, 100);
    const mctx = measureCanvas.getContext('2d');
    
    // Column widths
    let colWidths;
    if (type === 'combined') {
        colWidths = [50, 100, 200, 300, 400];
    } else if (type === 'bhargava') {
        colWidths = [300, 200, 300, 100];
    } else {
        colWidths = [350, 350, 300];
    }

    // Pre-calculate heights
    const rowInfos = rows.map(row => {
        let maxLines = 1;
        if (type === 'combined') {
            mctx.font = `400 13px ${fontFallbacks}`;
            const weekdayText = row.weekdays ? row.weekdays.map(w => `${w.weekday}${w.time !== '-' ? ` (${w.time})` : ''}`).join(', ') : '-';
            const wrappedWeekdays = wrapText(mctx, weekdayText, colWidths[4] - 20);
            
            mctx.font = `700 15px ${fontFallbacks}`;
            const wrappedDesc = wrapText(mctx, row.description || '', colWidths[2] - 20);
            
            maxLines = Math.max(wrappedWeekdays.length, wrappedDesc.length, 1);
            return { row, height: Math.max(baseRowHeight, maxLines * 22 + 30), wrappedWeekdays, wrappedDesc };
        } else if (type === 'bhargava') {
             return { row, height: baseRowHeight };
        } else {
            return { row, height: baseRowHeight };
        }
    });

    const totalTableHeight = rowInfos.reduce((acc, info) => acc + info.height, 0);
    const totalHeight = headerHeight + tableHeaderHeight + totalTableHeight + (padding * 2) + 60;
    
    const canvas = new Canvas(width, totalHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, totalHeight);

    // Main Card
    const cardX = padding;
    const cardY = padding;
    const cardHeight = totalHeight - (padding * 2);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 24);
    ctx.fill();

    // Header Bar
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, headerHeight, [24, 24, 0, 0]);
    ctx.fill();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 24px ${headerFontFallbacks}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(title.toUpperCase(), cardX + 30, cardY + headerHeight/2);

    // Location Badge
    ctx.font = `700 14px ${fontFallbacks}`;
    let displayDate = date;
    try {
        if (date.includes('-')) {
            const dObj = new Date(date);
            displayDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    } catch(e) {}
    
    const locationText = `${city} | ${displayDate}`;
    const badgeTextWidth = ctx.measureText(locationText).width;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(cardX + cardWidth - badgeTextWidth - 60, cardY + headerHeight/2 - 15, badgeTextWidth + 30, 30, 100);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(locationText, cardX + cardWidth - badgeTextWidth - 45, cardY + headerHeight/2);

    // Table Header
    const tableHeaderY = cardY + headerHeight;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cardX, tableHeaderY, cardWidth, tableHeaderHeight);
    ctx.fillStyle = '#64748b';
    ctx.font = `800 12px ${fontFallbacks}`;
    let headX = cardX + 30;
    headers.forEach((h, i) => {
        ctx.fillText(h.toUpperCase(), headX, tableHeaderY + tableHeaderHeight/2);
        headX += colWidths[i] || 200;
    });

    // Rows
    let currentY = tableHeaderY + tableHeaderHeight;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    rowInfos.forEach((info, rowIndex) => {
        const { row, height } = info;
        if (rowIndex % 2 === 1) {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(cardX, currentY, cardWidth, height);
        }

        let rowX = cardX + 30;
        ctx.textBaseline = 'top';
        const contentY = currentY + 15;

        if (type === 'combined') {
            ctx.fillStyle = '#94a3b8'; ctx.font = `600 14px ${fontFallbacks}`;
            ctx.fillText(row.sno || (rowIndex + 1), rowX, contentY); rowX += colWidths[0];
            ctx.fillStyle = '#64748b'; ctx.font = `400 13px ${fontFallbacks}`;
            ctx.fillText(row.type || '', rowX, contentY); rowX += colWidths[1];
            ctx.fillStyle = '#1e293b'; ctx.font = `700 15px ${fontFallbacks}`;
            info.wrappedDesc.forEach((line, i) => ctx.fillText(line, rowX, contentY + (i * 22))); rowX += colWidths[2];
            ctx.fillStyle = '#4f46e5'; ctx.font = `700 14px ${fontFallbacks}`;
            ctx.fillText(row.timeInterval || '', rowX, contentY); rowX += colWidths[3];
            ctx.fillStyle = '#334155'; ctx.font = `400 13px ${fontFallbacks}`;
            info.wrappedWeekdays.forEach((line, i) => ctx.fillText(line, rowX, contentY + (i * 22)));
        } else if (type === 'bhargava') {
            ctx.fillStyle = '#4f46e5'; ctx.font = `700 16px ${fontFallbacks}`;
            ctx.fillText(`${row.start1} - ${row.end1}`, rowX, contentY); rowX += colWidths[0];
            const isSpecial = row.isWednesdayColored, isAshubh = row.isColored;
            ctx.fillStyle = isSpecial ? '#f0fdf4' : (isAshubh ? '#fef2f2' : '#ffffff');
            ctx.beginPath(); ctx.roundRect(rowX, contentY - 5, 120, 30, 6); ctx.fill();
            ctx.fillStyle = isSpecial ? '#166534' : (isAshubh ? '#991b1b' : '#64748b');
            ctx.font = `800 12px ${fontFallbacks}`; ctx.textAlign = 'center';
            ctx.fillText((row.weekday || '').toUpperCase(), rowX + 60, contentY + 10);
            ctx.textAlign = 'left'; rowX += colWidths[1];
            ctx.fillStyle = '#4f46e5'; ctx.font = `700 16px ${fontFallbacks}`;
            ctx.fillText(`${row.start2} - ${row.end2}`, rowX, contentY); rowX += colWidths[2];
            ctx.fillStyle = '#94a3b8'; ctx.fillText(row.sNo, rowX, contentY);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.font = `800 16px ${fontFallbacks}`;
            ctx.fillText(row.muhurat || row.name || '', rowX, contentY); rowX += colWidths[0];
            ctx.fillStyle = '#6366f1'; ctx.font = `700 15px ${fontFallbacks}`;
            ctx.fillText(row.time || '', rowX, contentY); rowX += colWidths[1];
            const cat = (row.category || '').toLowerCase();
            const isGood = cat.includes('good') || cat.includes('rahita'), isRisk = cat.includes('risk');
            ctx.fillStyle = isGood ? '#dcfce7' : (isRisk ? '#fff7ed' : '#fee2e2');
            ctx.beginPath(); ctx.roundRect(rowX, contentY - 5, 100, 30, 20); ctx.fill();
            ctx.fillStyle = isGood ? '#166534' : (isRisk ? '#9a3412' : '#991b1b');
            ctx.font = `800 11px ${fontFallbacks}`; ctx.textAlign = 'center';
            ctx.fillText((row.category || '').toUpperCase(), rowX + 50, contentY + 10); ctx.textAlign = 'left';
        }
        ctx.beginPath(); ctx.moveTo(cardX, currentY + height); ctx.lineTo(cardX + cardWidth, currentY + height); ctx.stroke();
        currentY += height;
    });

    // Watermark
    const footerY = totalHeight - 40;
    ctx.fillStyle = '#cbd5e1'; ctx.font = `800 12px ${fontFallbacks}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText("GENERATED BY PANCHANGAM.AI • PROFESSIONAL ASTROLOGICAL INSIGHTS", width / 2, footerY);

    return canvas.toBuffer('png');
}

module.exports = { renderAstrologyTable };
