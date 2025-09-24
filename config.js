// ABOUTME: Tax configuration constants for German inheritance tax calculator
// ABOUTME: Contains tax classes, allowances, and tax rate tables per ErbStG

const TAX_CONFIG = {
    // Analytics toggle
    ANALYTICS_ENABLED: false,
    
    // Steuerklassen (tax classes)
    TAX_CLASSES: {
        I: 'I',
        II: 'II',
        III: 'III'
    },
    
    // Verwandtschaftsverhältnisse zu Steuerklassen mapping
    RELATIONSHIP_TO_TAX_CLASS: {
        'ehegatte': 'I',
        'kind': 'I',
        'enkel': 'I',
        'eltern': 'I',
        'grosseltern': 'I',
        'geschwister': 'II',
        'nichten_neffen': 'II',
        'schwiegerkinder': 'II',
        'geschiedener_ehegatte': 'II',
        'sonstige': 'III',
        'nicht_verwandt': 'III'
    },
    
    // § 16 ErbStG - Persönliche Freibeträge
    PERSONAL_ALLOWANCES: {
        'ehegatte': 500000,
        'kind': 400000,
        'enkel': 200000, // wenn Eltern noch leben
        'enkel_eltern_tot': 400000, // wenn Eltern nicht mehr leben
        'eltern': 100000,
        'grosseltern': 100000,
        'geschwister': 20000,
        'nichten_neffen': 20000,
        'schwiegerkinder': 20000,
        'geschiedener_ehegatte': 20000,
        'sonstige': 20000,
        'nicht_verwandt': 20000
    },
    
    // § 17 ErbStG - Versorgungsfreibeträge (nur für Ehegatte und Kinder)
    MAINTENANCE_ALLOWANCES: {
        'ehegatte': 256000,
        'kind': {
            0: 52000,   // 0-5 Jahre
            6: 41000,   // 6-10 Jahre
            11: 30700,  // 11-15 Jahre
            16: 20500,  // 16-20 Jahre
            21: 10300   // 21-27 Jahre
        }
    },
    
    // § 13 ErbStG - Sachliche Steuerbefreiungen (Hausrat und bewegliche Gegenstände)
    HOUSEHOLD_ALLOWANCES: {
        'I': {
            hausrat: 41000,
            sonstige: 12000
        },
        'II': {
            total: 12000 // Hausrat und sonstige zusammen
        },
        'III': {
            total: 12000 // Hausrat und sonstige zusammen
        }
    },
    
    // Pauschale für Erbfallkosten
    INHERITANCE_COST_ALLOWANCE: 15000,
    
    // § 19 ErbStG - Steuertarif
    TAX_RATES: {
        'I': [
            { threshold: 75000, rate: 7 },
            { threshold: 300000, rate: 11 },
            { threshold: 600000, rate: 15 },
            { threshold: 6000000, rate: 19 },
            { threshold: 13000000, rate: 23 },
            { threshold: 26000000, rate: 27 },
            { threshold: Infinity, rate: 30 }
        ],
        'II': [
            { threshold: 75000, rate: 15 },
            { threshold: 300000, rate: 20 },
            { threshold: 600000, rate: 25 },
            { threshold: 6000000, rate: 30 },
            { threshold: 13000000, rate: 35 },
            { threshold: 26000000, rate: 40 },
            { threshold: Infinity, rate: 43 }
        ],
        'III': [
            { threshold: 75000, rate: 30 },
            { threshold: 300000, rate: 30 },
            { threshold: 600000, rate: 30 },
            { threshold: 6000000, rate: 30 },
            { threshold: 13000000, rate: 50 },
            { threshold: 26000000, rate: 50 },
            { threshold: Infinity, rate: 50 }
        ]
    },
    
    // Befreiungen
    EXEMPTIONS: {
        PFLEGE_FREIBETRAG: 20000, // Pflegefreibetrag
        BEHINDERTEN_PAUSCHBETRAG: 'variable', // depends on degree of disability
        FAMILIENHEIM_SELF_USE: true, // 10 Jahre selbst bewohnt
        BETRIEBSVERMOEGEN_CONTINUATION: 0.85 // 85% Verschonung bei Fortführung
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TAX_CONFIG;
}
