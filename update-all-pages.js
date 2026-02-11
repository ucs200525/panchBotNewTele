const fs = require('fs');
const path = require('path');

// List of pages to update with their CSS imports
const pages = [
    'DashaPage',
    'GoodTimingsPage',
    'HoraPage',
    'LagnaPage',
    'PanchakaMuhurth',
    'PlanetaryPage',
    'SadeSatiPage',
    'SwissPanchang'
];

const pagesDir = 'd:\\4.own\\Projects\\panchBotNewTele\\panchBotTele\\frontend\\src\\pages';

// Generic hero-based replacements (for pages that use hero-styles.css)
const heroReplacements = [
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
];

// Generic page-specific imports
const pageReplacements = [
    ['className="page-container"', 'className={styles.pageContainer}'],
    ['className="page-content"', 'className={styles.pageContent}'],
    ['className="data-grid"', 'className={styles.dataGrid}'],
    ['className="data-card"', 'className={styles.dataCard}'],
    ['className="table-wrapper"', 'className={styles.tableWrapper}'],
];

pages.forEach(pageName => {
    const filePath = path.join(pagesDir, `${pageName}.js`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${pageName}.js not found, skipping...`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasHeroStyles = false;
    let hasOwnStyles = false;

    // Check which stylesheets are imported
    if (content.includes("import './hero-styles.css'") || content.includes('import "./hero-styles.css"')) {
        hasHeroStyles = true;
    }

    // Check for page-specific CSS (try different naming conventions)
    const possibleCssImports = [
        `import './${pageName}.css'`,
        `import "./${pageName}.css"`,
    ];

    possibleCssImports.forEach(cssImport => {
        if (content.includes(cssImport)) {
            hasOwnStyles = true;
        }
    });

    // Build new imports
    let newImports = '';
    if (hasHeroStyles) {
        newImports += "import heroStyles from './hero-styles.module.css';\n";
    }
    if (hasOwnStyles) {
        newImports += `import styles from './${pageName}.module.css';`;
    }

    // Replace old imports with new ones
    if (hasHeroStyles) {
        content = content.replace(/import ['"]\.\/hero-styles\.css['"];?/g, '');
    }
    if (hasOwnStyles) {
        content = content.replace(new RegExp(`import ['"]\./${pageName}\.css['"];?`, 'g'), '');
    }

    // Add new imports right after react imports
    if (newImports) {
        // Find a good place to insert imports (after React import)
        const reactImportMatch = content.match(/(import React[^;]+;)/);
        if (reactImportMatch) {
            const insertPoint = content.indexOf(reactImportMatch[0]) + reactImportMatch[0].length;
            content = content.slice(0, insertPoint) + '\n' + newImports + content.slice(insertPoint);
        }
    }

    // Apply hero replacements if needed
    if (hasHeroStyles) {
        heroReplacements.forEach(([search, replace]) => {
            content = content.split(search).join(replace);
        });
    }

    // Apply page-specific replacements
    if (hasOwnStyles) {
        pageReplacements.forEach(([search, replace]) => {
            content = content.split(search).join(replace);
        });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${pageName}.js updated successfully`);
});

console.log('\n🎉 All pages updated!');
