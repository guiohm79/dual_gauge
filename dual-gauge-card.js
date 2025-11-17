/**
 * Dual Gauge Card - Standalone Version (Non-compiled)
 * Version: 1.0.4
 */

// ============================================================================
// CONFIGURATION AND THEMES
// ============================================================================

const CARD_VERSION = '1.0.4';

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

function getLedColor(value, severity, min, max) {
  // Valeurs par défaut basées sur le pourcentage (0-100%)
  const defaultSeverity = [
    { color: "#4caf50", value: 20 },
    { color: "#ffeb3b", value: 50 },
    { color: "#f44336", value: 100 },
  ];

  const severityConfig = severity || defaultSeverity;

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
  cursor: pointer;
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
  font-size: var(--value-font-size);
  font-family: var(--value-font-family);
  font-weight: var(--value-font-weight);
  color: var(--value-font-color);
  transition: all 0.3s ease;
}

.unit {
  font-size: var(--unit-font-size);
  font-weight: var(--unit-font-weight);
  color: var(--unit-font-color);
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

.dual-gauge .led[id^="led-inner-"] {
  width: var(--led-size-inner);
  height: var(--led-size-inner);
}

.dual-gauge .led[id^="led-outer-"] {
  width: var(--led-size-outer);
  height: var(--led-size-outer);
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
}

.value-group.secondary {
  opacity: 0.8;
}

.value-group.secondary .value {
  font-size: calc(var(--value-font-size) * 0.7);
}

.value-group.secondary .unit {
  font-size: calc(var(--unit-font-size) * 0.85);
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

function generateLedsHTML(ledsCount, radius, ledSize, prefix = '') {
  const leds = [];
  for (let i = 0; i < ledsCount; i++) {
    const angle = (i / ledsCount) * 360 - 90;
    const translate = radius - ledSize;
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

  // Déterminer le thème global de la carte (utilise le thème de la première gauge par défaut)
  const globalTheme = context.config.card_theme ? getTheme(context.config.card_theme, context.config) : theme1;

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
    --center-size: ${innerGaugeSize * 0.6}px;
    --card-shadow: ${context.config.hide_shadows ? 'none' : '0 0 15px rgba(0, 0, 0, 0.5)'};
    --led-shadow: ${context.config.hide_shadows ? 'none' : '0 0 4px rgba(0, 0, 0, 0.8)'};
    --value-font-size: ${config1.value_font_size || '24px'};
    --value-font-family: ${config1.value_font_family || 'inherit'};
    --value-font-weight: ${config1.value_font_weight || 'bold'};
    --value-font-color: ${config1.value_font_color || theme1.textColor};
    --unit-font-size: ${config1.unit_font_size || '14px'};
    --unit-font-weight: ${config1.unit_font_weight || 'normal'};
    --unit-font-color: ${config1.unit_font_color || theme1.secondaryTextColor};
    --title-font-size: ${context.config.title_font_size || '16px'};
    --title-font-family: ${context.config.title_font_family || 'inherit'};
    --title-font-weight: ${context.config.title_font_weight || 'normal'};
    --title-font-color: ${context.config.title_font_color || globalTheme.textColor};
  `;

  // Déterminer quelle gauge est principale (par défaut: inner = gauge 0)
  const primaryGauge = context.config.primary_gauge || 'inner'; // 'inner' ou 'outer'
  const isPrimaryInner = primaryGauge === 'inner';

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
        ${generateLedsHTML(ledsCount2, outerGaugeSize / 2, ledSize2, 'outer')}
        ${generateLedsHTML(ledsCount1, innerGaugeRadius, ledSize1, 'inner')}
        <div class="center dual-center" style="background: ${globalTheme.centerBackground}">
          <div class="value-group ${isPrimaryInner ? '' : 'secondary'}">
            <div class="value" id="value-inner">0</div>
            <div class="unit" id="unit-inner"></div>
          </div>
          <div class="value-group ${isPrimaryInner ? 'secondary' : ''}">
            <div class="value" id="value-outer">0</div>
            <div class="unit" id="unit-outer"></div>
          </div>
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

  // Ajouter markers pour la gauge interne (gauge 0)
  if (config1.markers) {
    const min1 = config1.min || 0;
    const max1 = config1.max || 100;
    const range1 = max1 - min1;
    const markersRadius1 = config1.markers_radius !== undefined
      ? config1.markers_radius
      : innerGaugeRadius;

    config1.markers.forEach(marker => {
      const percentage = ((marker.value - min1) / range1) * 100;
      const angle = (percentage / 100) * 360;

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
        const labelX = (markersRadius1 + 10) * Math.cos(angleRad);
        const labelY = (markersRadius1 + 10) * Math.sin(angleRad);

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
    const range2 = max2 - min2;
    const markersRadius2 = config2.markers_radius !== undefined
      ? config2.markers_radius
      : (outerGaugeSize / 2);

    config2.markers.forEach(marker => {
      const percentage = ((marker.value - min2) / range2) * 100;
      const angle = (percentage / 100) * 360;

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
        const labelX = (markersRadius2 + 10) * Math.cos(angleRad);
        const labelY = (markersRadius2 + 10) * Math.sin(angleRad);

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
    const range1 = max1 - min1;
    const svgSize = (innerGaugeRadius + 10) * 2;

    config1.zones.forEach(zone => {
      const startPercentage = ((zone.from - min1) / range1) * 100;
      const endPercentage = ((zone.to - min1) / range1) * 100;
      const startAngle = (startPercentage / 100) * 360;
      const endAngle = (endPercentage / 100) * 360;
      const arcAngle = endAngle - startAngle;

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
    const range2 = max2 - min2;

    config2.zones.forEach(zone => {
      const startPercentage = ((zone.from - min2) / range2) * 100;
      const endPercentage = ((zone.to - min2) / range2) * 100;
      const startAngle = (startPercentage / 100) * 360;
      const endAngle = (endPercentage / 100) * 360;
      const arcAngle = endAngle - startAngle;

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
  const activeLeds = Math.round((value / 100) * ledsCount);
  const min = gaugeConfig.min !== undefined ? gaugeConfig.min : 0;
  const max = gaugeConfig.max !== undefined ? gaugeConfig.max : 100;
  const color = getLedColor(value, gaugeConfig.severity, min, max);

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

    if (i < activeLeds) {
      led.style.display = "";
      led.style.background = `radial-gradient(circle, rgba(255, 255, 255, 0.8), ${color})`;
      led.style.boxShadow = `0 0 8px ${color}`;
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
      valueDisplay.textContent = currentValue.toFixed(gaugeConfig.decimals || 1);
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
  const color = getLedColor(value, gaugeConfig.severity, min, max);
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
  const color = getLedColor(value, gaugeConfig.severity, min, max);
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
    if (valueDisplay1) valueDisplay1.textContent = state1.toFixed(config1.decimals || 1);
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
    if (valueDisplay2) valueDisplay2.textContent = state2.toFixed(config2.decimals || 1);
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

  const parsedConfig = {
    ...config,
    gauge_size: config.gauge_size || 200,
    inner_gauge_size: config.inner_gauge_size || null,
    update_interval: config.update_interval || 1000,
    power_save_mode: config.power_save_mode || false,
    debounce_updates: config.debounce_updates || false,
    hide_shadows: config.hide_shadows || false,

    gauges: config.gauges.map(gaugeConfig => ({
      ...gaugeConfig,
      min: gaugeConfig.min !== undefined ? gaugeConfig.min : 0,
      max: gaugeConfig.max !== undefined ? gaugeConfig.max : 100,
      leds_count: gaugeConfig.leds_count || 100,
      led_size: gaugeConfig.led_size || 8,
      decimals: gaugeConfig.decimals !== undefined ? gaugeConfig.decimals : 1,
      smooth_transitions: gaugeConfig.smooth_transitions !== false,
      animation_duration: gaugeConfig.animation_duration || 800,
      severity: gaugeConfig.severity || [
        { color: '#4caf50', value: 0 },
        { color: '#ff9800', value: 50 },
        { color: '#f44336', value: 75 }
      ],
      theme: gaugeConfig.theme || 'default',
      hide_inactive_leds: gaugeConfig.hide_inactive_leds || false
    }))
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

    this.attachShadow({ mode: "open" });
    renderDual(this);

    this._updateDualGauge = () => updateDualGauge(this);

    this.shadowRoot
      .getElementById("gauge-container")
      .addEventListener("click", (e) => {
        this._showEntityHistory(this.config.gauges[0].entity);
      });

    if (this.config.power_save_mode) {
      this._setupVisibilityObserver();
    }
  }

  set hass(hass) {
    this._hass = hass;

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
    const observer = new IntersectionObserver(
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

    observer.observe(this);
  }

  _showEntityHistory(entityId) {
    if (!entityId || !this._hass) return;

    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  getCardSize() {
    return 4;
  }
}

// ============================================================================
// REGISTER CUSTOM ELEMENT
// ============================================================================

console.info(
  `%c DUAL-GAUGE-CARD \n%c Version ${CARD_VERSION} `,
  'color: cyan; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

customElements.define("dual-gauge-card", DualGaugeCard);
