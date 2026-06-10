const fs = require('fs');
const path = require('path');

// Configuration
const COLOR_TOKENS_PATH = path.join(__dirname, 'Color-tokens.json');
const TYPOGRAPHY_TOKENS_PATH = path.join(__dirname, 'Typography-tokens.json');
const OUTPUT_CSS_PATH = path.join(__dirname, 'tokens.css');

// Fallback error palette (not defined in Color-tokens.json but referenced)
const fallbackPaletteError = {
  "0": "hsl(0, 0%, 0%)",
  "10": "hsl(3, 100%, 12%)",
  "20": "hsl(3, 100%, 16%)",
  "30": "hsl(3, 89%, 29%)",
  "40": "hsl(3, 71%, 41%)",
  "50": "hsl(3, 60%, 50%)",
  "60": "hsl(3, 75%, 60%)",
  "70": "hsl(3, 90%, 70%)",
  "80": "hsl(3, 100%, 81%)",
  "87": "hsl(3, 100%, 87%)",
  "90": "hsl(3, 100%, 93%)",
  "92": "hsl(3, 100%, 94%)",
  "94": "hsl(3, 100%, 95%)",
  "95": "hsl(3, 100%, 96%)",
  "96": "hsl(3, 100%, 97%)",
  "98": "hsl(3, 100%, 98%)",
  "99": "hsl(3, 100%, 99%)",
  "100": "hsl(0, 0%, 100%)"
};

// Fallback neutral palette tones (missing from Color-tokens.json but referenced in dark theme)
const fallbackPaletteNeutral = {
  "4": "hsl(9, 12%, 4%)",
  "6": "hsl(9, 12%, 6%)",
  "12": "hsl(9, 12%, 12%)",
  "17": "hsl(8, 10%, 17%)",
  "22": "hsl(8, 8%, 22%)",
  "24": "hsl(8, 8%, 24%)"
};

function main() {
  try {
    console.log('Reading token files...');
    const colorData = JSON.parse(fs.readFileSync(COLOR_TOKENS_PATH, 'utf8'));
    const typographyData = JSON.parse(fs.readFileSync(TYPOGRAPHY_TOKENS_PATH, 'utf8'));

    // Helper: camelCase to kebab-case
    const camelToKebab = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    // Helper: format style name
    const formatStyleName = (str) => str.trim().toLowerCase().replace(/\s+/g, '-');

    // Helper: resolve reference string (e.g. "{color.palette.primary.100}")
    const resolveColorValue = (valueStr) => {
      if (typeof valueStr !== 'string') return valueStr;
      if (valueStr.startsWith('{') && valueStr.endsWith('}')) {
        const tokenPath = valueStr.slice(1, -1).split('.');

        let current = colorData;
        for (let i = 0; i < tokenPath.length; i++) {
          const part = tokenPath[i];
          if (current && part in current) {
            current = current[part];
          } else {
            // Check fallback for missing error palette
            if (tokenPath[0] === 'color' && tokenPath[1] === 'palette') {
              if (tokenPath[2] === 'error') {
                const tone = tokenPath[3];
                if (fallbackPaletteError[tone]) {
                  return fallbackPaletteError[tone];
                }
              }
              // Check fallback for missing neutral palette tones
              if (tokenPath[2] === 'neutral') {
                const tone = tokenPath[3];
                if (fallbackPaletteNeutral[tone]) {
                  return fallbackPaletteNeutral[tone];
                }
              }
            }
            console.warn(`Warning: Could not resolve token path ${valueStr}`);
            return valueStr;
          }
        }

        // Resolve recursively if the resolved value is itself a reference
        if (typeof current === 'string' && current.startsWith('{') && current.endsWith('}')) {
          return resolveColorValue(current);
        }
        return current;
      }
      return valueStr;
    };

    const lines = [];
    lines.push('/* Design Tokens - Generated CSS Variables */\n');

    // 1. Process Typography Tokens
    lines.push('/* Typography Variables */');
    lines.push(':root {');

    // We use the "typography" property since it contains type information (dimensions, etc.)
    const typographySection = typographyData.typography;
    if (typographySection) {
      for (const [styleName, properties] of Object.entries(typographySection)) {
        const kebabStyleName = formatStyleName(styleName);
        lines.push(`  /* ${styleName} */`);

        for (const [propName, propObj] of Object.entries(properties)) {
          const kebabPropName = camelToKebab(propName);
          let value = propObj.value;

          if (propObj.type === 'dimension' && typeof value === 'number') {
            value = `${value}px`;
          } else if (propName === 'fontFamily') {
            value = `'${value}', sans-serif`;
          }

          lines.push(`  --font-${kebabStyleName}-${kebabPropName}: ${value};`);
        }
        lines.push('');
      }
    }
    lines.push('}\n');

    // 2. Process Color Roles
    const lightRoles = colorData.color.role.light;
    const darkRoles = colorData.color.role.dark;

    lines.push('/* Light Theme Color Roles */');
    lines.push(':root {');
    for (const [roleName, refValue] of Object.entries(lightRoles)) {
      const kebabRoleName = camelToKebab(roleName);
      const resolvedColor = resolveColorValue(refValue);
      lines.push(`  --color-${kebabRoleName}: ${resolvedColor};`);
    }
    lines.push('}\n');

    lines.push('/* Dark Theme Color Roles */');
    lines.push('@media (prefers-color-scheme: dark) {');
    lines.push('  :root {');
    for (const [roleName, refValue] of Object.entries(darkRoles)) {
      const kebabRoleName = camelToKebab(roleName);
      const resolvedColor = resolveColorValue(refValue);
      lines.push(`    --color-${kebabRoleName}: ${resolvedColor};`);
    }
    lines.push('  }');
    lines.push('}\n');

    lines.push('/* Class-based Dark Theme Selector */');
    lines.push('.dark, .dark-theme {');
    for (const [roleName, refValue] of Object.entries(darkRoles)) {
      const kebabRoleName = camelToKebab(roleName);
      const resolvedColor = resolveColorValue(refValue);
      lines.push(`  --color-${kebabRoleName}: ${resolvedColor};`);
    }
    lines.push('}\n');

    console.log(`Writing variables to ${OUTPUT_CSS_PATH}...`);
    fs.writeFileSync(OUTPUT_CSS_PATH, lines.join('\n'), 'utf8');
    console.log('CSS variables generation completed successfully!');
  } catch (error) {
    console.error('An error occurred during conversion:', error);
    process.exit(1);
  }
}

main();
