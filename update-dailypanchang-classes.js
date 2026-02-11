const fs = require('fs');
const path = require('path');

const filePath = 'd:\\4.own\\Projects\\panchBotNewTele\\panchBotTele\\frontend\\src\\pages\\DailyPanchang.js';

let content = fs.readFileSync(filePath, 'utf8');

// Replace all className instances for DailyPanchang
const replacements = [
    // Info cards
    ['className="info-card moon-card"', 'className={`${styles.infoCard} moon-card`}'],
    ['className="info-card vara-card"', 'className={`${styles.infoCard} vara-card`}'],
    ['className="info-card phase-card"', 'className={`${styles.infoCard} phase-card`}'],
    ['className="card-content"', 'className={styles.cardContent}'],
    ['className="card-value"', 'className={styles.cardValue}'],
    ['className="card-subtext"', 'className={styles.cardSubtext}'],
    ['className="card-label"', 'className={styles.cardLabel}'],

    // Sections
    ['className="panchang-section calendar-section"', 'className={styles.panchangSection}'],
    ['className="panchang-section core-section"', 'className={styles.panchangSection}'],
    ['className="panchang-section auspicious-section"', 'className={styles.panchangSection}'],
    ['className="panchang-section rahita-section"', 'className={styles.panchangSection}'],
    ['className="panchang-section inauspicious-section"', 'className={styles.panchangSection}'],
    ['className="panchang-section choghadiya-section"', 'className={styles.panchangSection}'],
    ['className="panchang-section lagna-section"', 'className={styles.panchangSection}'],
    ['className="panchang-section transitions-section"', 'className={styles.panchangSection}'],
    ['className="section-header"', 'className={styles.sectionHeader}'],
    ['className="section-subtitle"', 'className={styles.sectionSubtitle}'],
    ['className="header-icon"', 'className={styles.headerIcon}'],

    // Grid layouts
    ['className="info-card-grid three-col"', 'className={`${styles.infoCardGrid} ${styles.threeCol}`}'],
    ['className="info-card compact"', 'className={`${styles.infoCard} ${styles.compact}`}'],
    ['className="elements-grid"', 'className={styles.elementsGrid}'],
    ['className="timings-grid"', 'className={styles.timingsGrid}'],
    ['className="lagna-grid"', 'className={styles.lagnaGrid}'],
    ['className="rahita-grid"', 'className={styles.rahitaGrid}'],
    ['className="choghadiya-grid"', 'className={styles.choghadiyaGrid}'],
    ['className="transitions-list"', 'className={styles.transitionsList}'],

    // Element cards
    ['className="element-card tithi-card"', 'className={styles.elementCard}'],
    ['className="element-card nakshatra-card"', 'className={styles.elementCard}'],
    ['className="element-card yoga-card"', 'className={styles.elementCard}'],
    ['className="element-card karana-card"', 'className={styles.elementCard}'],
    ['className="element-name"', 'className={styles.elementName}'],
    ['className="element-value"', 'className={styles.elementValue}'],
    ['className="element-detail"', 'className={styles.elementDetail}'],
    ['className="element-icon"', 'className={styles.elementIcon}'],

    // Timing cards
    ['className="timing-card shubh"', 'className={`${styles.timingCard} shubh`}'],
    ['className="timing-card ashubh"', 'className={`${styles.timingCard} ashubh`}'],
    ['className="timing-name"', 'className={styles.timingName}'],
    ['className="timing-time"', 'className={styles.timingTime}'],
    ['className="timing-desc"', 'className={styles.timingDesc}'],

    // Lagna cards
    ['className="lagna-card"', 'className={styles.lagnaCard}'],
    ['className="lagna-symbol"', 'className={styles.lagnaSymbol}'],
    ['className="lagna-name"', 'className={styles.lagnaName}'],
    ['className="lagna-number"', 'className={styles.lagnaNumber}'],
    ['className="lagna-time"', 'className={styles.lagnaTime}'],

    // Rahita cards
    ['className="rahita-card"', 'className={styles.rahitaCard}'],
    ['className="rahita-number"', 'className={styles.rahitaNumber}'],
    ['className="rahita-time"', 'className={styles.rahitaTime}'],
    ['className="separator"', 'className={styles.separator}'],
    ['className="rahita-duration"', 'className={styles.rahitaDuration}'],

    // Choghadiya
    [/className="chog-card \${chog\.type\.toLowerCase\(\)}"/, 'className={`${styles.chogCard} ${chog.type.toLowerCase()}`}'],
    ['className="chog-badge"', 'className={styles.chogBadge}'],
    ['className="chog-name"', 'className={styles.chogName}'],
    ['className="chog-time"', 'className={styles.chogTime}'],

    // Transitions
    ['className="transition-item"', 'className={styles.transitionItem}'],
    ['className="trans-name"', 'className={styles.transName}'],
    ['className="trans-times"', 'className={styles.transTimes}'],
    ['className="trans-arrow"', 'className={styles.transArrow}'],
    ['className="trans-paksha"', 'className={styles.transPaksha}'],
];

// Apply all replacements
replacements.forEach(([search, replace]) => {
    if (search instanceof RegExp) {
        content = content.replace(search, replace);
    } else {
        content = content.split(search).join(replace);
    }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ DailyPanchang.js updated successfully');
