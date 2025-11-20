# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[1.0.4]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.3.1...v1.0.4
[1.0.3.1]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.3...v1.0.3.1
[1.0.3]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/guiohm79/custom-gauge-card/releases/tag/v1.0.0
