# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🎨 **Visual Configuration Editor**
  - Complete visual editor for all card configuration options
  - `ha-entity-picker` integration for easy entity selection from Home Assistant
  - Two dedicated sections for inner and outer gauge configuration
  - Support for all gauge options: entity, min/max, units, decimals, LEDs count/size
  - Theme selection (default, light, dark, custom) per gauge and globally
  - Interactive severity thresholds editor with color picker
  - Markers and zones configuration with visual management
  - Shadow effects configuration (center and outer shadows)
  - Animation settings (duration, smooth transitions)
  - Performance options (power save, debounce updates)
  - Real-time configuration updates with `config-changed` events
  - Clean, responsive UI with dark theme support for Home Assistant

### Fixed
- 🐛 **Visual Editor bug fixes**
  - Fixed "Cannot add property gauges, object is not extensible" error - config is now cloned before modification
  - Fixed "No type provided" error by adding `type: 'custom:dual-gauge-card'` to all config outputs
  - Fixed entity picker value retrieval for `ha-entity-picker` component
  - Fixed entity disappearing after selection - picker now correctly preserves selected entity
  - Implemented smart re-render logic to avoid destroying pickers on simple value changes
  - Added `_shouldReRender()` method to detect structural changes vs value changes
  - Added `_updatePickerValues()` method to update picker values without full re-render
  - Fixed state loss when adding/removing severity thresholds, markers, or zones
  - Improved CSS styling for dark theme compatibility
  - Added `_saveCurrentState()` method to preserve input values during list modifications

### Added
- 🎨 **Complete Visual Editor with all parameters**
  - Added **Custom Theme** section with color pickers for:
    - `custom_background` - Card background color
    - `custom_gauge_background` - Gauge background color  
    - `custom_center_background` - Center background color
    - `custom_text_color` - Primary text color
    - `custom_secondary_text_color` - Secondary text color
  - Added **Title Typography** section:
    - `title_font_size` - Title font size
    - `title_font_family` - Title font family
    - `title_font_weight` - Title font weight (dropdown)
    - `title_font_color` - Title font color
    - `card_background` - Custom card background CSS
  - Added **Transparency Options** section:
    - `transparent_card_background` - Make card background transparent
    - `transparent_gauge_background` - Make gauge background transparent
    - `transparent_center_background` - Make center background transparent
  - Added **Value & Unit Typography** per gauge:
    - `value_font_family`, `value_font_size`, `value_font_weight`, `value_font_color`
    - `unit_font_family`, `unit_font_size`, `unit_font_weight`, `unit_font_color`

### Fixed
- 🐛 **Card registration**
  - Added `window.customCards` declaration for Home Assistant card picker
  - Card now appears in the "Add Card" list with name and description

### Added
- ⚡ **Bidirectional mode for negative values**
  - New `bidirectional` option for each gauge configuration
  - Visual clarity for negative/positive values: positive displays clockwise, negative counter-clockwise
  - Adaptive zero point: automatically uses zero as reference if range crosses zero, otherwise uses midpoint
  - Proportional LED allocation for asymmetric ranges (e.g., -1000 to 5000)
  - Perfect for power flow (import/export), battery charge/discharge, temperature differences
  - Support in markers and zones rendering for bidirectional mode
  - New utility functions: `calculateBidirectionalLeds()` and `valueToAngle()`
  - Fully backward compatible (default: `false`)

## [1.2.0] - 2026-03-17

### Added
- 🎨 Visual Configuration Editor (see Unreleased for details)

## [1.1.0] - 2024-11-16

### Added
- 🎯 **New card: `dual-gauge-card`**
  - Two concentric circular gauges sharing the same center point
  - Perfect for displaying complementary data (temperature/humidity, power/voltage, etc.)
  - Each gauge is fully configurable independently
  - Support for all `custom-gauge-card` options for each gauge
  - Independent animations for each circle
  - Customizable sizes (inner and outer circles)
  - Central display shows both values stacked vertically

### Changed
- Refactored `renderer.js` to make gauge rendering logic reusable
- Added utility functions for LED rendering: `generateLedsHTML()`
- Extended `state.js` with dual gauge management functions:
  - `updateDualGauge()`: Update both gauges
  - `updateLedsDual()`: Update LEDs for a specific gauge
  - `animateValueChangeDual()`: Animate a specific gauge
- Bundle size increased from 17KB to 24KB (+7KB for dual-gauge-card)

### Documentation
- Added `DUAL-GAUGE-README.md` with complete documentation
- Added `dual-gauge-example.yaml` with configuration examples
- Added `test-dual-gauge.html` for local testing
- Both cards (`custom-gauge-card` and `dual-gauge-card`) are in the same bundle

### Technical
- CSS adapted to support dual gauge specific styles
- Support for `inner` and `outer` prefixes for LED IDs
- Both custom elements registered in the same bundle
- Compatible with existing `custom-gauge-card` installations

## [1.0.4] - 2025-10-29

### Added
- Example screenshots in README files (Exemple1.png, Exemple2.png)
- Enhanced documentation with visual examples
- CHANGELOG.md file for version history tracking

### Changed
- Updated README.md with expanded configuration examples
- Updated README.fr.md with improved French documentation
- Improved code structure and optimization in custom-gauge-card.js

## [1.0.3.1] - 2025-10-29

### Changed
- Updated README.fr.md with comprehensive French documentation
- Enhanced info.md with better installation guidance
- Improved README.md with minor corrections

### Removed
- Removed old Capture1.png screenshot

## [1.0.3] - 2025-10-29

### Changed
- Code refactoring and optimization in custom-gauge-card.js
- Improved performance and reduced complexity

## [1.0.2] - 2025-10-28

### Fixed
- Minor bug fixes in custom-gauge-card.js
- Code quality improvements

## [1.0.1] - 2025-10-28

### Added
- French documentation (README.fr.md)
- Multi-button control feature with up to 4 customizable buttons
- Support for multiple entity types (switch, light, scene, script, automation, etc.)
- Custom icon support for buttons with emoji and text options
- Button icon size customization (global and per-button)
- Title font customization options (family, size, weight, color)

### Changed
- Extensive README.md updates with new features and examples
- Enhanced card.yaml with button configuration examples
- Major improvements to custom-gauge-card.js with new features

## [1.0.0] - 2025-10-28

### Added
- Initial release of Custom Gauge Card
- Circular LED gauge display for Home Assistant sensors
- Animated transitions with smooth value changes
- Multiple theme support (default, light, dark, custom)
- Zones and markers configuration
- Trend indicator (24-hour evolution)
- Shadow and lighting effects
- Performance optimizations (power save mode, debounce updates)
- Interactive control support
- ARIA attributes for accessibility
- HACS integration support

### Documentation
- Initial README.md with comprehensive documentation
- Initial README.fr.md with French translation
- Example configuration in card.yaml
- Screenshot (Capture1.png)

[1.2.0]: https://github.com/guiohm79/custom-gauge-card/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.3.1...v1.0.4
[1.0.3.1]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.3...v1.0.3.1
[1.0.3]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/guiohm79/custom-gauge-card/releases/tag/v1.0.0
