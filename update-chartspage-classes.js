const fs = require('fs');

const filePath = 'd:\\4.own\\Projects\\panchBotNewTele\\panchBotTele\\frontend\\src\\pages\\ChartsPage.js';

let content = fs.readFileSync(filePath, 'utf8');

// Update imports
content = content.replace(
    "import './ChartsPage.css';",
    "import heroStyles from './hero-styles.module.css';\nimport styles from './ChartsPage.module.css';"
);

// Replace classNames
const replacements = [
    // Hero sections
    ['className="hero-section"', 'className={heroStyles.heroSection}'],
    ['className="hero-content"', 'className={heroStyles.heroContent}'],
    ['className="hero-title"', 'className={heroStyles.heroTitle}'],
    ['className="hero-subtitle"', 'className={heroStyles.heroSubtitle}'],
    ['className="hero-form"', 'className={heroStyles.heroForm}'],
    ['className="form-group-inline"', 'className={heroStyles.formGroupInline}'],
    ['className="input-wrapper"', 'className={heroStyles.inputWrapper}'],
    ['className="input-label"', 'className={heroStyles.inputLabel}'],
    ['className="date-input-hero"', 'className={heroStyles.dateInputHero}'],
    ['className="get-panchang-btn-hero"', 'className={heroStyles.getPanchangBtnHero}'],
    ['className="error-box-hero"', 'className={heroStyles.errorBoxHero}'],
    ['className="results-section"', 'className={heroStyles.resultsSection}'],

    // Charts specific
    ['className="charts-view"', 'className={styles.chartsView}'],
    ['className="chart-card"', 'className={styles.chartCard}'],
    ['className="profile-pills"', 'className={styles.profilePills}'],
    ['className="profile-pill"', 'className={styles.profilePill}'],
    ['className="pill-name"', 'className={styles.pillName}'],
    ['className="pill-meta"', 'className={styles.pillMeta}'],
    ['className="information"', 'className={styles.information}'],
    ['className="info"', 'className={styles.info}'],
    ['className="loading-spinner"', 'className={heroStyles.loadingSpinner}'],
    ['className="spinner"', 'className={heroStyles.spinner}'],
];

replacements.forEach(([search, replace]) => {
    content = content.split(search).join(replace);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ ChartsPage.js updated successfully');
