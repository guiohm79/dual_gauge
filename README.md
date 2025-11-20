# Dual Gauge Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub Release](https://img.shields.io/github/release/guiohm79/dual-gauge-card.svg)](https://github.com/guiohm79/dual-gauge-card/releases)
[![License](https://img.shields.io/github/license/guiohm79/dual-gauge-card.svg)](LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=flat-square&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/guiohm79)

A custom card for Home Assistant that displays two concentric circular LED gauges, allowing you to visualize two measurements simultaneously.

Perfect for comparing indoor/outdoor temperatures, displaying temperature and humidity together, or any two related sensor values side by side.



## Screenshots



<p align="center">
  <img src="https://github.com/guiohm79/dual_gauge/blob/f65e543b4c0d699495eec711c0f07e40ddfc020d/captures/Exemple4.png" width="350" alt="Exemple 1">
  <img src="https://github.com/guiohm79/dual_gauge/blob/f65e543b4c0d699495eec711c0f07e40ddfc020d/captures/Exemple2.png" width="350" alt="Exemple 2">
</p>

<p align="center">
  <img src="https://github.com/guiohm79/dual_gauge/blob/f65e543b4c0d699495eec711c0f07e40ddfc020d/captures/Exemple3.png" width="350" alt="Exemple 3">
  <img src="https://github.com/guiohm79/dual_gauge/blob/8fbeb73ef1dc2ddf3e2cdd153f3e97d19f49a983/captures/Exemple4.png" width="350" alt="Exemple 4">
</p>

<p align="center">
  <img src="https://github.com/guiohm79/dual_gauge/blob/f65e543b4c0d699495eec711c0f07e40ddfc020d/captures/Exemple1.png" width="350" alt="Exemple 5">
  <img src="https://github.com/guiohm79/dual_gauge/blob/0d5210e32166785ad6fbccaa8a29810b425673d1/captures/Exemple6.png" width="350" alt="Exemple 6">
</p>



## Features

**Dual Concentric Gauges**
- Two independent circular gauges (inner and outer)
- Separate configuration for each gauge
- Configurable primary value display (choose which value shows large)
- Adjustable gauge spacing
- bidirectional for negative values

**Advanced Shadow System**
- Independent shadow controls for each gauge
- Center shadows for depth effect
- Border shadows for gauge highlighting
- Dynamic shadow colors based on sensor values

**Zones and Markers**
- Define colored zones to visualize value ranges
- Add markers with labels for specific reference points
- Flexible positioning with adjustable radius
- Separate configuration for each gauge

**Customizable Themes**
- Global card themes (default, light, dark, custom)
- Individual themes for each gauge
- Custom colors and gradients
- Transparent card option for seamless integration

**Flexible Layout**
- Configurable title position (top, bottom, inside-top, inside-bottom, none)
- Transparent card mode (no frame/background)
- Adjustable gauge spacing
- Responsive design

**Optimized Performance**
- Power save mode (pauses when invisible)
- Update debouncing
- Optimized animations
- Smooth value transitions

## Installation

### Via HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click on the menu (⋮) in the top right
4. Select "Custom repositories"
5. Add the URL: `https://github.com/guiohm79/dual-gauge-card`
6. Select category "Lovelace"
7. Click "Install"
8. Restart Home Assistant

### Manual Installation

1. Download the `dual-gauge-card.js` file
2. Copy it to `config/www/dual-gauge-card.js`
3. Add the resource in Home Assistant:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **+ Add Resource**
   - URL: `/local/dual-gauge-card.js`
   - Type: **JavaScript Module**
4. Restart Home Assistant

## Configuration

### Basic Structure

```yaml
type: custom:dual-gauge-card
name: "My Dual Gauge"
gauge_size: 200              # Outer gauge size
inner_gauge_size: 130        # Inner gauge visual size (optional, default 65% of gauge_size)
primary_gauge: inner         # 'inner' or 'outer' - determines which value displays large

gauges:
  - entity: sensor.temperature_inside
    min: 0
    max: 40
    # ... gauge 1 config (inner)

  - entity: sensor.temperature_outside
    min: -10
    max: 50
    # ... gauge 2 config (outer)
```

### Global Card Options

| Option | Type | Default | Description |
|--------|------|--------|-------------|
| `name` | string | - | Title displayed |
| `title_position` | string | 'bottom' | Title position ('bottom', 'top', 'inside-top', 'inside-bottom', 'none') |
| `hide_card` | boolean | false | Remove card frame, background and shadow (transparent integration) |
| `gauge_size` | number | 200 | Outer gauge size in pixels |
| `inner_gauge_size` | number | 65% | Inner gauge visual size in pixels |
| `inner_gauge_radius` | number | inner_gauge_size/2 | Inner LEDs positioning radius (to adjust gauge spacing) |
| `primary_gauge` | string | 'inner' | Primary gauge ('inner' or 'outer') - large value display |
| `card_theme` | string | - | Global card theme ('default', 'light', 'dark', 'custom') |
| `card_background` | string | - | Custom card background color |
| `hide_shadows` | boolean | false | Hide all shadows |
| `power_save_mode` | boolean | false | Enable power save mode |
| `debounce_updates` | boolean | false | Limit update frequency |
| `update_interval` | number | 1000 | Update interval in ms |

### Global Theme Options

```yaml
card_theme: custom
custom_background: '#1a1a1a'
custom_gauge_background: 'radial-gradient(circle, #333, #111)'
custom_center_background: 'radial-gradient(circle, #444, #222)'
custom_text_color: '#ffffff'
custom_secondary_text_color: '#cccccc'
```

### Individual Gauge Configuration

Each element in the `gauges` array supports these options:

#### Basic Options

| Option | Type | Default | Description |
|--------|------|--------|-------------|
| `entity` | string | **required** | Home Assistant entity to display |
| `min` | number | 0 | Minimum value |
| `max` | number | 100 | Maximum value |
| `unit` | string | - | Unit to display (e.g., '°C', '%', 'W') |
| `decimals` | number | 1 | Number of decimal places |
| `bidirectional` | boolean | false | Enable bidirectional mode for negative values (see below) |

##### Bidirectional Mode

The `bidirectional` option enables support for displaying negative values with visual clarity. When enabled:

- **Positive values** display clockwise (right side) from the top (12 o'clock position)
- **Negative values** display counter-clockwise (left side) from the top
- **Zero point** is always at the top of the gauge
- **LED allocation** is proportional to the range on each side of zero

This is perfect for:
- Power flow (import/export): `-5000W` to `+5000W`
- Battery charge/discharge: `-3000W` to `+3000W`
- Temperature differences: `-10°C` to `+10°C`

**Example configuration:**

```yaml
gauges:
  - entity: sensor.power_import_export
    min: -5000
    max: 5000
    unit: 'W'
    bidirectional: true
    severity:
      - color: '#4caf50'
        value: -5000  # Full export (green)
      - color: '#ffeb3b'
        value: 0      # Zero (yellow)
      - color: '#f44336'
        value: 5000   # Full import (red)
```

**How it works:**
- If `min` and `max` cross zero (e.g., -5000 to 5000), zero becomes the reference point
- If they don't cross zero (e.g., 10 to 50), the midpoint (30) becomes the reference
- LEDs are allocated proportionally: asymmetric ranges like -1000 to 5000 will use ~16.7% LEDs for negative, ~83.3% for positive

#### Visual Options

| Option | Type | Default | Description |
|--------|------|--------|-------------|
| `leds_count` | number | 100 | Number of LEDs on the circle |
| `led_size` | number | 8 (outer) / 6 (inner) | LED size in pixels |
| `hide_inactive_leds` | boolean | false | Hide inactive LEDs |

#### Individual Themes

Each gauge can have its own theme:

```yaml
gauges:
  - entity: sensor.temp_inside
    theme: light
    # OR
    theme: custom
    custom_background: '#f0f0f0'
    custom_gauge_background: 'radial-gradient(circle, #ddd, #ccc)'
    custom_center_background: 'radial-gradient(circle, #eee, #ddd)'
    custom_text_color: '#333'
    custom_secondary_text_color: '#666'
```

Available themes: `default`, `light`, `dark`, `custom`

#### Shadow System

Each gauge has **two independent shadow types**:

##### 1. Center Shadow (`center_shadow`)
Creates a halo at the gauge center, ideal for depth effect.

##### 2. Outer Shadow (`outer_shadow`)
Creates a circular halo on the gauge's outer border.

```yaml
gauges:
  # Inner gauge
  - entity: sensor.temperature
    center_shadow: true           # Center shadow (uses temperature color)
    center_shadow_blur: 50        # High blur
    center_shadow_spread: 10      # Moderate spread
    outer_shadow: false           # No border shadow on inner gauge

  # Outer gauge
  - entity: sensor.humidity
    center_shadow: false          # No center shadow
    outer_shadow: true            # Border shadow (uses humidity color)
    outer_shadow_blur: 30         # Border blur
    outer_shadow_spread: 15       # Border spread
```

**Shadow Options:**

| Option | Type | Default | Description |
|--------|------|--------|-------------|
| `center_shadow` | boolean | false | Enable center shadow |
| `center_shadow_blur` | number | 30 | Center shadow blur (px) |
| `center_shadow_spread` | number | 15 | Center shadow spread (px) |
| `outer_shadow` | boolean | false | Enable border shadow |
| `outer_shadow_blur` | number | 30 | Border shadow blur (px) |
| `outer_shadow_spread` | number | 15 | Border shadow spread (px) |

**Behavior:**
- Center shadows **stack** if both gauges have `center_shadow: true`
- Border shadows **stack** if both gauges have `outer_shadow: true`
- Each shadow follows its gauge's color (defined by `severity`)

#### Animations

| Option | Type | Default | Description |
|--------|------|--------|-------------|
| `smooth_transitions` | boolean | true | Enable smooth transitions |
| `animation_duration` | number | 800 | Animation duration in ms |

#### Colors and Severity

Define colors based on value:

```yaml
gauges:
  - entity: sensor.temperature
    severity:
      - color: '#4caf50'    # Green
        value: 20           # Up to 20
      - color: '#ff9800'    # Orange
        value: 50           # From 20 to 50
      - color: '#f44336'    # Red
        value: 75           # Above 50
```

**Note:** Severity values are **real values** (not percentages). For a temperature sensor with min: 0, max: 40, use real temperature values like 20, 30, 35.

#### Markers

Add indicators at specific values:

```yaml
gauges:
  - entity: sensor.temperature
    markers_radius: 95        # Marker positioning radius (optional)
    markers:
      - value: 18
        color: '#2196f3'
        label: 'Min'
      - value: 22
        color: '#4caf50'
        label: 'Optimal'
      - value: 26
        color: '#ff5722'
        label: 'Max'
```

**Marker Configuration:**

| Option | Type | Default | Description |
|--------|------|--------|-------------|
| `markers_radius` | number | Gauge radius | Marker positioning radius in pixels |
| `markers` | array | - | List of markers to display |

**Marker Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `value` | number | Value where to place the marker (real value, not %) |
| `color` | string | Marker color |
| `label` | string | Text to display (optional) |

**Adjusting Marker Radius:**
```yaml
# Markers closer to center
gauges:
  - entity: sensor.temperature
    markers_radius: 80        # Smaller = closer to center

# Markers farther from center
gauges:
  - entity: sensor.temperature
    markers_radius: 100       # Larger = farther from center
```

#### Zones

Add colored ranges on the circle:

```yaml
gauges:
  - entity: sensor.temperature
    zones:
      - from: 0
        to: 18
        color: '#2196f3'
        opacity: 0.3
      - from: 18
        to: 24
        color: '#4caf50'
        opacity: 0.5
      - from: 24
        to: 40
        color: '#f44336'
        opacity: 0.4
```

| Property | Type | Description |
|----------|------|-------------|
| `from` | number | Start value |
| `to` | number | End value |
| `color` | string | Zone color |
| `opacity` | number | Opacity (0-1) |

### Transparent Card (No Frame)

The `hide_card` parameter removes the card frame for seamless integration:

```yaml
type: custom:dual-gauge-card
name: "Living Room Temperature"
hide_card: true              # Remove frame, background and shadow
title_position: inside-top   # Recommended with hide_card
```

**Effect of `hide_card: true`:**
- Removes card background
- Removes border/frame
- Removes drop shadow
- Removes padding

**Ideal for:**
- Integrating gauge on a background image
- Creating minimalist design
- Overlaying on other elements

**Recommendations:**
- Use `title_position: inside-top` or `inside-bottom` to keep title visible
- Or use `title_position: none` for ultra-minimalist design

### Title Position

The `title_position` parameter controls where the title displays:

```yaml
# Title at bottom (default)
type: custom:dual-gauge-card
name: "Living Room Temperature"
title_position: bottom        # Or omit (default)

# Title at top
type: custom:dual-gauge-card
name: "Living Room Temperature"
title_position: top

# Title inside at top
type: custom:dual-gauge-card
name: "Living Room Temperature"
title_position: inside-top

# Title inside at bottom
type: custom:dual-gauge-card
name: "Living Room Temperature"
title_position: inside-bottom

# Title hidden
type: custom:dual-gauge-card
name: "Living Room Temperature"
title_position: none
```

**Available Positions:**

| Value | Description |
|-------|-------------|
| `bottom` | Below the card (default) |
| `top` | Above the card |
| `inside-top` | Inside the gauge, at top |
| `inside-bottom` | Inside the gauge, at bottom |
| `none` | Hide the title |

### Gauge Spacing Adjustment

The `inner_gauge_radius` parameter controls the spacing between inner and outer gauges:

```yaml
# Gauges far apart (wide spacing)
gauge_size: 220
inner_gauge_size: 120
inner_gauge_radius: 60      # Default = inner_gauge_size / 2

# Gauges closer together (reduced spacing)
gauge_size: 220
inner_gauge_size: 120
inner_gauge_radius: 90      # Larger = closer to outer gauge

# Gauges very close together
gauge_size: 220
inner_gauge_size: 120
inner_gauge_radius: 100     # Almost touching
```

**Note:** The larger `inner_gauge_radius` is, the **closer** the inner gauge gets to the outer gauge.

## Usage Examples

### Indoor/Outdoor Temperature

```yaml
type: custom:dual-gauge-card
name: "Inside/Outside Temperature"
gauge_size: 220
inner_gauge_size: 140
inner_gauge_radius: 95      # Bring gauges closer together
primary_gauge: inner
card_theme: dark
hide_shadows: false

gauges:
  # Inner gauge - Indoor temperature
  - entity: sensor.temperature_inside
    min: 15
    max: 30
    unit: '°C'
    decimals: 1
    leds_count: 80
    led_size: 6
    theme: default
    smooth_transitions: true
    animation_duration: 1000
    center_shadow: true
    center_shadow_blur: 25
    center_shadow_spread: 10
    severity:
      - color: '#2196f3'
        value: 19
      - color: '#4caf50'
        value: 24
      - color: '#ff9800'
        value: 27
      - color: '#f44336'
        value: 30
    markers:
      - value: 19
        color: '#2196f3'
        label: 'Min'
      - value: 21
        color: '#4caf50'
        label: 'Ideal'
    zones:
      - from: 15
        to: 19
        color: '#2196f3'
        opacity: 0.3
      - from: 19
        to: 24
        color: '#4caf50'
        opacity: 0.4
      - from: 24
        to: 30
        color: '#ff5722'
        opacity: 0.3

  # Outer gauge - Outdoor temperature
  - entity: sensor.temperature_outside
    min: -10
    max: 40
    unit: '°C'
    decimals: 1
    leds_count: 100
    led_size: 8
    theme: default
    smooth_transitions: true
    animation_duration: 800
    outer_shadow: true
    outer_shadow_blur: 30
    outer_shadow_spread: 15
    severity:
      - color: '#2196f3'
        value: 10
      - color: '#4caf50'
        value: 25
      - color: '#ff9800'
        value: 35
      - color: '#f44336'
        value: 40
    markers:
      - value: 0
        color: '#03a9f4'
        label: '0°C'
      - value: 20
        color: '#8bc34a'
        label: '20°C'
```

### Temperature and Humidity

```yaml
type: custom:dual-gauge-card
name: "Climate Monitor"
gauge_size: 200
inner_gauge_size: 130
primary_gauge: inner
title_position: inside-bottom

gauges:
  # Inner gauge - Temperature
  - entity: sensor.room_temperature
    min: 15
    max: 30
    unit: '°C'
    decimals: 1
    leds_count: 70
    center_shadow: true
    severity:
      - color: '#2196f3'
        value: 18
      - color: '#4caf50'
        value: 23
      - color: '#ff9800'
        value: 27
      - color: '#f44336'
        value: 30

  # Outer gauge - Humidity
  - entity: sensor.room_humidity
    min: 0
    max: 100
    unit: '%'
    decimals: 0
    leds_count: 100
    outer_shadow: true
    severity:
      - color: '#ff5722'
        value: 30
      - color: '#4caf50'
        value: 60
      - color: '#2196f3'
        value: 100
```

### Minimalist Transparent Design

```yaml
type: custom:dual-gauge-card
name: "Salon"
hide_card: true              # Transparent integration
title_position: inside-top
gauge_size: 180
inner_gauge_size: 110
primary_gauge: outer

gauges:
  - entity: sensor.temperature_salon
    min: 15
    max: 30
    unit: '°C'
    hide_inactive_leds: true
    severity:
      - color: '#00bfff'
        value: 20
      - color: '#4caf50'
        value: 24
      - color: '#ff5722'
        value: 30

  - entity: sensor.co2_salon
    min: 400
    max: 2000
    unit: 'ppm'
    hide_inactive_leds: true
    severity:
      - color: '#4caf50'
        value: 800
      - color: '#ff9800'
        value: 1200
      - color: '#f44336'
        value: 2000
```

### Power Consumption Comparison

```yaml
type: custom:dual-gauge-card
name: "Energy Usage"
gauge_size: 240
inner_gauge_size: 150
inner_gauge_radius: 100
primary_gauge: outer
title_position: bottom

gauges:
  # Inner - Current power
  - entity: sensor.current_power
    min: 0
    max: 5000
    unit: 'W'
    decimals: 0
    leds_count: 90
    center_shadow: true
    severity:
      - color: '#4caf50'
        value: 1000
      - color: '#ff9800'
        value: 3000
      - color: '#f44336'
        value: 5000
    markers:
      - value: 2000
        color: '#ffeb3b'
        label: 'Target'

  # Outer - Daily total
  - entity: sensor.daily_energy
    min: 0
    max: 50
    unit: 'kWh'
    decimals: 1
    leds_count: 120
    outer_shadow: true
    severity:
      - color: '#4caf50'
        value: 20
      - color: '#ff9800'
        value: 35
      - color: '#f44336'
        value: 50
```

### Battery Comparison (Phone vs Tablet)

```yaml
type: custom:dual-gauge-card
name: "Battery Levels"
gauge_size: 200
inner_gauge_size: 125
primary_gauge: inner
title_position: inside-bottom

gauges:
  # Inner - Phone battery
  - entity: sensor.phone_battery
    min: 0
    max: 100
    unit: '%'
    decimals: 0
    leds_count: 60
    center_shadow: true
    severity:
      - color: '#f44336'
        value: 20
      - color: '#ff9800'
        value: 50
      - color: '#4caf50'
        value: 100
    zones:
      - from: 0
        to: 20
        color: '#f44336'
        opacity: 0.4

  # Outer - Tablet battery
  - entity: sensor.tablet_battery
    min: 0
    max: 100
    unit: '%'
    decimals: 0
    leds_count: 80
    outer_shadow: true
    severity:
      - color: '#f44336'
        value: 20
      - color: '#ff9800'
        value: 50
      - color: '#4caf50'
        value: 100
```

## Important Notes

1. **Gauge Order**:
   - `gauges[0]` = inner gauge
   - `gauges[1]` = outer gauge

2. **Primary Gauge**:
   - `primary_gauge: 'inner'` displays inner gauge value large
   - `primary_gauge: 'outer'` displays outer gauge value large

3. **Themes**:
   - Each gauge can have its own theme
   - `card_theme` defines the global card theme
   - Transparent options allow hiding specific elements

4. **Performance**:
   - Use `power_save_mode` to save resources
   - `debounce_updates` to reduce update frequency
   - Reduce `leds_count` to improve performance

5. **Shadows**:
   - `hide_shadows: true` disables all shadows (card and LEDs)
   - `center_shadow` creates shadow at gauge center (dynamic color)
   - `outer_shadow` creates shadow at gauge border (dynamic color)

6. **Severity Values**:
   - Use **real values** matching your sensor's min/max range
   - For temperature 0-40°C, use values like 20, 30, 35 (not percentages)
   - Colors change based on actual sensor reading

## Compatibility

- Home Assistant 2024.1.0 or higher
- All modern browsers supporting Web Components
- Mobile and tablet compatible

## Contributing

Contributions are welcome! Feel free to:
- Report bugs via [Issues](https://github.com/guiohm79/dual-gauge-card/issues)
- Propose improvements
- Submit Pull Requests

## Support

If you like this card, please:
- ⭐ Star it on GitHub
- 🐛 Report bugs
- 💡 Suggest new features
- [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=flat-square&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/guiohm79)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
