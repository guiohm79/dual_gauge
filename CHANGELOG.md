# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.7.0] - 2026-09-13

### Added
- ✨ **Order of the two values in the center**: `value_order` chooses which of the two
  numbers sits on top. `inner_first` (default) keeps the current layout, `outer_first`
  puts the outer gauge value above the inner one. Only the order of the two blocks
  changes; each value keeps its own id, typography and click-to-history behaviour.
- ✨ **Swapping the two gauges**: `swap_gauges: true` draws the first gauge of the list on
  the outer ring and the second one on the inner ring. The gauge moves whole — LEDs,
  markers, zones, shadows and its value follow it — so the two rings can be traded
  without rewriting the `gauges` list. The visual editor renames its two gauge panels
  accordingly, so a panel header always names the ring its gauge is drawn on.
  - Markers and zones travel with their gauge. A `markers_radius` is read as an offset from
    the ring the gauge was written against, so the swap carries it over to the other ring
  - What stays with the ring is the value typography defaults and `inner_gauge_radius`

### Fixed
- 🐛 **Markers stayed behind on the old ring when `swap_gauges` was turned on**: a gauge
  without `markers_radius` already followed its ring, but an explicit radius was used as an
  absolute distance, so the markers kept the radius of the ring they had been tuned for
  while their LEDs moved to the other one. The radius is now read as an offset from the ring
  the gauge was written against and shifted with it.
- 🐛 **New options could stay missing from the visual editor after an update**: the card
  loads `dual-gauge-card-editor.js` with a dynamic `import()` at a fixed URL. HACS versions
  the URL of the card itself, but nothing versioned the editor, so the browser kept serving
  the editor of the previously installed release — the card rendered the new options but the
  UI never offered them. The import is now stamped with the card version, so a new release
  always fetches its own editor.
- 🐛 The editor now prints its version in the console (`DUAL-GAUGE-CARD-EDITOR v1.7.0`)
  instead of a fixed "Editor loaded", so a stale copy is visible at a glance

## [1.6.0] - 2026-09-13

### Added
- ✨ **Rectangular LEDs (hi-fi VU meter style)**: `led_shape: rect` replaces the round LEDs
  of a gauge with rectangular segments. `led_length` sets their length along the radius
  (twice `led_size` by default) and `led_corner_radius` the rounding of their corners
  (`1` by default, `0` for sharp corners). Both options are per gauge, so the two rings can
  use different shapes, and both are available in the visual editor. Round LEDs are
  unchanged: the ring radius now comes from `led_length / 2 + led_size / 2`, which is
  exactly the previous margin when the two dimensions are equal.
- ✨ **Color gradients between the thresholds**: `severity_mode` chooses how the `severity`
  thresholds are turned into colors.
  - `steps` (default) keeps the current behaviour, one flat color per threshold
  - `gradient` blends the whole ring to a single color, interpolated in RGB between the two
    thresholds surrounding the current value
  - `gradient_arc` colors each LED after its own position on the scale, so the lit part of
    the ring shows the whole gradient
  A threshold color that cannot be read as numbers (`var(--theme-color)`) makes that gauge
  fall back to `steps` rather than guess. The mode is chosen from a "Color mode" select at
  the top of the severity panel of the visual editor, with a help text per mode.

## [1.5.3] - 2026-08-05

### Fixed
- 🐛 **A color chosen in the color picker was lost and the swatch went back to its previous
  color**: Home Assistant hands the editor a new `hass` object on every state change, several
  times per second on a live dashboard, and the editor was pushing the whole configuration
  back into its fields each time. The color picker of the browser is a modal that keeps its
  input focused and reports the color under the cursor while it is open, so every state
  update was overwriting the selection in progress. Typing the color in the text field was
  unaffected, which is why only the picker was failing.
  - State updates now only hand the fresh `hass` to the forms, they no longer rewrite the
    values being edited — which also removes a lot of useless work on every state change
  - The swatch is never realigned while the user is in it

## [1.5.2] - 2026-08-05

### Fixed
- 🐛 **A severity color could be ignored and the gauge stayed on the previous color**: the
  thresholds were read in the order of the list, so the first one whose value was reached
  answered, and a threshold placed after one of a higher value never applied. Adding a
  threshold from the editor produced exactly that, since a new threshold was created with
  the value 0 at the end of the list: the color picked never showed up and the gauge kept
  the color of the first threshold. Thresholds are now applied from the lowest value to the
  highest whatever their order in the configuration, which also fixes the configurations
  written by hand in YAML.
- 🐛 A threshold added from the visual editor now takes the top of the gauge range instead of
  the value 0, so the chosen color is visible right away

### Changed
- 📖 The severity help text in the editor and in the README now states that a threshold
  gives the color used up to its value, and that the highest one colors everything above it

## [1.5.1] - 2026-08-05

### Fixed
- 🐛 **Severity, markers and zones rows were unusable in the visual editor**: only the color
  swatch and the remove button showed up, the value, label, from, to and opacity fields were
  blank. These rows were the last place where the editor instantiated a `ha-textfield`
  itself, and that component is loaded on demand by Home Assistant, so it was not available
  yet when the rows were built. The rows are now rendered by `ha-form` like the rest of the
  editor, which takes care of loading its own selectors.
  - Clearing a field of a row now removes the key from the item
  - Row columns are narrower than the `ha-form` default so a row stays on a single line in
    the edit dialog

## [1.5.0] - 2026-08-03

### Changed
- 🏠 **Visual editor rebuilt on the Home Assistant form components**
  - The form is now generated by `ha-form` from a schema instead of raw HTML inputs, so it
    uses the native widgets and follows the active theme like the built-in card editors
  - Entities are picked with the Home Assistant entity picker (search, filtering, friendly
    names) instead of a dropdown listing every entity of the instance
  - Sections use `ha-expansion-panel`, and the options that only apply when something is
    enabled (shadow blur/spread, custom theme colors) now appear only when relevant
  - Field labels and help texts come from `computeLabel` / `computeHelper`
  - Severity, markers and zones rows are built with `ha-textfield` and `ha-icon-button`
  - The editor only writes the options that were actually changed: an empty field means
    "use the default" and is left out of the YAML, instead of writing every default back
  - Editing a row no longer rebuilds it, so the focus stays where you are typing

### Removed
- The editor no longer builds its markup by hand with `innerHTML`, so the manual HTML
  escaping added in 1.4.0 is gone with it

## [1.4.0] - 2026-08-03

### Added
- 📐 **Arc geometry per gauge** — configurable from the visual editor (new *Arc Geometry* section)
  - `start_angle` (degrees, default `0`): offsets the starting point of a gauge. `0` = top
    (12 o'clock), positive values rotate clockwise
  - `arc_length` (degrees, default `360`): angular span of a gauge. `360` = full circle,
    `270` = car-dashboard style, `180` = half circle. Values above 360 are clamped
  - Both options are independent for the inner and the outer gauge
  - LEDs, markers and zones all follow the arc, so they stay aligned with their gauge
  - On a partial arc, both ends carry a LED (`min` exactly at the start, `max` exactly at the end);
    on a full circle the LEDs keep their previous distribution
  - In bidirectional mode on a partial arc, the reference point is placed proportionally inside
    the arc so both sides stay visible (full-circle behaviour is unchanged)

### Fixed
- 🐛 Calling `setConfig()` twice on the same card (live preview in the editor) threw
  `NotSupportedError: Shadow root cannot be created on a host which already hosts one`
- 🐛 The card no longer throws when `hass` is set before `setConfig()`

### Changed
- ✅ **Home Assistant compliance of the visual editor**
  - `config-changed` and `hass-more-info` are now real `CustomEvent`s with a `detail` payload
    instead of a plain `Event` with a property attached to it
  - The editor now preserves configuration keys it does not manage (`view_layout`,
    `grid_options`, `visibility`, per-gauge `tap_action`, ...) instead of dropping them on
    every change
  - Clearing an optional field in the editor now removes the key from the YAML instead of
    leaving the previous value behind
  - All configuration values are HTML-escaped before being injected in the editor markup, so a
    quote in a card name, a font family or a marker label can no longer break the form

## [1.3.0] - 2026-03-20

### Major Changes
- 🔀 **Split Architecture**: Card and editor are now separate files
  - `dual-gauge-card.js` (~46KB) - Core card functionality with dynamic editor loading
  - `dual-gauge-card-editor.js` (~59KB) - Visual configuration editor loaded on demand
  - Faster initial load - editor only loads when user clicks "Edit"
  - Better caching and maintainability

### Added
- 🌐 **Editor fully translated to English**
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

[1.3.0]: https://github.com/guiohm79/custom-gauge-card/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/guiohm79/custom-gauge-card/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.3.1...v1.0.4
[1.0.3.1]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.3...v1.0.3.1
[1.0.3]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/guiohm79/custom-gauge-card/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/guiohm79/custom-gauge-card/releases/tag/v1.0.0
