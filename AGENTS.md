# Dual Gauge Card - AI Agent Documentation

## Project Overview

This is a **Home Assistant Lovelace custom card** that displays two concentric circular LED gauges, allowing users to visualize two sensor measurements simultaneously. It's written in vanilla JavaScript as a standalone Web Component (no build step required).

**Key characteristics:**
- **Type**: Home Assistant Lovelace custom card (frontend plugin)
- **Language**: Vanilla JavaScript (ES6+), CSS
- **Build system**: None (standalone, non-compiled)
- **Distribution**: HACS (Home Assistant Community Store) compatible
- **Version**: 1.2.0 (defined in `CARD_VERSION` constant)
- **License**: MIT

## Project Structure

```
.
├── dual-gauge-card.js           # Main entry point - card core with dynamic editor loading (~46KB)
├── dual-gauge-card-editor.js    # Visual configuration editor (~59KB) - loaded on demand
├── hacs.json                    # HACS integration metadata
├── README.md                    # Comprehensive user documentation (French/English)
├── CHANGELOG.md                 # Version history following Keep a Changelog
├── LICENSE                      # MIT License
├── card.yaml                    # Example configuration (single gauge variant)
├── dual-gauge-example.yaml      # Example configurations for dual gauge
├── .gitignore                   # Git ignore rules
├── captures/                    # Screenshot images for documentation
│   ├── Exemple1.png ... Exemple6.png
└── .github/
    ├── FUNDING.yml              # Buy Me a Coffee link
    └── workflows/
        └── validate.yml         # HACS validation GitHub Action
```

**Note**: There is no `package.json`, `pyproject.toml`, or other package manager configuration. This is intentional - the card is distributed as standalone JavaScript files.

### File Organization

The project is now split into two main files:

1. **`dual-gauge-card.js`** - Contains:
   - Card logic and rendering
   - State management
   - Animation system
   - Theme engine
   - Dynamic editor loader

2. **`dual-gauge-card-editor.js`** - Contains:
   - Visual configuration UI
   - Form handlers
   - Dynamic list management (severity, markers, zones)
   - Entity pickers integration

This separation allows:
- **Faster initial load**: The editor (~59KB) is only loaded when the user clicks "Edit"
- **Better caching**: The card core can be cached separately from the editor
- **Easier maintenance**: Each file has a single responsibility

## Technology Stack

- **Core**: Vanilla JavaScript (ES6+ classes, Shadow DOM, Custom Elements)
- **Styling**: CSS with CSS Variables for theming
- **Platform**: Home Assistant (minimum version 2024.1.0)
- **Distribution**: HACS (Home Assistant Community Store)

## Architecture

### Main Components

#### `dual-gauge-card.js` (Card Core)

Organized into logical sections:

1. **Configuration and Themes** (lines 1-62)
   - `CARD_VERSION`: Current version string
   - `themes` object: Predefined themes (default, light, dark)
   - `getTheme()`: Theme resolver with custom theme support

2. **Utility Functions** (lines 64-218)
   - `easeInOutCubic()`: Animation easing function
   - `getLedColor()`: Color calculation based on severity thresholds
   - `optimizeLEDs()`: LED count optimizer
   - `calculateBidirectionalLeds()`: Bidirectional mode LED calculation
   - `valueToAngle()`: Value to angle conversion for markers/zones

3. **Styles** (lines 220-448)
   - `stylesCSS`: CSS template string with all component styles

4. **Renderer** (lines 450-656)
   - `generateLedsHTML()`: LED element generation
   - `renderDual()`: Main rendering function for dual gauge

5. **Markers and Zones** (lines 658-882)
   - `addMarkersAndZones()`: Adds visual markers and colored zones

6. **State Management** (lines 884-1072)
   - `updateLedsDual()`: LED state updater
   - `animateValueChangeDual()`: Smooth value transition animation
   - `updateCenterShadow()`: Center shadow effect updater
   - `updateOuterShadow()`: Outer shadow effect updater
   - `updateDualGauge()`: Main state update coordinator

7. **Config Parser** (lines 1074-1119)
   - `parseDualConfig()`: Configuration validation and defaults

8. **Dual Gauge Card Class** (lines 1121-1209)
   - `DualGaugeCard`: Main custom element class extending HTMLElement
   - `getConfigElement()`: Dynamic editor loader using `import()`

9. **Registration** (lines 1211-1221)
   - Custom element registration and console branding

#### `dual-gauge-card-editor.js` (Visual Editor)

Self-contained file with:

1. **DualGaugeCardEditor Class**
   - `setConfig()`: Configuration management with frozen object handling
   - `_render()`: UI generation with all form fields
   - `_renderCustomThemeSection()`: Custom color configuration
   - `_renderTitleTypographySection()`: Title styling options
   - `_renderTransparencySection()`: Transparency toggles
   - `_renderGaugeSection()`: Individual gauge configuration
   - `_attachListeners()`: Event handling for all inputs
   - `_handleListAction()`: Dynamic list management (add/remove)
   - `_updateConfig()`: Configuration serialization
   - `_fireConfigChanged()`: Event dispatch for Home Assistant

2. **Registration**
   - Custom element registration with debug logging

### Key Features

- **Dual concentric gauges**: Inner and outer circular LED gauges
- **Bidirectional mode**: Support for negative values (power import/export scenarios)
- **Themes**: default, light, dark, custom (per gauge and global)
- **Shadow system**: Independent center and outer shadows per gauge
- **Markers and zones**: Visual indicators for specific value ranges
- **Animations**: Smooth value transitions with configurable duration
- **Performance**: Power save mode, debounced updates, IntersectionObserver
- **Interactivity**: Click to open entity history
- **Visual Editor**: Full-featured configuration UI loaded on demand

### Dynamic Editor Loading

The card uses dynamic `import()` to load the editor only when needed:

```javascript
static async getConfigElement() {
  if (!customElements.get('dual-gauge-card-editor')) {
    const currentScript = document.querySelector('script[src*="dual-gauge-card"]');
    const basePath = currentScript ? currentScript.src.replace(/\/[^\/]*$/, '/') : '/';
    await import(`${basePath}dual-gauge-card-editor.js`);
  }
  return document.createElement('dual-gauge-card-editor');
}
```

This ensures:
- The editor is only loaded when the user clicks "Edit"
- The path is automatically detected from the script src
- Fallback error handling provides a message if loading fails

## Development Guidelines

### Code Style

- **Language**: English for code, French for comments (maintain consistency)
- **Quotes**: Single quotes for strings
- **Indentation**: 2 spaces
- **Naming**: camelCase for functions/variables, PascalCase for classes
- **Comments**: Section headers with `// ===` separators

### Making Changes

1. **Edit the appropriate file**:
   - Card logic/rendering → `dual-gauge-card.js`
   - Editor UI/forms → `dual-gauge-card-editor.js`

2. **Version bump**: Update `CARD_VERSION` constant in both files when releasing

3. **Update CHANGELOG.md**: Follow Keep a Changelog format

4. **Test locally**: Use Home Assistant development environment or browser dev tools

### Configuration Schema

The card accepts a YAML configuration with:

```yaml
type: custom:dual-gauge-card
name: "Card Title"
gauge_size: 200                    # Outer gauge size in pixels
inner_gauge_size: 130              # Inner gauge size
inner_gauge_radius: 65             # LED positioning radius for inner
title_position: bottom             # bottom, top, inside-top, inside-bottom, none
card_theme: default                # default, light, dark, custom
hide_card: false                   # Remove frame/background for transparent mode
power_save_mode: false             # Pause updates when not visible
debounce_updates: false            # Limit update frequency
update_interval: 1000              # Update interval in ms
hide_shadows: false                # Disable all shadows

gauges:
  - entity: sensor.inner           # Required: Home Assistant entity
    min: 0
    max: 100
    unit: '%'
    decimals: 1
    bidirectional: false           # Enable for negative values
    leds_count: 80
    led_size: 6
    theme: default
    hide_inactive_leds: false
    smooth_transitions: true
    animation_duration: 800
    center_shadow: false
    center_shadow_blur: 30
    center_shadow_spread: 15
    outer_shadow: false
    outer_shadow_blur: 30
    outer_shadow_spread: 15
    severity:
      - color: '#4caf50'
        value: 20
      - color: '#ff9800'
        value: 50
      - color: '#f44336'
        value: 75
    markers:
      - value: 25
        color: '#fff'
        label: 'Min'
    zones:
      - from: 0
        to: 25
        color: '#2196f3'
        opacity: 0.3

  - entity: sensor.outer           # Second gauge (outer ring)
    # ... same options as inner gauge
```

## Testing

There is no automated test suite. Testing is done manually:

1. **Local testing**: Copy both `dual-gauge-card.js` and `dual-gauge-card-editor.js` to `config/www/` in Home Assistant
2. **Add resource**: Configure `dual-gauge-card.js` as JavaScript Module in Home Assistant (only one resource needed!)
3. **Create test card**: Use YAML configuration in Lovelace dashboard
4. **Test editor**: Click the "Edit" button to verify the visual editor loads correctly
5. **Browser DevTools**: Use for debugging (Shadow DOM inspection)

### HACS Installation Testing

For HACS compatibility testing:
1. Ensure both files are in the repository root
2. Verify `hacs.json` points to `dual-gauge-card.js`
3. Check that the validation workflow passes

## Release Process

1. Update `CARD_VERSION` constant in `dual-gauge-card.js`
2. Update version in `dual-gauge-card-editor.js` header comment
3. Update `CHANGELOG.md` with new version details
4. Create GitHub release with version tag
5. HACS will automatically pick up new releases

## CI/CD

GitHub Actions workflow (`.github/workflows/validate.yml`):
- **Trigger**: Push, PR, daily schedule, manual dispatch
- **Action**: HACS validation for plugin category
- **Purpose**: Ensures HACS compatibility

## Important Notes for Agents

- **Two-file distribution**: The card now uses two files. Both must be included in releases.
- **No npm/build tools**: This is a standalone JavaScript project, do not add package.json or build steps
- **Backward compatibility**: Maintain compatibility with existing configurations
- **French comments**: Keep French comments when modifying code (project convention)
- **HACS metadata**: `hacs.json` must remain at root with correct `filename` pointing to `dual-gauge-card.js`
- **Dynamic loading**: The editor is loaded via dynamic `import()`. Ensure paths are correct.
- **Home Assistant API**: Uses `hass` object and `hass-more-info` events for integration
- **Shadow DOM**: All rendering happens in Shadow DOM for style isolation

## Troubleshooting

### Editor doesn't load
- Check browser console for import errors
- Verify `dual-gauge-card-editor.js` is in the same directory as `dual-gauge-card.js`
- Ensure both files are accessible via HTTP (not blocked by auth)

### Path resolution issues
The card tries to auto-detect the base path from the script element. If this fails, you can manually configure the resource path in Home Assistant.
