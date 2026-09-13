/**
 * Dual Gauge Card - Standalone Version (Non-compiled)
 * Version: 1.7.0
 * 
 * Ce fichier est le point d'entrée principal qui charge :
 * - Le core de la carte (inline ci-dessous)
 * - L'éditeur visuel (dual-gauge-card-editor.js) chargé dynamiquement
 */

// ============================================================================
// CONFIGURATION AND THEMES
// ============================================================================

const CARD_VERSION = '1.7.0';

const themes = {
  default: {
    background: '#222',
    gaugeBackground: 'radial-gradient(circle, #444, #222)',
    centerBackground: 'radial-gradient(circle, #333, #111)',
    textColor: 'white',
    secondaryTextColor: '#ddd'
  },
  light: {
    background: '#f0f0f0',
    gaugeBackground: 'radial-gradient(circle, #e0e0e0, #d0d0d0)',
    centerBackground: 'radial-gradient(circle, #f5f5f5, #e5e5e5)',
    textColor: '#333',
    secondaryTextColor: '#666'
  },
  dark: {
    background: '#111',
    gaugeBackground: 'radial-gradient(circle, #333, #111)',
    centerBackground: 'radial-gradient(circle, #222, #000)',
    textColor: '#eee',
    secondaryTextColor: '#bbb'
  }
};

function getTheme(themeName, config) {
  let theme;

  if (themeName === 'custom') {
    theme = {
      background: config.custom_background || '#222',
      gaugeBackground: config.custom_gauge_background || 'radial-gradient(circle, #444, #222)',
      centerBackground: config.custom_center_background || 'radial-gradient(circle, #333, #111)',
      textColor: config.custom_text_color || 'white',
      secondaryTextColor: config.custom_secondary_text_color || '#ddd'
    };
  } else {
    theme = { ...(themes[themeName] || themes.default) };
  }

  if (config.transparent_card_background) {
    theme.background = 'transparent';
  }
  if (config.transparent_gauge_background) {
    theme.gaugeBackground = 'transparent';
  }
  if (config.transparent_center_background) {
    theme.centerBackground = 'transparent';
  }

  return theme;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Valeurs par défaut basées sur le pourcentage (0-100%)
const DEFAULT_SEVERITY = [
  { color: "#4caf50", value: 20 },
  { color: "#ffeb3b", value: 50 },
  { color: "#f44336", value: 100 },
];

/**
 * Thresholds in use, sorted ascending, with the green/yellow/red fallback when the gauge
 * has no severity of its own.
 *
 * Chaque seuil donne la couleur utilisée jusqu'à sa valeur, donc le premier seuil dont la
 * valeur est atteinte gagne. On trie sur une copie : sans cela, un seuil saisi dans le
 * désordre (par exemple ajouté en fin de liste) ne s'applique jamais, car un seuil de
 * valeur supérieure placé avant lui répond en premier.
 * @param {Array} severity - Thresholds of a gauge, or undefined
 * @returns {Array} Sorted copy of the thresholds
 */
function getSeverityLevels(severity) {
  return [...(severity || DEFAULT_SEVERITY)].sort((a, b) => a.value - b.value);
}

// A canvas normalises every CSS colour notation into a hex or rgb() string, which is the
// only cheap way to read a named colour or an hsl() back as numbers. The context and the
// results are kept because the LED loop asks for the same handful of colours on every frame.
const COLOR_SENTINEL = '#010203';
const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const rgbCache = {};
let colorContext = null;

/**
 * @param {string} hex - #rgb or #rrggbb
 * @returns {Array<number>} [r, g, b]
 */
function hexToRgbTriplet(hex) {
  let digits = hex.slice(1);
  if (digits.length === 3) {
    digits = digits.split('').map(c => c + c).join('');
  }
  const packed = parseInt(digits, 16);
  return [(packed >> 16) & 255, (packed >> 8) & 255, packed & 255];
}

/**
 * Resolve a CSS colour to [r, g, b], or null when it cannot be resolved without a layout —
 * `var(--theme-colour)` most notably, which is why gradient mode falls back to the stepped
 * colour instead of guessing.
 * @param {string} color - Any CSS colour
 * @returns {Array<number>|null} [r, g, b] or null
 */
function parseColorToRgb(color) {
  if (!color) return null;

  const key = String(color).trim();
  if (key in rgbCache) return rgbCache[key];

  let rgb = null;
  let normalised = key;

  if (!HEX_PATTERN.test(key)) {
    // Named colours, rgb() and hsl() are normalised by the canvas; it silently keeps its
    // previous value for anything it cannot parse, hence the sentinel written before.
    try {
      colorContext = colorContext || document.createElement('canvas').getContext('2d');
      colorContext.fillStyle = COLOR_SENTINEL;
      colorContext.fillStyle = key;
      normalised = colorContext.fillStyle === COLOR_SENTINEL && key.toLowerCase() !== COLOR_SENTINEL
        ? null
        : colorContext.fillStyle;
    } catch (error) {
      normalised = null;
    }
  }

  if (normalised && HEX_PATTERN.test(normalised)) {
    rgb = hexToRgbTriplet(normalised);
  } else if (normalised) {
    const match = normalised.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if (match) {
      rgb = [Math.round(+match[1]), Math.round(+match[2]), Math.round(+match[3])];
    }
  }

  rgbCache[key] = rgb;
  return rgb;
}

/**
 * Colour interpolated between the two thresholds surrounding the value.
 * @param {number} value - Normalised value (0-100%)
 * @param {Array} severity - Thresholds of the gauge
 * @param {number} [min] - Minimum value, when the thresholds are in real units
 * @param {number} [max] - Maximum value, when the thresholds are in real units
 * @returns {string|null} An `rgb(...)` colour, or null when an end colour is unparsable
 */
function getGradientColor(value, severity, min, max) {
  const levels = getSeverityLevels(severity);
  if (levels.length === 0) return null;

  // Same convention as the stepped logic below: with min/max the thresholds are real
  // values, without them they are percentages compared to the value directly.
  const target = (min !== undefined && max !== undefined)
    ? min + (value / 100) * (max - min)
    : value;

  if (levels.length === 1 || target <= levels[0].value) return levels[0].color;
  if (target >= levels[levels.length - 1].value) return levels[levels.length - 1].color;

  let i = 0;
  while (i < levels.length - 2 && target >= levels[i + 1].value) i++;
  const low = levels[i];
  const high = levels[i + 1];

  const span = high.value - low.value;
  const ratio = span > 0 ? (target - low.value) / span : 0;

  const from = parseColorToRgb(low.color);
  const to = parseColorToRgb(high.color);
  if (!from || !to) return null;

  const mix = from.map((channel, k) => Math.round(channel + (to[k] - channel) * ratio));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

/**
 * @param {number} value - Normalised value (0-100%)
 * @param {Array} severity - Thresholds of the gauge
 * @param {number} [min] - Minimum value, when the thresholds are in real units
 * @param {number} [max] - Maximum value, when the thresholds are in real units
 * @param {string} [mode] - 'steps', 'gradient' or 'gradient_arc'
 * @returns {string} The colour to paint with
 */
function getLedColor(value, severity, min, max, mode = 'steps') {
  if (mode === 'gradient' || mode === 'gradient_arc') {
    const blended = getGradientColor(value, severity, min, max);
    if (blended) return blended;
    // Unparsable colour (a theme variable, say): fall through to the stepped colour.
  }

  const severityConfig = getSeverityLevels(severity);

  // Si min et max sont fournis, convertir la valeur normalisée (0-100%) en valeur réelle
  if (min !== undefined && max !== undefined) {
    // Convertir le pourcentage (value) en valeur réelle
    const realValue = min + (value / 100) * (max - min);

    // Parcourir les seuils et comparer directement avec les valeurs réelles
    for (const zone of severityConfig) {
      if (realValue <= zone.value) {
        return zone.color;
      }
    }

    // Si aucun seuil n'est atteint, retourner la dernière couleur
    return severityConfig[severityConfig.length - 1]?.color || "#555";
  }

  // Mode compatibilité : utiliser les pourcentages (sans min/max)
  for (const zone of severityConfig) {
    if (value <= zone.value) {
      return zone.color;
    }
  }

  return severityConfig[severityConfig.length - 1]?.color || "#555";
}

function optimizeLEDs(configuredCount) {
  return configuredCount || 100;
}

const DEFAULT_START_ANGLE = 0;
const DEFAULT_ARC_LENGTH = 360;

/**
 * Read the arc geometry of a gauge (start offset and arc length, in degrees)
 * @param {Object} gaugeConfig - Configuration of a single gauge
 * @returns {{startAngle: number, arcLength: number}} Geometry, 0° = top (12 o'clock), clockwise
 */
function getArcGeometry(gaugeConfig) {
  const startAngle = Number(gaugeConfig?.start_angle);
  const arcLength = Number(gaugeConfig?.arc_length);

  return {
    startAngle: Number.isFinite(startAngle) ? startAngle : DEFAULT_START_ANGLE,
    arcLength: Number.isFinite(arcLength) && arcLength > 0
      ? Math.min(arcLength, 360)
      : DEFAULT_ARC_LENGTH
  };
}

/**
 * Read the LED geometry of a gauge
 *
 * Round LEDs are circles of `led_size`; rectangular ones are VU-meter segments, `led_size`
 * thick along the arc and `led_length` long along the radius. A LED is positioned by its
 * centre, so the ring radius has to come in by half of each dimension: with
 * `ledLength === ledSize` the margin collapses to the historical `led_size`, which keeps
 * existing cards pixel-identical.
 * @param {Object} gaugeConfig - Configuration of a single gauge
 * @returns {{isRect: boolean, ledSize: number, ledLength: number, cornerRadius: number, ledMargin: number}} Geometry
 */
function getLedGeometry(gaugeConfig, defaultLedSize) {
  const ledSize = gaugeConfig?.led_size || defaultLedSize;
  const isRect = gaugeConfig?.led_shape === 'rect';

  const configuredLength = Number(gaugeConfig?.led_length);
  const ledLength = isRect
    ? (Number.isFinite(configuredLength) && configuredLength > 0 ? configuredLength : ledSize * 2)
    : ledSize;

  const configuredRadius = Number(gaugeConfig?.led_corner_radius);
  const cornerRadius = Number.isFinite(configuredRadius) && configuredRadius >= 0 ? configuredRadius : 1;

  return {
    isRect,
    ledSize,
    ledLength,
    cornerRadius,
    ledMargin: ledLength / 2 + ledSize / 2
  };
}

/**
 * Radius at which the markers of a gauge are drawn
 *
 * Without a `markers_radius` the markers simply follow the ring their gauge is drawn on.
 * With one, the value was written against the ring the gauge sat on in the configuration,
 * so `swap_gauges` shifts it by the distance between the two rings: "12px inside my ring"
 * still means "12px inside my ring" once the gauge has moved to the other one, instead of
 * leaving the markers behind on the ring they were tuned for.
 * @param {Object} gaugeConfig - Configuration of a single gauge
 * @param {number} ringRadius - Radius of the ring the gauge is drawn on
 * @param {number} authoredRingRadius - Radius of the ring the value was written against
 * @param {boolean} swapped - Whether the two gauges have been swapped
 * @returns {number} Radius in pixels
 */
function getMarkersRadius(gaugeConfig, ringRadius, authoredRingRadius, swapped) {
  if (gaugeConfig?.markers_radius === undefined) return ringRadius;

  return swapped
    ? gaugeConfig.markers_radius - authoredRingRadius + ringRadius
    : gaugeConfig.markers_radius;
}

const DEFAULT_VALUE_ORDER = 'inner_first';

/**
 * Order of the two numeric values stacked in the centre of the card
 * @param {Object} config - Card configuration
 * @returns {string} 'inner_first' (default) or 'outer_first'
 */
function getValueOrder(config) {
  return config?.value_order === 'outer_first' ? 'outer_first' : DEFAULT_VALUE_ORDER;
}

/**
 * Reference point used by the bidirectional mode (adaptive zero)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Zero when the range crosses it, the midpoint otherwise
 */
function getReferencePoint(min, max) {
  return (min <= 0 && max >= 0) ? 0 : (min + max) / 2;
}

/**
 * Position of the bidirectional reference point inside the arc, as a 0-1 fraction
 *
 * On a full circle the reference stays at the start of the arc and the lower side wraps
 * around the seam (historical behaviour). On a partial arc there is nothing to wrap into,
 * so the reference sits proportionally inside the arc and both sides stay visible.
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} arcLength - Arc length in degrees
 * @returns {number} Fraction of the arc between its start and the reference point
 */
function getBidirectionalOrigin(min, max, arcLength) {
  if (arcLength >= 360) return 0;

  const totalRange = max - min;
  if (totalRange <= 0) return 0;

  return (getReferencePoint(min, max) - min) / totalRange;
}

/**
 * Calculate bidirectional LED activation
 * @param {number} value - Current value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} ledsCount - Total number of LEDs
 * @param {boolean} bidirectional - Enable bidirectional mode
 * @param {number} arcLength - Arc length in degrees (360 = full circle)
 * @returns {Object} Object with activeLeds count, originIndex and direction ('positive', 'negative', or 'unidirectional')
 */
function calculateBidirectionalLeds(value, min, max, ledsCount, bidirectional, arcLength = DEFAULT_ARC_LENGTH) {
  // Calculate full-range normalized value for severity colors (always needed)
  const fullRangeNormalized = ((value - min) / (max - min)) * 100;

  if (!bidirectional) {
    // Standard unidirectional behavior
    const activeLeds = Math.round((fullRangeNormalized / 100) * ledsCount);
    return {
      activeLeds,
      originIndex: 0,
      direction: 'unidirectional',
      normalizedValue: fullRangeNormalized
    };
  }

  // Bidirectional mode: reference point is at the origin LED (start of the arc on a full
  // circle, proportionally inside the arc otherwise)
  // Values above reference go clockwise (to the right)
  // Values below reference go counter-clockwise (to the left)

  // Determine reference point (adaptive zero)
  const referencePoint = getReferencePoint(min, max);
  const originIndex = Math.round(getBidirectionalOrigin(min, max, arcLength) * ledsCount);

  // Calculate range sizes on each side of reference
  const totalRange = max - min;
  const lowerRange = referencePoint - min;  // Size from min to reference
  const upperRange = max - referencePoint;  // Size from reference to max

  // Calculate proportional LED allocation
  const lowerProportion = lowerRange / totalRange;
  const upperProportion = upperRange / totalRange;

  if (value >= referencePoint) {
    // Upper values: calculate percentage from reference to max
    const percentage = upperRange > 0 ? ((value - referencePoint) / upperRange) * 100 : 0;
    // Allocate LEDs proportionally based on upper range's share of total
    const maxUpperLeds = ledsCount * upperProportion;
    const activeLeds = Math.round((percentage / 100) * maxUpperLeds);

    return {
      activeLeds,
      originIndex,
      direction: 'positive',
      normalizedValue: fullRangeNormalized  // Use full-range for severity colors
    };
  } else {
    // Lower values: calculate percentage from reference to min
    const percentage = lowerRange > 0 ? ((referencePoint - value) / lowerRange) * 100 : 0;
    // Allocate LEDs proportionally based on lower range's share of total
    const maxLowerLeds = ledsCount * lowerProportion;
    const activeLeds = Math.round((percentage / 100) * maxLowerLeds);

    return {
      activeLeds,
      originIndex,
      direction: 'negative',
      normalizedValue: fullRangeNormalized  // Use full-range for severity colors
    };
  }
}

/**
 * Convert value to angle based on bidirectional or unidirectional mode
 * @param {number} value - The value to convert
 * @param {number} min - Minimum range value
 * @param {number} max - Maximum range value
 * @param {boolean} bidirectional - Whether bidirectional mode is enabled
 * @param {number} startAngle - Offset of the start of the arc in degrees (0 = top)
 * @param {number} arcLength - Arc length in degrees (360 = full circle)
 * @returns {number} Angle in degrees, relative to the top and going clockwise
 */
function valueToAngle(value, min, max, bidirectional, startAngle = DEFAULT_START_ANGLE, arcLength = DEFAULT_ARC_LENGTH) {
  if (!bidirectional) {
    // Unidirectional mode: simple linear mapping over the arc
    const percentage = ((value - min) / (max - min)) * 100;
    return startAngle + (percentage / 100) * arcLength;
  }

  // Bidirectional mode: proportional allocation with adaptive reference point

  // Determine reference point (adaptive zero)
  const referencePoint = getReferencePoint(min, max);

  // Calculate range sizes on each side of reference
  const totalRange = max - min;
  const lowerRange = referencePoint - min;  // Size from min to reference
  const upperRange = max - referencePoint;  // Size from reference to max

  // Calculate proportional angle allocation over the arc
  const lowerProportion = lowerRange / totalRange;
  const upperProportion = upperRange / totalRange;
  const maxLowerAngle = lowerProportion * arcLength;  // Degrees allocated to lower side
  const maxUpperAngle = upperProportion * arcLength;  // Degrees allocated to upper side

  // Angle of the reference point itself
  const originAngle = startAngle + getBidirectionalOrigin(min, max, arcLength) * arcLength;

  if (value >= referencePoint) {
    // Upper values: go clockwise from the reference point
    const percentage = upperRange > 0 ? ((value - referencePoint) / upperRange) * 100 : 0;
    return originAngle + (percentage / 100) * maxUpperAngle;
  } else {
    // Lower values: go counter-clockwise from the reference point
    const percentage = lowerRange > 0 ? ((referencePoint - value) / lowerRange) * 100 : 0;
    return originAngle - ((percentage / 100) * maxLowerAngle);
  }
}

// ============================================================================
// STYLES
// ============================================================================

const stylesCSS = `
.gauge-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--ha-card-header-font-family, Arial), sans-serif;
  background: var(--card-background);
  border-radius: 15px;
  padding: 16px;
  box-shadow: var(--card-shadow);
  box-shadow: var(--card-shadow);
  transition: box-shadow 0.3s ease-in-out;
}

.gauge-card.has-inside-title {
  position: relative;
}

.gauge-card.has-inside-title .gauge {
  position: relative;
}

.gauge-card.no-card {
  background: transparent !important;
  border-radius: 0;
  padding: 0;
  box-shadow: none !important;
}

.gauge {
  position: relative;
  width: var(--gauge-size);
  height: var(--gauge-size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-shadow {
  position: absolute;
  width: var(--center-size);
  height: var(--center-size);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0));
  box-shadow: none;
  transition: box-shadow 0.3s ease-in-out;
}

.led {
  position: absolute;
  width: var(--led-size);
  height: var(--led-size);
  background: #333;
  border-radius: 50%;
  box-shadow: var(--led-shadow);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.led.active {
  box-shadow: 0 0 8px currentColor, inset 0 0 3px currentColor;
}

.center {
  position: absolute;
  width: var(--center-size);
  height: var(--center-size);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.value {
  transition: all 0.3s ease;
}

#value-inner {
  font-family: var(--value-font-family-inner);
  font-size: var(--value-font-size-inner);
  font-weight: var(--value-font-weight-inner);
  color: var(--value-font-color-inner);
}

#value-outer {
  font-family: var(--value-font-family-outer);
  font-size: var(--value-font-size-outer);
  font-weight: var(--value-font-weight-outer);
  color: var(--value-font-color-outer);
}

.unit {
  /* Common styles if needed */
}

#unit-inner {
  font-family: var(--unit-font-family-inner);
  font-size: var(--unit-font-size-inner);
  font-weight: var(--unit-font-weight-inner);
  color: var(--unit-font-color-inner);
}

#unit-outer {
  font-family: var(--unit-font-family-outer);
  font-size: var(--unit-font-size-outer);
  font-weight: var(--unit-font-weight-outer);
  color: var(--unit-font-color-outer);
}

.title {
  margin-top: 10px;
  font-size: var(--title-font-size);
  font-family: var(--title-font-family);
  font-weight: var(--title-font-weight);
  color: var(--title-font-color);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.title.position-top {
  order: -1;
  margin-top: 0;
  margin-bottom: 10px;
}

.title.position-inside-top {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  z-index: 10;
}

.title.position-inside-bottom {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  z-index: 10;
}

.title.position-none {
  display: none;
}

.dual-gauge-card {
  min-width: calc(var(--outer-gauge-size, var(--gauge-size)) + 32px);
}

.dual-gauge {
  width: var(--outer-gauge-size, var(--gauge-size));
  height: var(--outer-gauge-size, var(--gauge-size));
}

/* Round LEDs keep --led-width/--led-height equal to --led-size and a 50% radius, so these
   rules render exactly as before; rectangular segments widen along the radius instead. */
.dual-gauge .led[id^="led-inner-"] {
  width: var(--led-width-inner, var(--led-size-inner));
  height: var(--led-height-inner, var(--led-size-inner));
  border-radius: var(--led-radius-inner, 50%);
}

.dual-gauge .led[id^="led-outer-"] {
  width: var(--led-width-outer, var(--led-size-outer));
  height: var(--led-height-outer, var(--led-size-outer));
  border-radius: var(--led-radius-outer, 50%);
}

.dual-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
}

.value-group {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}



.marker {
  position: absolute;
  width: 4px;
  height: 12px;
  background: #fff;
  border-radius: 2px;
  z-index: 2;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.marker-label {
  position: absolute;
  font-size: 10px;
  color: #fff;
  z-index: 2;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
}

.outer-shadow {
  position: absolute;
  border-radius: 50%;
  background: transparent;
  pointer-events: none;
  transition: box-shadow 0.3s ease-in-out;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
}
`;

// ============================================================================
// RENDERER
// ============================================================================

function generateLedsHTML(ledsCount, radius, ledMargin, prefix = '', startAngle = DEFAULT_START_ANGLE, arcLength = DEFAULT_ARC_LENGTH) {
  // On a full circle the last LED must not land on the first one, so the step divides the
  // arc by the LED count. On a partial arc both ends are visible and must carry a LED.
  const step = arcLength >= 360
    ? arcLength / ledsCount
    : arcLength / Math.max(ledsCount - 1, 1);

  const leds = [];
  for (let i = 0; i < ledsCount; i++) {
    const angle = startAngle + i * step - 90;
    // `rotate()` turns the local frame before `translate()`, so the element's own X axis
    // already points outwards: a rectangular LED needs no rotation of its own.
    const translate = radius - ledMargin;
    leds.push(`<div class="led" id="led-${prefix}${prefix ? '-' : ''}${i}" style="transform: rotate(${angle}deg) translate(${translate}px);"></div>`);
  }
  return leds.join('');
}

function renderDual(context) {
  const config1 = context.config.gauges[0];
  const config2 = context.config.gauges[1];

  const ledsCount1 = optimizeLEDs(config1.leds_count);
  const ledsCount2 = optimizeLEDs(config2.leds_count);

  context.ledsCount1 = ledsCount1;
  context.ledsCount2 = ledsCount2;

  const theme1 = getTheme(config1.theme || 'default', config1);
  const theme2 = getTheme(config2.theme || 'default', config2);

  const outerGaugeSize = context.config.gauge_size || 200;
  const innerGaugeSize = context.config.inner_gauge_size || (outerGaugeSize * 0.65);
  const innerGaugeRadius = context.config.inner_gauge_radius !== undefined
    ? context.config.inner_gauge_radius
    : (innerGaugeSize / 2);
  const ledSize1 = config1.led_size || 6;
  const ledSize2 = config2.led_size || 8;

  const led1 = getLedGeometry(config1, 6);
  const led2 = getLedGeometry(config2, 8);

  const arc1 = getArcGeometry(config1);
  const arc2 = getArcGeometry(config2);

  // Déterminer le thème global de la carte (utilise le thème de la première gauge par défaut)
  const globalTheme = context.config.card_theme ? getTheme(context.config.card_theme, context.config) : theme1;

  // Fonction utilitaire pour normaliser les tailles CSS (ajoute px si nécessaire)
  const normalizeSize = (size, defaultValue) => {
    if (!size || size.trim() === '') return defaultValue;
    const trimmed = size.trim();
    // Si c'est déjà une valeur valide (px, em, rem, %, etc), on la retourne
    if (/^\d+(\.\d+)?(px|em|rem|%|ex|ch|vh|vw|vmin|vmax|pt|pc|in|cm|mm|q)$/.test(trimmed)) {
      return trimmed;
    }
    // Si c'est juste un nombre, on ajoute px
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return trimmed + 'px';
    }
    // Sinon on retourne la valeur telle quelle (pour les valeurs comme 'inherit', 'auto', etc)
    return trimmed;
  };

  // Configuration typographique pour chaque gauge (indépendante)
  // Gauge intérieure (config1)
  const vSizeInner = normalizeSize(config1.value_font_size, '24px');
  const vWeightInner = config1.value_font_weight || 'bold';
  const vColorInner = config1.value_font_color || theme1.textColor;
  const uSizeInner = normalizeSize(config1.unit_font_size, '14px');
  const uWeightInner = config1.unit_font_weight || 'normal';
  const uColorInner = config1.unit_font_color || theme1.secondaryTextColor;

  // Gauge extérieure (config2)
  const vSizeOuter = normalizeSize(config2.value_font_size, '18px');
  const vWeightOuter = config2.value_font_weight || 'bold';
  const vColorOuter = config2.value_font_color || theme2.textColor;
  const uSizeOuter = normalizeSize(config2.unit_font_size, '12px');
  const uWeightOuter = config2.unit_font_weight || 'normal';
  const uColorOuter = config2.unit_font_color || theme2.secondaryTextColor;


  const cssVariables = `
    --card-background: ${context.config.card_background || globalTheme.background};
    --gauge-background: ${globalTheme.gaugeBackground};
    --center-background: ${globalTheme.centerBackground};
    --text-color: ${globalTheme.textColor};
    --secondary-text-color: ${globalTheme.secondaryTextColor};
    --gauge-size: ${outerGaugeSize}px;
    --outer-gauge-size: ${outerGaugeSize}px;
    --inner-gauge-size: ${innerGaugeSize}px;
    --led-size: ${ledSize2}px;
    --led-size-outer: ${ledSize2}px;
    --led-size-inner: ${ledSize1}px;
    --led-width-inner: ${led1.ledLength}px;
    --led-height-inner: ${led1.ledSize}px;
    --led-radius-inner: ${led1.isRect ? `${led1.cornerRadius}px` : '50%'};
    --led-width-outer: ${led2.ledLength}px;
    --led-height-outer: ${led2.ledSize}px;
    --led-radius-outer: ${led2.isRect ? `${led2.cornerRadius}px` : '50%'};
    --center-size: ${innerGaugeSize * 0.6}px;
    --card-shadow: ${context.config.hide_shadows ? 'none' : '0 0 15px rgba(0, 0, 0, 0.5)'};
    --led-shadow: ${context.config.hide_shadows ? 'none' : '0 0 4px rgba(0, 0, 0, 0.8)'};
    
    --value-font-family-inner: ${config1.value_font_family || 'inherit'};
    --value-font-size-inner: ${vSizeInner};
    --value-font-weight-inner: ${vWeightInner};
    --value-font-color-inner: ${vColorInner};
    
    --value-font-family-outer: ${config2.value_font_family || 'inherit'};
    --value-font-size-outer: ${vSizeOuter};
    --value-font-weight-outer: ${vWeightOuter};
    --value-font-color-outer: ${vColorOuter};
    
    --unit-font-family-inner: ${config1.unit_font_family || 'inherit'};
    --unit-font-size-inner: ${uSizeInner};
    --unit-font-weight-inner: ${uWeightInner};
    --unit-font-color-inner: ${uColorInner};
    
    --unit-font-family-outer: ${config2.unit_font_family || 'inherit'};
    --unit-font-size-outer: ${uSizeOuter};
    --unit-font-weight-outer: ${uWeightOuter};
    --unit-font-color-outer: ${uColorOuter};

    --title-font-size: ${normalizeSize(context.config.title_font_size, '16px')};
    --title-font-family: ${context.config.title_font_family || 'inherit'};
    --title-font-weight: ${context.config.title_font_weight || 'normal'};
    --title-font-color: ${context.config.title_font_color || globalTheme.textColor};
  `;



  // Déterminer la position du titre
  const titlePosition = context.config.title_position || 'bottom';
  const titleClass = titlePosition !== 'bottom' ? `title position-${titlePosition}` : 'title';
  const isInsidePosition = titlePosition === 'inside-top' || titlePosition === 'inside-bottom';

  // Déterminer si on masque le cadre de la carte
  const hideCard = context.config.hide_card || false;

  // Construire les classes CSS de la carte
  const cardClasses = [
    'gauge-card',
    'dual-gauge-card',
    isInsidePosition ? 'has-inside-title' : '',
    hideCard ? 'no-card' : ''
  ].filter(Boolean).join(' ');

  // Générer le HTML du titre
  const titleHTML = `<div class="${titleClass}">${context.config.name || ""}</div>`;

  // The two values are stacked in the centre. Their ids stay tied to the ring they belong
  // to, only the order in which they are written changes, so the update loop and the click
  // handlers keep working whichever way round they are shown.
  const innerGroupHTML = `
          <div class="value-group" id="group-inner">
            <div class="value" id="value-inner">0</div>
            <div class="unit" id="unit-inner"></div>
          </div>`;
  const outerGroupHTML = `
          <div class="value-group" id="group-outer">
            <div class="value" id="value-outer">0</div>
            <div class="unit" id="unit-outer"></div>
          </div>`;
  const valueGroupsHTML = getValueOrder(context.config) === 'outer_first'
    ? outerGroupHTML + innerGroupHTML
    : innerGroupHTML + outerGroupHTML;

  const gaugeHTML = `
    <style>
      :host {
        ${cssVariables}
      }
      ${stylesCSS}
    </style>
    <div class="${cardClasses}" id="gauge-container">
      <div class="gauge dual-gauge" style="background: ${globalTheme.gaugeBackground}">
        ${isInsidePosition ? titleHTML : ''}
        <div class="outer-shadow" id="outer-shadow-inner"></div>
        <div class="outer-shadow" id="outer-shadow-outer"></div>
        <div class="center-shadow" id="center-shadow-inner"></div>
        <div class="center-shadow" id="center-shadow-outer"></div>
        ${generateLedsHTML(ledsCount2, outerGaugeSize / 2, led2.ledMargin, 'outer', arc2.startAngle, arc2.arcLength)}
        ${generateLedsHTML(ledsCount1, innerGaugeRadius, led1.ledMargin, 'inner', arc1.startAngle, arc1.arcLength)}
        <div class="center dual-center" style="background: ${globalTheme.centerBackground}">
          ${valueGroupsHTML}
        </div>
      </div>
      ${!isInsidePosition ? titleHTML : ''}
    </div>
  `;

  context.shadowRoot.innerHTML = gaugeHTML;

  // Stocker les dimensions pour les markers et zones
  context.innerGaugeRadius = innerGaugeRadius;
  context.outerGaugeSize = outerGaugeSize;
  context.innerGaugeSize = innerGaugeSize;

  // Ajouter les markers et zones après le rendu
  addMarkersAndZones(context);
}

// ============================================================================
// MARKERS AND ZONES
// ============================================================================

function addMarkersAndZones(context) {
  const gauge = context.shadowRoot.querySelector('.gauge');
  if (!gauge) return;

  const outerGaugeSize = context.outerGaugeSize;
  const innerGaugeRadius = context.innerGaugeRadius;
  const config1 = context.config.gauges[0];
  const config2 = context.config.gauges[1];

  const arc1 = getArcGeometry(config1);
  const arc2 = getArcGeometry(config2);

  const outerGaugeRadius = outerGaugeSize / 2;
  const swapped = context.config.swap_gauges || false;

  // Ajouter markers pour la gauge interne (gauge 0)
  if (config1.markers) {
    const min1 = config1.min || 0;
    const max1 = config1.max || 100;
    const markersRadius1 = getMarkersRadius(config1, innerGaugeRadius, outerGaugeRadius, swapped);
    // Labels inside by default (true or undefined), outside if false
    const markersInside1 = config1.markers_inside !== false;

    config1.markers.forEach(marker => {
      const angle = valueToAngle(marker.value, min1, max1, config1.bidirectional || false, arc1.startAngle, arc1.arcLength);

      // Calcul cartésien pour positionnement précis
      const angleRad = (angle - 90) * Math.PI / 180;
      const markerX = markersRadius1 * Math.cos(angleRad);
      const markerY = markersRadius1 * Math.sin(angleRad);

      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.style.cssText = `
        position: absolute;
        width: 4px;
        height: 12px;
        background: ${marker.color || '#fff'};
        border-radius: 2px;
        left: 50%;
        top: 50%;
        transform: translate(${markerX}px, ${markerY}px) translateX(-2px) translateY(-6px) rotate(${angle - 90}deg);
        z-index: 2;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      `;

      if (marker.label) {
        const labelOffset = markersInside1 ? -16 : 16;
        const labelX = (markersRadius1 + labelOffset) * Math.cos(angleRad);
        const labelY = (markersRadius1 + labelOffset) * Math.sin(angleRad);

        const labelElement = document.createElement('div');
        labelElement.className = 'marker-label';
        labelElement.textContent = marker.label;
        labelElement.style.cssText = `
          position: absolute;
          font-size: 10px;
          color: ${marker.color || '#fff'};
          white-space: nowrap;
          left: calc(50% + ${labelX}px);
          top: calc(50% + ${labelY}px);
          transform: translate(-50%, -50%);
          z-index: 2;
          text-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
        `;
        gauge.appendChild(labelElement);
      }

      gauge.appendChild(markerElement);
    });
  }

  // Ajouter markers pour la gauge externe (gauge 1)
  if (config2.markers) {
    const min2 = config2.min || 0;
    const max2 = config2.max || 100;
    const markersRadius2 = getMarkersRadius(config2, outerGaugeRadius, innerGaugeRadius, swapped);
    // Labels inside by default (true or undefined), outside if false
    const markersInside2 = config2.markers_inside !== false;

    config2.markers.forEach(marker => {
      const angle = valueToAngle(marker.value, min2, max2, config2.bidirectional || false, arc2.startAngle, arc2.arcLength);

      // Calcul cartésien pour positionnement précis
      const angleRad = (angle - 90) * Math.PI / 180;
      const markerX = markersRadius2 * Math.cos(angleRad);
      const markerY = markersRadius2 * Math.sin(angleRad);

      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.style.cssText = `
        position: absolute;
        width: 4px;
        height: 12px;
        background: ${marker.color || '#fff'};
        border-radius: 2px;
        left: 50%;
        top: 50%;
        transform: translate(${markerX}px, ${markerY}px) translateX(-2px) translateY(-6px) rotate(${angle - 90}deg);
        z-index: 2;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      `;

      if (marker.label) {
        const labelOffset = markersInside2 ? -16 : 16;
        const labelX = (markersRadius2 + labelOffset) * Math.cos(angleRad);
        const labelY = (markersRadius2 + labelOffset) * Math.sin(angleRad);

        const labelElement = document.createElement('div');
        labelElement.className = 'marker-label';
        labelElement.textContent = marker.label;
        labelElement.style.cssText = `
          position: absolute;
          font-size: 10px;
          color: ${marker.color || '#fff'};
          white-space: nowrap;
          left: calc(50% + ${labelX}px);
          top: calc(50% + ${labelY}px);
          transform: translate(-50%, -50%);
          z-index: 2;
          text-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
        `;
        gauge.appendChild(labelElement);
      }

      gauge.appendChild(markerElement);
    });
  }

  // Ajouter zones pour la gauge interne (gauge 0)
  if (config1.zones) {
    const min1 = config1.min || 0;
    const max1 = config1.max || 100;
    const svgSize = (innerGaugeRadius + 10) * 2;

    config1.zones.forEach(zone => {
      const startAngle = valueToAngle(zone.from, min1, max1, config1.bidirectional || false, arc1.startAngle, arc1.arcLength);
      const endAngle = valueToAngle(zone.to, min1, max1, config1.bidirectional || false, arc1.startAngle, arc1.arcLength);

      // Calculate arc angle (handle wrapping around 0°/360°)
      let arcAngle = endAngle - startAngle;
      if (arcAngle < 0) {
        arcAngle += 360;
      }

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", `${svgSize}`);
      svg.setAttribute("height", `${svgSize}`);
      svg.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        pointer-events: none;
      `;

      const circle = document.createElementNS(svgNS, "path");
      const radius = innerGaugeRadius + 5;
      const centerPoint = svgSize / 2;
      const startX = centerPoint + radius * Math.cos((startAngle - 90) * Math.PI / 180);
      const startY = centerPoint + radius * Math.sin((startAngle - 90) * Math.PI / 180);
      const endX = centerPoint + radius * Math.cos((endAngle - 90) * Math.PI / 180);
      const endY = centerPoint + radius * Math.sin((endAngle - 90) * Math.PI / 180);

      const largeArcFlag = arcAngle > 180 ? 1 : 0;
      const path = `M ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}`;

      circle.setAttribute("d", path);
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", zone.color || "#fff");
      circle.setAttribute("stroke-width", "4");
      circle.setAttribute("opacity", zone.opacity || "0.5");

      svg.appendChild(circle);
      gauge.appendChild(svg);
    });
  }

  // Ajouter zones pour la gauge externe (gauge 1)
  if (config2.zones) {
    const min2 = config2.min || 0;
    const max2 = config2.max || 100;

    config2.zones.forEach(zone => {
      const startAngle = valueToAngle(zone.from, min2, max2, config2.bidirectional || false, arc2.startAngle, arc2.arcLength);
      const endAngle = valueToAngle(zone.to, min2, max2, config2.bidirectional || false, arc2.startAngle, arc2.arcLength);

      // Calculate arc angle (handle wrapping around 0°/360°)
      let arcAngle = endAngle - startAngle;
      if (arcAngle < 0) {
        arcAngle += 360;
      }

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", `${outerGaugeSize + 20}`);
      svg.setAttribute("height", `${outerGaugeSize + 20}`);
      svg.style.cssText = `
        position: absolute;
        top: -10px;
        left: -10px;
        z-index: 1;
        pointer-events: none;
      `;

      const circle = document.createElementNS(svgNS, "path");
      const radius = outerGaugeSize / 2 + 5;
      const centerPoint = (outerGaugeSize + 20) / 2;
      const startX = centerPoint + radius * Math.cos((startAngle - 90) * Math.PI / 180);
      const startY = centerPoint + radius * Math.sin((startAngle - 90) * Math.PI / 180);
      const endX = centerPoint + radius * Math.cos((endAngle - 90) * Math.PI / 180);
      const endY = centerPoint + radius * Math.sin((endAngle - 90) * Math.PI / 180);

      const largeArcFlag = arcAngle > 180 ? 1 : 0;
      const path = `M ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}`;

      circle.setAttribute("d", path);
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", zone.color || "#fff");
      circle.setAttribute("stroke-width", "4");
      circle.setAttribute("opacity", zone.opacity || "0.5");

      svg.appendChild(circle);
      gauge.appendChild(svg);
    });
  }
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function updateLedsDual(context, value, ledsCount, prefix, gaugeConfig) {
  const min = gaugeConfig.min !== undefined ? gaugeConfig.min : 0;
  const max = gaugeConfig.max !== undefined ? gaugeConfig.max : 100;

  // Convert normalized value (0-100%) back to real value for bidirectional calculation
  const realValue = min + (value / 100) * (max - min);
  const bidirectional = gaugeConfig.bidirectional || false;
  const { arcLength } = getArcGeometry(gaugeConfig);
  const ledInfo = calculateBidirectionalLeds(realValue, min, max, ledsCount, bidirectional, arcLength);

  // Shadows and, outside `gradient_arc`, every lit LED share the colour of the value.
  const mode = gaugeConfig.severity_mode || 'steps';
  const color = getLedColor(ledInfo.normalizedValue, gaugeConfig.severity, min, max, mode);
  const arcGradient = mode === 'gradient_arc';

  // Appliquer l'ombre externe si enable_shadow est activé
  if (gaugeConfig.enable_shadow) {
    const gaugeContainer = context.shadowRoot.getElementById("gauge-container");
    if (gaugeContainer) {
      gaugeContainer.style.boxShadow = `0 0 30px 2px ${color}`;
    }
  }

  for (let i = 0; i < ledsCount; i++) {
    const led = context.shadowRoot.getElementById(`led-${prefix}-${i}`);
    if (!led) continue;

    let isActive = false;

    if (ledInfo.direction === 'unidirectional') {
      // Standard unidirectional mode: activate from the first LED of the arc onwards
      isActive = i < ledInfo.activeLeds;
    } else if (ledInfo.direction === 'positive') {
      // Bidirectional positive: activate clockwise from the reference LED
      isActive = i >= ledInfo.originIndex && i < ledInfo.originIndex + ledInfo.activeLeds;
    } else if (ledInfo.direction === 'negative') {
      // Bidirectional negative: activate counter-clockwise from the reference LED, which is
      // always lit. On a full circle the reference is LED 0 and the lower side wraps around
      // the end of the ring (99, 98, 97...).
      const distanceFromOrigin = (ledInfo.originIndex - i + ledsCount) % ledsCount;
      isActive = distanceFromOrigin < Math.max(ledInfo.activeLeds, 1);
    }

    if (isActive) {
      // In `gradient_arc` each LED is coloured after its own position on the scale, so the
      // lit part of the ring shows the whole gradient instead of one flat colour.
      const ledColor = arcGradient
        ? getLedColor(((i + 0.5) / ledsCount) * 100, gaugeConfig.severity, min, max, 'gradient')
        : color;
      led.style.display = "";
      led.style.background = `radial-gradient(circle, rgba(255, 255, 255, 0.8), ${ledColor})`;
      led.style.boxShadow = `0 0 8px ${ledColor}`;
      led.classList.add("active");
    } else {
      if (gaugeConfig.hide_inactive_leds) {
        led.style.display = "none";
      } else {
        led.style.display = "";
        led.style.background = "#333";
        led.style.boxShadow = "none";
      }
      led.classList.remove("active");
    }
  }
}

function animateValueChangeDual(context, fromValue, toValue, min, max, prefix, gaugeIndex) {
  const gaugeConfig = context.config.gauges[gaugeIndex];
  const ledsCount = prefix === 'inner' ? context.ledsCount1 : context.ledsCount2;
  const duration = gaugeConfig.animation_duration || 800;
  const steps = 20;
  const stepDuration = duration / steps;
  const valueRange = toValue - fromValue;
  const animationKey = `animationInterval${gaugeIndex + 1}`;

  if (context[animationKey]) {
    clearInterval(context[animationKey]);
  }

  let step = 0;

  context[animationKey] = setInterval(() => {
    step++;
    const progress = step / steps;
    const easedProgress = easeInOutCubic(progress);
    const currentValue = fromValue + valueRange * easedProgress;
    const normalizedValue = ((currentValue - min) / (max - min)) * 100;

    updateLedsDual(context, normalizedValue, ledsCount, prefix, gaugeConfig);
    updateCenterShadow(context, normalizedValue, gaugeConfig, prefix);

    // Calculer le rayon approprié selon la gauge
    const radius = prefix === 'inner' ? context.innerGaugeRadius : (context.outerGaugeSize / 2);
    updateOuterShadow(context, normalizedValue, gaugeConfig, prefix, radius);

    const valueDisplay = context.shadowRoot?.querySelector(`#value-${prefix}`);
    if (valueDisplay) {
      valueDisplay.textContent = currentValue.toFixed(gaugeConfig.decimals ?? 1);
    }

    if (step >= steps) {
      clearInterval(context[animationKey]);
      context[animationKey] = null;
    }
  }, stepDuration);
}

function updateCenterShadow(context, value, gaugeConfig, shadowId) {
  if (!gaugeConfig.center_shadow) return;

  const min = gaugeConfig.min !== undefined ? gaugeConfig.min : 0;
  const max = gaugeConfig.max !== undefined ? gaugeConfig.max : 100;
  const color = getLedColor(value, gaugeConfig.severity, min, max, gaugeConfig.severity_mode);
  const blur = gaugeConfig.center_shadow_blur || 30;
  const spread = gaugeConfig.center_shadow_spread || 15;
  const centerShadow = context.shadowRoot.getElementById(`center-shadow-${shadowId}`);

  if (centerShadow) {
    centerShadow.style.boxShadow = `0 0 ${blur}px ${spread}px ${color}`;
  }
}

function updateOuterShadow(context, value, gaugeConfig, shadowId, radius) {
  if (!gaugeConfig.outer_shadow) return;

  const min = gaugeConfig.min !== undefined ? gaugeConfig.min : 0;
  const max = gaugeConfig.max !== undefined ? gaugeConfig.max : 100;
  const color = getLedColor(value, gaugeConfig.severity, min, max, gaugeConfig.severity_mode);
  const blur = gaugeConfig.outer_shadow_blur || 30;
  const spread = gaugeConfig.outer_shadow_spread || 15;
  const outerShadow = context.shadowRoot.getElementById(`outer-shadow-${shadowId}`);

  if (outerShadow) {
    const diameter = radius * 2;
    outerShadow.style.width = `${diameter}px`;
    outerShadow.style.height = `${diameter}px`;
    outerShadow.style.boxShadow = `0 0 ${blur}px ${spread}px ${color}`;
  }
}

function updateDualGauge(context) {
  if (!context._hass) return;

  const config1 = context.config.gauges[0];
  const config2 = context.config.gauges[1];

  const entityState1 = context._hass.states[config1.entity];
  const entityState2 = context._hass.states[config2.entity];

  if (!entityState1 || !entityState2) return;

  const state1 = parseFloat(entityState1?.state || "0");
  const state2 = parseFloat(entityState2?.state || "0");

  const previousState1 = context.previousState1 !== null ? context.previousState1 : state1;
  const previousState2 = context.previousState2 !== null ? context.previousState2 : state2;

  // Update inner gauge
  const min1 = config1.min;
  const max1 = config1.max;

  if (config1.smooth_transitions && previousState1 !== state1) {
    animateValueChangeDual(context, previousState1, state1, min1, max1, 'inner', 0);
  } else {
    const normalizedValue1 = ((state1 - min1) / (max1 - min1)) * 100;
    updateLedsDual(context, normalizedValue1, context.ledsCount1, 'inner', config1);
    updateCenterShadow(context, normalizedValue1, config1, 'inner');
    updateOuterShadow(context, normalizedValue1, config1, 'inner', context.innerGaugeRadius);

    const valueDisplay1 = context.shadowRoot.querySelector("#value-inner");
    const unitDisplay1 = context.shadowRoot.querySelector("#unit-inner");
    if (valueDisplay1) valueDisplay1.textContent = state1.toFixed(config1.decimals ?? 1);
    if (unitDisplay1) unitDisplay1.textContent = config1.unit || "";
  }

  // Update outer gauge
  const min2 = config2.min;
  const max2 = config2.max;

  if (config2.smooth_transitions && previousState2 !== state2) {
    animateValueChangeDual(context, previousState2, state2, min2, max2, 'outer', 1);
  } else {
    const normalizedValue2 = ((state2 - min2) / (max2 - min2)) * 100;
    updateLedsDual(context, normalizedValue2, context.ledsCount2, 'outer', config2);
    updateCenterShadow(context, normalizedValue2, config2, 'outer');
    updateOuterShadow(context, normalizedValue2, config2, 'outer', context.outerGaugeSize / 2);

    const valueDisplay2 = context.shadowRoot.querySelector("#value-outer");
    const unitDisplay2 = context.shadowRoot.querySelector("#unit-outer");
    if (valueDisplay2) valueDisplay2.textContent = state2.toFixed(config2.decimals ?? 1);
    if (unitDisplay2) unitDisplay2.textContent = config2.unit || "";
  }

  context.previousState1 = state1;
  context.previousState2 = state2;
}

// ============================================================================
// CONFIG PARSER
// ============================================================================

function parseDualConfig(config) {
  if (!config.gauges || !Array.isArray(config.gauges) || config.gauges.length !== 2) {
    throw new Error("La configuration 'gauges' doit contenir exactement 2 configurations de gauge.");
  }

  config.gauges.forEach((gaugeConfig, index) => {
    if (!gaugeConfig.entity) {
      throw new Error(`La gauge ${index + 1} doit avoir une entité définie.`);
    }
  });

  const parsedGauges = config.gauges.map(gaugeConfig => {
    const arc = getArcGeometry(gaugeConfig);

    return {
      ...gaugeConfig,
      min: gaugeConfig.min !== undefined ? gaugeConfig.min : 0,
      max: gaugeConfig.max !== undefined ? gaugeConfig.max : 100,
      leds_count: gaugeConfig.leds_count || 100,
      led_size: gaugeConfig.led_size || 8,
      led_shape: gaugeConfig.led_shape === 'rect' ? 'rect' : 'round',
      led_length: gaugeConfig.led_length !== undefined ? gaugeConfig.led_length : null,
      led_corner_radius: gaugeConfig.led_corner_radius !== undefined ? gaugeConfig.led_corner_radius : 1,
      severity_mode: gaugeConfig.severity_mode || 'steps',
      decimals: gaugeConfig.decimals !== undefined ? gaugeConfig.decimals : 1,
      smooth_transitions: gaugeConfig.smooth_transitions !== false,
      animation_duration: gaugeConfig.animation_duration || 800,
      severity: gaugeConfig.severity || [
        { color: '#4caf50', value: 0 },
        { color: '#ff9800', value: 50 },
        { color: '#f44336', value: 75 }
      ],
      theme: gaugeConfig.theme || 'default',
      hide_inactive_leds: gaugeConfig.hide_inactive_leds || false,
      bidirectional: gaugeConfig.bidirectional || false,
      start_angle: arc.startAngle,
      arc_length: arc.arcLength
    };
  });

  // Everything downstream reads gauges[0] as the inner ring and gauges[1] as the outer one,
  // so swapping the pair here moves each gauge whole — LEDs, markers, zones, shadows, its
  // typography defaults and its value — onto the other ring, without rewriting the YAML.
  const parsedConfig = {
    ...config,
    swap_gauges: config.swap_gauges || false,
    value_order: getValueOrder(config),
    gauge_size: config.gauge_size || 200,
    inner_gauge_size: config.inner_gauge_size || null,
    update_interval: config.update_interval || 1000,
    power_save_mode: config.power_save_mode || false,
    debounce_updates: config.debounce_updates || false,
    hide_shadows: config.hide_shadows || false,

    gauges: config.swap_gauges ? [...parsedGauges].reverse() : parsedGauges
  };

  return parsedConfig;
}

// ============================================================================
// DUAL GAUGE CARD CLASS
// ============================================================================

class DualGaugeCard extends HTMLElement {
  setConfig(config) {
    this.config = parseDualConfig(config);

    this.previousState1 = null;
    this.previousState2 = null;
    this.updateTimer = null;
    this.isVisible = true;
    this.animationInterval1 = null;
    this.animationInterval2 = null;

    // Home Assistant calls setConfig() again whenever the configuration changes (live
    // preview in the editor), and attachShadow() throws on an element that already has one.
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    renderDual(this);

    this._updateDualGauge = () => updateDualGauge(this);

    const groupInner = this.shadowRoot.getElementById("group-inner");
    if (groupInner) {
      groupInner.addEventListener("click", (e) => {
        e.stopPropagation();
        this._showEntityHistory(this.config.gauges[0].entity);
      });
    }

    const groupOuter = this.shadowRoot.getElementById("group-outer");
    if (groupOuter) {
      groupOuter.addEventListener("click", (e) => {
        e.stopPropagation();
        this._showEntityHistory(this.config.gauges[1].entity);
      });
    }

    // setConfig() can run several times on the same element, only observe once
    if (this.config.power_save_mode && !this._visibilityObserver) {
      this._setupVisibilityObserver();
    }
  }

  set hass(hass) {
    this._hass = hass;

    if (!this.config) return;

    if (this.config.power_save_mode && !this.isVisible) return;

    if (this.config.debounce_updates) {
      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
      }

      this.updateTimer = setTimeout(() => {
        this._updateDualGauge();
      }, this.config.update_interval);
    } else {
      this._updateDualGauge();
    }
  }

  _setupVisibilityObserver() {
    this._visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && this._hass) {
            this._updateDualGauge();
          }
        });
      },
      { threshold: 0.1 }
    );

    this._visibilityObserver.observe(this);
  }

  _showEntityHistory(entityId) {
    if (!entityId || !this._hass) return;

    this.dispatchEvent(new CustomEvent("hass-more-info", {
      detail: { entityId },
      bubbles: true,
      composed: true
    }));
  }

  getCardSize() {
    return 4;
  }

  // Chargement dynamique de l'éditeur
  static async getConfigElement() {
    // Charger l'éditeur dynamiquement s'il n'est pas déjà chargé
    if (!customElements.get('dual-gauge-card-editor')) {
      // The editor is fetched at its own URL, which HACS does not version the way it
      // versions the card itself, so without this the browser keeps serving the editor of
      // the previously installed release and the new options never show up in the UI.
      const cacheBuster = `?v=${CARD_VERSION}`;

      try {
        // Détecter le chemin de base du script courant
        const currentScript = document.querySelector('script[src*="dual-gauge-card"]');
        const basePath = currentScript ? currentScript.src.replace(/\/[^\/]*$/, '/') : '/';
        
        // Charger le fichier éditeur
        await import(`${basePath}dual-gauge-card-editor.js${cacheBuster}`);
      } catch (error) {
        console.warn('Dual Gauge Card: Failed to load editor dynamically, trying fallback...', error);
        // Fallback: essayer de charger depuis le même répertoire
        try {
          await import(`./dual-gauge-card-editor.js${cacheBuster}`);
        } catch (fallbackError) {
          console.error('Dual Gauge Card: Could not load editor', fallbackError);
          // Créer un éditeur minimal qui affiche un message d'erreur
          return DualGaugeCard._createErrorEditor();
        }
      }
    }
    return document.createElement('dual-gauge-card-editor');
  }

  // Éditeur minimal en cas d'échec du chargement
  static _createErrorEditor() {
    const editor = document.createElement('div');
    editor.style.cssText = 'padding: 16px; color: var(--error-color, #f44336);';
    editor.innerHTML = `
      <p><strong>Erreur de chargement de l'éditeur</strong></p>
      <p>L'éditeur visuel n'a pas pu être chargé. Veuillez vérifier que le fichier <code>dual-gauge-card-editor.js</code> est présent dans le même répertoire que <code>dual-gauge-card.js</code>.</p>
      <p>Vous pouvez toujours configurer la carte en mode YAML.</p>
    `;
    return editor;
  }

  static getStubConfig() {
    return {
      type: 'custom:dual-gauge-card',
      name: 'Dual Gauge',
      gauge_size: 200,
      inner_gauge_size: 130,
      title_position: 'bottom',
      card_theme: 'default',
      gauges: [
        {
          entity: '',
          min: 0,
          max: 100,
          unit: '%',
          decimals: 1,
          leds_count: 80,
          led_size: 6
        },
        {
          entity: '',
          min: 0,
          max: 100,
          unit: '%',
          decimals: 1,
          leds_count: 100,
          led_size: 8
        }
      ]
    };
  }
}

// ============================================================================
// REGISTER CUSTOM ELEMENTS
// ============================================================================

console.info(
  `%c DUAL-GAUGE-CARD \n%c Version ${CARD_VERSION} `,
  'color: cyan; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

customElements.define("dual-gauge-card", DualGaugeCard);

// ============================================================================
// CARD REGISTRY FOR HOME ASSISTANT
// ============================================================================

// Déclaration de la carte pour l'afficher dans la liste des cartes disponibles
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'dual-gauge-card',
  name: 'Dual Gauge Card',
  description: 'Carte avec deux jauges LED concentriques',
  preview: true,
  documentationURL: 'https://github.com/guiohm79/custom-gauge-card'
});
