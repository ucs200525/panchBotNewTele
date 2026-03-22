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
    const tableHeaderHeight = type === 'combined' ? 60 : 80; 
    const baseRowHeight = type === 'combined' ? 70 : (type === 'bhargava' ? 90 : 100);
    const cardWidth = width - (padding * 2);
    
    // Initial measurement
    const tempCanvas = createCanvas(width, 100);
    const mctx = tempCanvas.getContext('2d');
    
    let colWidths;
    if (type === 'combined') {
        colWidths = [50, 100, 200, 300, 430]; // Sum = 1080
    } else if (type === 'bhargava') {
        colWidths = [360, 200, 420, 100]; // Sum = 1080
    } else {
        colWidths = [600, 480]; // Two columns: Muhurat + Status, and Timing
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

    // Header Bar (Emerald Green as per reference)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardWidth, headerHeight, [24, 24, 0, 0]);
    else ctx.fillRect(cardX, cardY, cardWidth, headerHeight);
    ctx.fill();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 36px ${headerFontFallbacks}`;
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

    // Table Body Start
    let currentY = cardY + headerHeight;
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    rowInfos.forEach((info, rowIndex) => {
        const { row, height } = info;
        let rowX = cardX + 30; ctx.textBaseline = 'top';
        const contentY = currentY + (type === 'combined' ? 15 : (height - 35) / 2);
        ctx.lineWidth = 0.6; // Thickness for synthetic bolding

        // Dynamic Backgrounds for Drik (Standard)
        if (type === 'standard') {
            const cat = (row.category || '').toLowerCase();
            let bg = '#ffffff';
            if (cat.includes('good') || cat.includes('rahita')) bg = '#dbeafe';
            else if (cat.includes('danger') || cat.includes('mrityu')) bg = '#fed7aa';
            else if (cat.includes('risk') || cat.includes('agni') || cat.includes('vayu')) bg = '#e0f2fe';
            else if (cat.includes('bad') || cat.includes('raja') || cat.includes('roga')) bg = '#fee2e2';
            else if (cat.includes('evil') || cat.includes('chora')) bg = '#f1f5f9';
            ctx.fillStyle = bg; ctx.fillRect(cardX, currentY, cardWidth, height);
        } else if (rowIndex % 2 === 1) { 
            ctx.fillStyle = '#f8fafc'; ctx.fillRect(cardX, currentY, cardWidth, height); 
        }

        if (type === 'combined') {
            ctx.fillStyle = '#64748b'; ctx.font = `bold 20px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            ctx.fillText(row.sno || (rowIndex + 1), rowX, contentY); ctx.strokeText(row.sno || (rowIndex + 1), rowX, contentY); rowX += colWidths[0];
            ctx.fillStyle = '#334155'; ctx.font = `bold 20px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            ctx.fillText(row.type || '', rowX, contentY); ctx.strokeText(row.type || '', rowX, contentY); rowX += colWidths[1];
            ctx.fillStyle = '#0f172a'; ctx.font = `bold 20px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            info.wrappedDesc.forEach((line, i) => { ctx.fillText(line, rowX, contentY + (i * 30)); ctx.strokeText(line, rowX, contentY + (i * 30)); }); rowX += colWidths[2];
            ctx.fillStyle = '#3730a3'; ctx.font = `bold 20px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            ctx.fillText(row.timeInterval || '', rowX, contentY); ctx.strokeText(row.timeInterval || '', rowX, contentY); rowX += colWidths[3];
            ctx.fillStyle = '#1e293b'; ctx.font = `bold 20px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            info.wrappedWeekdays.forEach((line, i) => { ctx.fillText(line, rowX, contentY + (i * 30)); ctx.strokeText(line, rowX, contentY + (i * 30)); });
        } else if (type === 'bhargava') {
            ctx.fillStyle = '#334155'; ctx.font = `bold 26px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            ctx.fillText(`${row.start1} - ${row.end1}`, rowX, contentY); ctx.strokeText(`${row.start1} - ${row.end1}`, rowX, contentY); rowX += colWidths[0];
            
            const isSpecial = row.isWednesdayColored || row.isColored;
            if (isSpecial) {
                ctx.fillStyle = '#1e293b'; 
                ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(rowX - 10, currentY + 10, colWidths[1] + 10, height - 20, 8); else ctx.rect(rowX - 10, currentY + 10, colWidths[1] + 10, height - 20);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = '#475569';
            }
            ctx.strokeStyle = ctx.fillStyle; ctx.font = `bold 22px ${fontFallbacks}`; 
            ctx.fillText((row.weekday || '').toUpperCase(), rowX, contentY + 2); ctx.strokeText((row.weekday || '').toUpperCase(), rowX, contentY + 2); rowX += colWidths[1];
            
            ctx.fillStyle = '#334155'; ctx.font = `bold 26px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            ctx.fillText(`${row.start2} - ${row.end2}`, rowX, contentY); ctx.strokeText(`${row.start2} - ${row.end2}`, rowX, contentY); rowX += colWidths[2];
            ctx.fillStyle = '#64748b'; ctx.strokeStyle = ctx.fillStyle;
            ctx.fillText(row.sNo, rowX, contentY); ctx.strokeText(row.sNo, rowX, contentY);
        } else {
            // Drik (Standard) Style - Stacked Muhurat & Status
            const cat = (row.category || '').toUpperCase();
            let textCol = '#0f172a', tagBG = '#94a3b8';
            if (cat.includes('GOOD') || cat.includes('RAHITA')) { textCol = '#1e40af'; tagBG = '#3b82f6'; }
            else if (cat.includes('DANGER') || cat.includes('MRITYU')) { textCol = '#9a3412'; tagBG = '#f97316'; }
            else if (cat.includes('RISK') || cat.includes('AGNI')) { textCol = '#075985'; tagBG = '#0ea5e9'; }
            else if (cat.includes('BAD') || cat.includes('RAJA')) { textCol = '#991b1b'; tagBG = '#ef4444'; }
            else if (cat.includes('EVIL') || cat.includes('CHORA')) { textCol = '#1e293b'; tagBG = '#334155'; }

            ctx.fillStyle = textCol; ctx.font = `bold 30px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            ctx.fillText(row.muhurat || row.name || '', rowX, contentY - 15); 
            ctx.strokeText(row.muhurat || row.name || '', rowX, contentY - 15);
            
            // Badge for Status
            ctx.fillStyle = tagBG; ctx.beginPath();
            const badgeLabel = cat || 'INFO';
            const badgeW = ctx.measureText(badgeLabel).width + 20;
            if (ctx.roundRect) ctx.roundRect(rowX, contentY + 18, badgeW, 30, 15); else ctx.rect(rowX, contentY + 18, badgeW, 30);
            ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.font = `bold 16px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            ctx.fillText(badgeLabel, rowX + 10, contentY + 23); ctx.strokeText(badgeLabel, rowX + 10, contentY + 23);
            
            rowX += colWidths[0];
            
            ctx.fillStyle = '#334155'; ctx.font = `bold 28px ${fontFallbacks}`; ctx.strokeStyle = ctx.fillStyle;
            ctx.fillText(row.time || '', rowX, contentY); ctx.strokeText(row.time || '', rowX, contentY);
        }
        ctx.beginPath(); ctx.moveTo(cardX, currentY + height); ctx.lineTo(cardX + cardWidth, currentY + height); ctx.stroke();
        currentY += height;
    });

    ctx.fillStyle = '#cbd5e1'; ctx.font = `bold 12px ${fontFallbacks}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText("GENERATED BY PANCHANGAM.AI • PROFESSIONAL ASTROLOGICAL INSIGHTS", width / 2, totalHeight - 40);

    return canvas.toBuffer('image/png');
}

module.exports = { renderAstrologyTable };
