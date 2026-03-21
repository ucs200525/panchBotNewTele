const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

// Path for bundling fonts in serverless
const FONTCONFIG_DIR = path.join(__dirname, '../assets/fonts');
const BUNDLED_FONTS = {
    inter: path.join(FONTCONFIG_DIR, 'Inter-Regular.ttf'),
    telugu: path.join(FONTCONFIG_DIR, 'TenaliRamakrishna-Regular.ttf')
};

/**
 * Ensures required fonts are registered.
 */
function ensureFonts() {
    try {
        // Set FONTCONFIG_PATH so FontConfig finds our fonts.conf
        process.env.FONTCONFIG_PATH = FONTCONFIG_DIR;
        
        const cacheDir = '/tmp/fontconfig';
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        if (fs.existsSync(BUNDLED_FONTS.inter)) {
            registerFont(BUNDLED_FONTS.inter, { family: 'Inter' });
            console.log("Registered bundled Inter font for canvas (with FontConfig)");
        }
        if (fs.existsSync(BUNDLED_FONTS.telugu)) {
            registerFont(BUNDLED_FONTS.telugu, { family: 'Telugu' });
            console.log("Registered bundled Telugu font for canvas");
        }
    } catch (error) {
        console.error("Font registration failed for canvas:", error.message);
    }
}

const fontFallbacks = 'Inter, Telugu, sans-serif';
const headerFontFallbacks = 'Inter, sans-serif';

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

async function renderAstrologyTable(title, city, date, headers, rows, type = 'standard') {
    ensureFonts();
    
    const width = 1200;
    const padding = 60;
    const headerHeight = 100;
    const tableHeaderHeight = 60; 
    const baseRowHeight = 70;
    const cardWidth = width - (padding * 2);
    
    // Initial measurement
    const tempCanvas = createCanvas(width, 100);
    const mctx = tempCanvas.getContext('2d');
    
    let colWidths;
    if (type === 'combined') {
        colWidths = [50, 100, 200, 300, 400];
    } else if (type === 'bhargava') {
        colWidths = [300, 200, 300, 100];
    } else {
        colWidths = [350, 350, 300];
    }

    const rowInfos = rows.map(row => {
        let maxLines = 1;
        if (type === 'combined') {
            mctx.font = `bold 20px ${fontFallbacks}`;
            let wrappedWeekdays = [];
            if (row.weekdays && row.weekdays.length > 0) {
                row.weekdays.forEach(w => {
                    const text = `- ${w.weekday}${w.time !== '-' ? ` (${w.time})` : ''}`;
                    const lines = wrapText(mctx, text, colWidths[4] - 20);
                    wrappedWeekdays.push(...lines);
                });
            } else {
                wrappedWeekdays = ['-'];
            }

            mctx.font = `bold 20px ${fontFallbacks}`;
            const wrappedDesc = wrapText(mctx, row.description || '', colWidths[2] - 20);
            
            maxLines = Math.max(wrappedWeekdays.length, wrappedDesc.length, 1);
            return { row, height: Math.max(baseRowHeight, maxLines * 30 + 34), wrappedWeekdays, wrappedDesc };
        } else {
            return { row, height: baseRowHeight };
        }
    });

    const totalTableHeight = rowInfos.reduce((acc, info) => acc + info.height, 0);
    const totalHeight = headerHeight + tableHeaderHeight + totalTableHeight + (padding * 2) + 60;
    
    const scale = 2; // Retina scaling for crisp HD text rendering
    const canvas = createCanvas(width * scale, totalHeight * scale);
    const ctx = canvas.getContext('2d');
    
    // Scale everything by 2x
    ctx.scale(scale, scale);
    ctx.antialias = 'subpixel'; // High quality font anti-aliasing

    // Background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, totalHeight);

    // Main Card
    const cardX = padding, cardY = padding, cardHeight = totalHeight - (padding * 2);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    // node-canvas supports roundRect in 2.11+
    if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 24);
    else ctx.rect(cardX, cardY, cardWidth, cardHeight);
    ctx.fill();

    // Header Bar
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardWidth, headerHeight, [24, 24, 0, 0]);
    else ctx.fillRect(cardX, cardY, cardWidth, headerHeight);
    ctx.fill();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 32px ${headerFontFallbacks}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(title.toUpperCase(), cardX + 30, cardY + headerHeight/2);

    // Location Badge
    ctx.font = `bold 20px ${fontFallbacks}`;
    let displayDate = date;
    try { if (date.includes('-')) displayDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch(e) {}
    const locationText = `${city} | ${displayDate}`;
    const badgeTextWidth = ctx.measureText(locationText).width;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cardX + cardWidth - badgeTextWidth - 60, cardY + headerHeight/2 - 20, badgeTextWidth + 30, 40, 20);
    else ctx.rect(cardX + cardWidth - badgeTextWidth - 60, cardY + headerHeight/2 - 20, badgeTextWidth + 30, 40);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(locationText, cardX + cardWidth - badgeTextWidth - 45, cardY + headerHeight/2);

    // Table Header
    const tableHeaderY = cardY + headerHeight;
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(cardX, tableHeaderY, cardWidth, tableHeaderHeight);
    ctx.fillStyle = '#64748b'; ctx.font = `bold 18px ${fontFallbacks}`;
    let headX = cardX + 30;
    headers.forEach((h, i) => {
        ctx.fillText(h.toUpperCase(), headX, tableHeaderY + tableHeaderHeight/2);
        headX += colWidths[i] || 200;
    });

    // Rows
    let currentY = tableHeaderY + tableHeaderHeight;
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    rowInfos.forEach((info, rowIndex) => {
        const { row, height } = info;
        if (rowIndex % 2 === 1) { ctx.fillStyle = '#f8fafc'; ctx.fillRect(cardX, currentY, cardWidth, height); }
        let rowX = cardX + 30; ctx.textBaseline = 'top'; const contentY = currentY + 15;
        if (type === 'combined') {
            ctx.fillStyle = '#94a3b8'; ctx.font = `bold 20px ${fontFallbacks}`;
            ctx.fillText(row.sno || (rowIndex + 1), rowX, contentY); rowX += colWidths[0];
            ctx.fillStyle = '#64748b'; ctx.font = `bold 20px ${fontFallbacks}`;
            ctx.fillText(row.type || '', rowX, contentY); rowX += colWidths[1];
            ctx.fillStyle = '#1e293b'; ctx.font = `bold 20px ${fontFallbacks}`;
            info.wrappedDesc.forEach((line, i) => ctx.fillText(line, rowX, contentY + (i * 30))); rowX += colWidths[2];
            ctx.fillStyle = '#4f46e5'; ctx.font = `bold 20px ${fontFallbacks}`;
            ctx.fillText(row.timeInterval || '', rowX, contentY); rowX += colWidths[3];
            ctx.fillStyle = '#334155'; ctx.font = `bold 20px ${fontFallbacks}`;
            info.wrappedWeekdays.forEach((line, i) => ctx.fillText(line, rowX, contentY + (i * 30)));
        } else if (type === 'bhargava') {
            ctx.fillStyle = '#4f46e5'; ctx.font = `bold 20px ${fontFallbacks}`;
            ctx.fillText(`${row.start1} - ${row.end1}`, rowX, contentY); rowX += colWidths[0];
            const isSpecial = row.isWednesdayColored, isAshubh = row.isColored;
            ctx.fillStyle = isSpecial ? '#f0fdf4' : (isAshubh ? '#fef2f2' : '#ffffff');
            ctx.beginPath(); ctx.rect(rowX, contentY - 8, 140, 36); ctx.fill();
            ctx.fillStyle = isSpecial ? '#166534' : (isAshubh ? '#991b1b' : '#64748b');
            ctx.font = `bold 18px ${fontFallbacks}`; ctx.fillText((row.weekday || '').toUpperCase(), rowX + 15, contentY + 2); rowX += colWidths[1];
            ctx.fillStyle = '#4f46e5'; ctx.fillText(`${row.start2} - ${row.end2}`, rowX, contentY); rowX += colWidths[2];
            ctx.fillStyle = '#94a3b8'; ctx.fillText(row.sNo, rowX, contentY);
        } else {
            ctx.fillStyle = '#1e293b'; ctx.font = `bold 20px ${fontFallbacks}`;
            ctx.fillText(row.muhurat || row.name || '', rowX, contentY); rowX += colWidths[0];
            ctx.fillStyle = '#6366f1'; ctx.font = `bold 20px ${fontFallbacks}`;
            ctx.fillText(row.time || '', rowX, contentY); rowX += colWidths[1];
            const cat = (row.category || '').toLowerCase(), isGood = cat.includes('good') || cat.includes('rahita'), isRisk = cat.includes('risk');
            ctx.fillStyle = isGood ? '#dcfce7' : (isRisk ? '#fff7ed' : '#fee2e2');
            ctx.beginPath(); ctx.rect(rowX, contentY - 8, 120, 36); ctx.fill();
            ctx.fillStyle = isGood ? '#166534' : (isRisk ? '#9a3412' : '#991b1b');
            ctx.font = `bold 16px ${fontFallbacks}`; ctx.fillText((row.category || '').toUpperCase(), rowX + 15, contentY + 2);
        }
        ctx.beginPath(); ctx.moveTo(cardX, currentY + height); ctx.lineTo(cardX + cardWidth, currentY + height); ctx.stroke();
        currentY += height;
    });

    ctx.fillStyle = '#cbd5e1'; ctx.font = `bold 12px ${fontFallbacks}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText("GENERATED BY PANCHANGAM.AI • PROFESSIONAL ASTROLOGICAL INSIGHTS", width / 2, totalHeight - 40);

    return canvas.toBuffer('image/png');
}

module.exports = { renderAstrologyTable };
