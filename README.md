# Erbschaftssteuer-Rechner v7

Production-ready German inheritance tax calculator widget for Braun Legal.

## Features

- 4-step wizard: Grunddaten → Vermögen → Abzüge & Besonderheiten → Ergebnis
- Complete tax calculation per §§ 10, 13, 16, 17, 19 ErbStG
- Responsive design with Braun-Legal branding
- German number formatting support (250.000 or 250000)
- Keyboard accessible
- Analytics-ready (configurable in config.js)

## Project Structure

```
erbcalc_v7/
├── index.html          # Main HTML with wizard structure
├── styles.css          # Responsive styles with Braun-Legal branding
├── app.js              # Application logic and tax calculations
├── config.js           # Tax tables and configuration
├── assets/
│   └── info-icon.svg   # Tooltip icon
└── README.md           # This file
```

## Local Testing

1. Open `index.html` in a modern web browser
2. Or use a local server:
   ```bash
   python3 -m http.server 8000
   # Navigate to http://localhost:8000
   ```

## Deployment to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd ~/Desktop/erbcalc_v7
   vercel --prod
   ```

3. Follow prompts to connect to your Vercel account

## iFrame Integration

Embed in Framer or any website:

```html
<iframe src="https://{YOUR-VERCEL-URL}/index.html"
        width="100%"
        style="border:0; border-radius:16px; min-height:900px"
        loading="lazy"></iframe>
```

## Smoke Tests

Open browser console and run:

```javascript
window.runSmokeTests()
```

Expected results:
- Ehegatte, 1,000,000 € → ≈ 55,000 € tax
- Kind (12 J.), 500,000 € → ≈ 7,000 € tax
- Nicht verwandt, 100,000 € → ≈ 24,000 € tax

## Configuration

### Analytics
Enable/disable in `config.js`:
```javascript
ANALYTICS_ENABLED: true // or false
```

### Tax Tables
All tax rates, allowances, and exemptions are defined in `config.js` according to current German tax law.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Technical Details

- Pure HTML/CSS/JS (no build tools)
- ES6+ JavaScript
- CSS Grid/Flexbox for layout
- Google Fonts (Poppins)
- Lighthouse mobile score target: ≥90

## Validation Rules

### Step 1 (Grunddaten)
- Relationship: required
- Child age: required if relationship = "Kind", must be 0-27

### Step 2 (Vermögen)
- All fields optional, default to 0
- Accept German number formats

### Step 3 (Abzüge)
- All fields optional
- Gift year must be within last 10 years if amount provided

### Step 4 (Besonderheiten)
- All checkboxes optional

## Maintenance

Tax rates and allowances may need annual updates. Modify values in `config.js` according to new ErbStG regulations.
