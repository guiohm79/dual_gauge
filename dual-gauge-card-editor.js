/**
 * Dual Gauge Card Editor - Visual Configuration Editor
 * Version: 1.3.0
 * 
 * This file is dynamically loaded by dual-gauge-card.js
 * when the user opens the visual editor.
 */

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    // General
    cardName: 'Card Name',
    generalConfig: 'General Configuration',
    innerGauge: 'Inner Gauge',
    outerGauge: 'Outer Gauge',
    
    // Sizes
    outerGaugeSize: 'Outer Gauge Size (px)',
    innerGaugeSize: 'Inner Gauge Size (px)',
    innerGaugeRadius: 'Inner Radius (px)',
    
    // Position and theme
    titlePosition: 'Title Position',
    cardTheme: 'Card Theme',
    positionBottom: 'Bottom',
    positionTop: 'Top',
    positionInsideTop: 'Inside Top',
    positionInsideBottom: 'Inside Bottom',
    positionNone: 'None',
    themeDefault: 'Default',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeCustom: 'Custom',
    
    // Options
    hideCard: 'Hide card frame (transparent mode)',
    powerSaveMode: 'Power save mode',
    debounceUpdates: 'Limit update frequency',
    hideShadows: 'Hide shadows',
    updateInterval: 'Update interval (ms)',
    
    // Custom theme
    customThemeColors: 'Custom Theme Colors',
    cardBackground: 'Card Background',
    gaugeBackground: 'Gauge Background',
    centerBackground: 'Center Background',
    primaryTextColor: 'Primary Text Color',
    secondaryTextColor: 'Secondary Text Color',
    
    // Title typography
    titleTypography: 'Title Typography',
    fontSize: 'Font Size',
    fontFamily: 'Font Family',
    fontWeight: 'Font Weight',
    titleColor: 'Title Color',
    cardBackgroundCss: 'Card Background (CSS)',
    
    // Transparency
    transparencyOptions: 'Transparency Options',
    transparencyHelp: 'These options override colors with transparent, taking priority over theme settings.',
    transparentCardBg: 'Transparent card background',
    transparentGaugeBg: 'Transparent gauge background',
    transparentCenterBg: 'Transparent center background',
    
    // Entity and values
    entity: 'Entity *',
    minValue: 'Minimum Value',
    maxValue: 'Maximum Value',
    unit: 'Unit',
    decimals: 'Decimals',
    ledsCount: 'LEDs Count',
    ledSize: 'LED Size (px)',
    theme: 'Theme',
    animationDuration: 'Animation Duration (ms)',
    
    // Gauge options
    bidirectionalMode: 'Bidirectional Mode',
    hideInactiveLeds: 'Hide Inactive LEDs',
    smoothTransitions: 'Smooth Transitions',
    centerShadow: 'Center Shadow',
    outerShadow: 'Outer Shadow',
    centerShadowBlur: 'Center Shadow Blur',
    centerShadowSpread: 'Center Shadow Spread',
    outerShadowBlur: 'Outer Shadow Blur',
    outerShadowSpread: 'Outer Shadow Spread',
    
    // Severity
    severityThresholds: 'Color Thresholds (Severity)',
    severityHelp: 'Define colors based on values. The first corresponds to the minimum value.',
    addThreshold: '+ Add Threshold',
    
    // Markers
    markers: 'Markers',
    markersRadius: 'Markers Radius (px)',
    markersInside: 'Labels Inside',
    addMarker: '+ Add Marker',
    
    // Zones
    coloredZones: 'Colored Zones',
    addZone: '+ Add Zone',
    from: 'From',
    to: 'To',
    opacity: 'Opacity',
    
    // Typography
    valueUnitTypography: 'Value & Unit Typography',
    valueFont: 'Value Font',
    valueSize: 'Value Size',
    valueWeight: 'Value Weight',
    valueColor: 'Value Color',
    unitFont: 'Unit Font',
    unitSize: 'Unit Size',
    unitWeight: 'Unit Weight',
    unitColor: 'Unit Color',
    
    // Weight values
    weightNormal: 'Normal',
    weightBold: 'Bold',
    weightLight: 'Light',
    weightAuto: 'Auto',
    
    // Others
    label: 'Label',
    color: 'Color',
    value: 'Value',
    selectEntity: 'Select an entity'
  }
};

// ============================================================================
// VISUAL EDITOR CLASS
// ============================================================================

class DualGaugeCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass = null;
    this._hasRendered = false;
  }

  setConfig(config) {
    // Clone the config because the object passed by Home Assistant is frozen
    // and cannot be modified directly
    config = config ? JSON.parse(JSON.stringify(config)) : {};
    
    // Ensure type is present
    if (!config.type) {
      config.type = 'custom:dual-gauge-card';
    }
    
    // Set language (always English)
    this._lang = 'en';
    
    // Translation function
    this._t = (key) => {
      return translations['en']?.[key] || key;
    };
    
    // Ensure gauges exists with a deep copy
    if (!config.gauges) {
      config.gauges = [{}, {}];
    } else {
      // Clone each gauge to avoid shared references
      config.gauges = config.gauges.map(g => ({ ...g }));
    }
    
    const isFirstRender = !this._config;
    
    // Compare configs to see if re-render is necessary
    const shouldRender = isFirstRender || this._shouldReRender(this._config, config);
    
    this._config = config;
    
    if (shouldRender) {
      this._render();
    } else {
      // Update field values without full re-render
      this._updateAllFieldValues();
    }
  }

  _shouldReRender(oldConfig, newConfig) {
    if (!oldConfig) return true;
    
    // Check if the number of items in lists has changed
    for (let i = 0; i < 2; i++) {
      const oldGauge = oldConfig.gauges?.[i] || {};
      const newGauge = newConfig.gauges?.[i] || {};
      
      // Check severity
      const oldSeverity = (oldGauge.severity || []).length;
      const newSeverity = (newGauge.severity || []).length;
      if (oldSeverity !== newSeverity) return true;
      
      // Check markers
      const oldMarkers = (oldGauge.markers || []).length;
      const newMarkers = (newGauge.markers || []).length;
      if (oldMarkers !== newMarkers) return true;
      
      // Check zones
      const oldZones = (oldGauge.zones || []).length;
      const newZones = (newGauge.zones || []).length;
      if (oldZones !== newZones) return true;
    }
    
    // Check if key fields have changed (other than simple values)
    const keysToCheck = ['gauge_size', 'inner_gauge_size', 'title_position', 'card_theme'];
    for (const key of keysToCheck) {
      if (oldConfig[key] !== newConfig[key]) return true;
    }
    
    return false;
  }

  _updatePickerValues() {
    // Entity pickers are now simple text inputs
    // Values are updated via _updateAllFieldValues()
  }

  _updateAllFieldValues() {
    // Update all field values without re-rendering
    if (!this._config) return;
    
    const config = this._config;
    
    // General fields
    const setValue = (id, value) => {
      const el = this.shadowRoot.getElementById(id);
      if (el && el.value !== value) {
        el.value = value;
      }
    };
    
    const setChecked = (id, checked) => {
      const el = this.shadowRoot.getElementById(id);
      if (el && el.checked !== checked) {
        el.checked = checked;
      }
    };
    
    setValue('name', config.name || '');
    setValue('gauge_size', config.gauge_size || 200);
    setValue('inner_gauge_size', config.inner_gauge_size || 130);
    setValue('inner_gauge_radius', config.inner_gauge_radius || 65);
    setValue('title_position', config.title_position || 'bottom');
    setValue('card_theme', config.card_theme || 'default');
    
    setChecked('hide_card', config.hide_card || false);
    setChecked('power_save_mode', config.power_save_mode || false);
    setChecked('debounce_updates', config.debounce_updates || false);
    setChecked('hide_shadows', config.hide_shadows || false);
    setValue('update_interval', config.update_interval || 1000);
    
    // For each gauge
    for (let i = 0; i < 2; i++) {
      const gauge = config.gauges?.[i] || {};
      
      // Numeric and text values
      setValue(`gauge${i}_entity`, gauge.entity || '');
      setValue(`gauge${i}_min`, gauge.min ?? 0);
      setValue(`gauge${i}_max`, gauge.max ?? 100);
      setValue(`gauge${i}_unit`, gauge.unit || '');
      setValue(`gauge${i}_decimals`, gauge.decimals ?? 1);
      setValue(`gauge${i}_leds_count`, gauge.leds_count || (i === 0 ? 80 : 100));
      setValue(`gauge${i}_led_size`, gauge.led_size || (i === 0 ? 6 : 8));
      setValue(`gauge${i}_markers_radius`, gauge.markers_radius !== undefined ? gauge.markers_radius : '');
      setChecked(`gauge${i}_markers_inside`, gauge.markers_inside !== false);
      setValue(`gauge${i}_theme`, gauge.theme || 'default');
      setValue(`gauge${i}_animation_duration`, gauge.animation_duration || 800);
      
      // Checkboxes
      setChecked(`gauge${i}_bidirectional`, gauge.bidirectional || false);
      setChecked(`gauge${i}_hide_inactive_leds`, gauge.hide_inactive_leds || false);
      setChecked(`gauge${i}_smooth_transitions`, gauge.smooth_transitions !== false);
      setChecked(`gauge${i}_center_shadow`, gauge.center_shadow || false);
      setChecked(`gauge${i}_outer_shadow`, gauge.outer_shadow || false);
      
      // Shadows
      setValue(`gauge${i}_center_shadow_blur`, gauge.center_shadow_blur || 30);
      setValue(`gauge${i}_center_shadow_spread`, gauge.center_shadow_spread || 15);
      setValue(`gauge${i}_outer_shadow_blur`, gauge.outer_shadow_blur || 30);
      setValue(`gauge${i}_outer_shadow_spread`, gauge.outer_shadow_spread || 15);
      
      // Value typography
      setValue(`gauge${i}_value_font_family`, gauge.value_font_family || '');
      // Normalize size for display (add px if just a number)
      const displayValueSize = gauge.value_font_size ? 
        (/^\d+(\.\d+)?$/.test(gauge.value_font_size.trim()) ? gauge.value_font_size.trim() + 'px' : gauge.value_font_size) : '';
      setValue(`gauge${i}_value_font_size`, displayValueSize);
      setValue(`gauge${i}_value_font_weight`, gauge.value_font_weight || '');
      setValue(`gauge${i}_value_font_color`, gauge.value_font_color || '#ffffff');
      setValue(`gauge${i}_value_font_color_text`, gauge.value_font_color || '');
      
      // Unit typography
      setValue(`gauge${i}_unit_font_family`, gauge.unit_font_family || '');
      // Normalize size for display
      const displayUnitSize = gauge.unit_font_size ? 
        (/^\d+(\.\d+)?$/.test(gauge.unit_font_size.trim()) ? gauge.unit_font_size.trim() + 'px' : gauge.unit_font_size) : '';
      setValue(`gauge${i}_unit_font_size`, displayUnitSize);
      setValue(`gauge${i}_unit_font_weight`, gauge.unit_font_weight || '');
      setValue(`gauge${i}_unit_font_color`, gauge.unit_font_color || '#dddddd');
      setValue(`gauge${i}_unit_font_color_text`, gauge.unit_font_color || '');
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    
    // If hass is set for the first time and we already have a config, render
    if (!oldHass && hass && this._config && !this._hasRendered) {
      this._hasRendered = true;
      this._render();
    }
    
    // Update entity select options if hass is now available and we have a rendered shadowRoot
    if (hass && this.shadowRoot && this._hasRendered) {
      this._updateEntitySelects();
    }
  }

  _updateEntitySelects() {
    // Update entity select options when hass becomes available
    if (!this._hass || !this._hass.states) return;
    
    for (let i = 0; i < 2; i++) {
      const select = this.shadowRoot.getElementById(`gauge${i}_entity`);
      if (select) {
        const currentValue = this._config?.gauges?.[i]?.entity || '';
        const optionsHtml = this._renderEntityOptions(currentValue);
        select.innerHTML = optionsHtml;
      }
    }
  }

  get hass() {
    return this._hass;
  }

  _render() {
    this._hasRendered = true;
    const config = this._config || {};
    const gauge0 = config.gauges?.[0] || {};
    const gauge1 = config.gauges?.[1] || {};

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          --editor-primary-color: var(--primary-color, #03a9f4);
          --editor-text-color: var(--primary-text-color, #e0e0e0);
          --editor-secondary-text: var(--secondary-text-color, #9e9e9e);
          --editor-bg-color: var(--card-background-color, #1c1c1c);
          --editor-divider: var(--divider-color, rgba(255,255,255,0.12));
          --editor-input-bg: var(--input-fill-color, #2c2c2c);
          --editor-border: var(--outline-color, rgba(255,255,255,0.2));
        }
        .section {
          margin-bottom: 16px;
          padding: 16px;
          border: 1px solid var(--editor-divider);
          border-radius: 12px;
          background: var(--editor-bg-color);
          color: var(--editor-text-color);
        }
        .section-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--editor-primary-color);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 1px solid var(--editor-divider);
          padding-bottom: 8px;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
          align-items: flex-end;
        }
        .row:last-child {
          margin-bottom: 0;
        }
        .field {
          flex: 1;
          min-width: 140px;
        }
        .field.full {
          flex: 1 0 100%;
        }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--editor-secondary-text);
          margin-bottom: 6px;
        }
        .field input,
        .field select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--editor-border);
          border-radius: 6px;
          background: var(--editor-input-bg);
          color: var(--editor-text-color);
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .field input:focus,
        .field select:focus {
          outline: none;
          border-color: var(--editor-primary-color);
        }
        .field input[type="number"] {
          width: 100%;
        }
        .field input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin: 0;
          accent-color: var(--editor-primary-color);
        }
        .field.checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 40px;
        }
        .field.checkbox label {
          margin-bottom: 0;
          color: var(--editor-text-color);
          font-weight: 400;
        }
        .gauge-section {
          border-left: 4px solid var(--editor-primary-color);
        }
        .gauge-section.outer {
          border-left-color: #ff9800;
        }
        .sub-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px dashed var(--editor-divider);
        }
        .sub-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--editor-text-color);
          margin-bottom: 12px;
        }
        .color-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .color-row input[type="color"] {
          width: 44px;
          height: 36px;
          padding: 2px;
          border: 1px solid var(--editor-border);
          border-radius: 6px;
          cursor: pointer;
          background: var(--editor-input-bg);
        }
        .color-row input[type="text"] {
          flex: 1;
          min-width: 80px;
        }
        .color-row input[type="number"] {
          width: 90px;
        }
        .add-btn, .remove-btn {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s;
          background: var(--editor-primary-color);
          color: white;
        }
        .add-btn:hover, .remove-btn:hover {
          opacity: 0.85;
        }
        .remove-btn {
          background: #e74c3c;
          padding: 8px 14px;
          font-size: 14px;
          line-height: 1;
        }
        .severity-list, .markers-list, .zones-list {
          margin-top: 12px;
        }
        .severity-item, .marker-item, .zone-item {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          align-items: center;
          padding: 8px;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
        }
        .severity-item input,
        .marker-item input,
        .zone-item input {
          background: var(--editor-input-bg);
          border: 1px solid var(--editor-border);
          border-radius: 4px;
          padding: 6px 10px;
          color: var(--editor-text-color);
          font-size: 13px;
        }
        .entity-picker-wrapper {
          flex: 1;
          min-width: 200px;
        }
        .help-text {
          font-size: 11px;
          color: var(--editor-secondary-text);
          margin-top: 6px;
          font-style: italic;
          line-height: 1.4;
        }
        /* Specific styles for dynamic lists */
        .severity-item input[data-field="value"],
        .marker-item input[data-field="value"] {
          width: 80px;
        }
        .zone-item input[data-field="from"],
        .zone-item input[data-field="to"] {
          width: 70px;
        }
        .zone-item input[data-field="opacity"] {
          width: 70px;
        }
      </style>

      <div class="section">
        <div class="section-title">${this._t('generalConfig')}</div>
        
        <div class="row">
          <div class="field full">
            <label>${this._t('cardName')}</label>
            <input type="text" id="name" value="${config.name || ''}" placeholder="Dual Gauge">
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label>${this._t('outerGaugeSize')}</label>
            <input type="number" id="gauge_size" value="${config.gauge_size || 200}" min="100" max="400">
          </div>
          <div class="field">
            <label>${this._t('innerGaugeSize')}</label>
            <input type="number" id="inner_gauge_size" value="${config.inner_gauge_size || 130}" min="80" max="300">
          </div>
          <div class="field">
            <label>${this._t('innerGaugeRadius')}</label>
            <input type="number" id="inner_gauge_radius" value="${config.inner_gauge_radius || 65}" min="40" max="150">
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label>${this._t('titlePosition')}</label>
            <select id="title_position">
              <option value="bottom" ${config.title_position === 'bottom' ? 'selected' : ''}>${this._t('positionBottom')}</option>
              <option value="top" ${config.title_position === 'top' ? 'selected' : ''}>${this._t('positionTop')}</option>
              <option value="inside-top" ${config.title_position === 'inside-top' ? 'selected' : ''}>${this._t('positionInsideTop')}</option>
              <option value="inside-bottom" ${config.title_position === 'inside-bottom' ? 'selected' : ''}>${this._t('positionInsideBottom')}</option>
              <option value="none" ${config.title_position === 'none' ? 'selected' : ''}>${this._t('positionNone')}</option>
            </select>
          </div>
          <div class="field">
            <label>${this._t('cardTheme')}</label>
            <select id="card_theme">
              <option value="default" ${config.card_theme === 'default' ? 'selected' : ''}>${this._t('themeDefault')}</option>
              <option value="light" ${config.card_theme === 'light' ? 'selected' : ''}>${this._t('themeLight')}</option>
              <option value="dark" ${config.card_theme === 'dark' ? 'selected' : ''}>${this._t('themeDark')}</option>
              <option value="custom" ${config.card_theme === 'custom' ? 'selected' : ''}>${this._t('themeCustom')}</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="field checkbox">
            <input type="checkbox" id="hide_card" ${config.hide_card ? 'checked' : ''}>
            <label for="hide_card">${this._t('hideCard')}</label>
          </div>
          <div class="field checkbox">
            <input type="checkbox" id="power_save_mode" ${config.power_save_mode ? 'checked' : ''}>
            <label for="power_save_mode">${this._t('powerSaveMode')}</label>
          </div>
          <div class="field checkbox">
            <input type="checkbox" id="debounce_updates" ${config.debounce_updates ? 'checked' : ''}>
            <label for="debounce_updates">${this._t('debounceUpdates')}</label>
          </div>
        </div>

        <div class="row">
          <div class="field checkbox">
            <input type="checkbox" id="hide_shadows" ${config.hide_shadows ? 'checked' : ''}>
            <label for="hide_shadows">${this._t('hideShadows')}</label>
          </div>
          <div class="field">
            <label>${this._t('updateInterval')}</label>
            <input type="number" id="update_interval" value="${config.update_interval || 1000}" min="100" max="10000" step="100">
          </div>
        </div>
      </div>

      ${this._renderCustomThemeSection(config)}
      ${this._renderTitleTypographySection(config)}
      ${this._renderTransparencySection(config)}

      ${this._renderGaugeSection(0, gauge0, this._t('innerGauge'), 'inner')}
      ${this._renderGaugeSection(1, gauge1, this._t('outerGauge'), 'outer')}
    `;

    // Assign hass and values to entity pickers after rendering
    this._updateEntityPickers();
    
    this._attachListeners();
  }

  _updateEntityPickers() {
    // Entity pickers are now select dropdowns
    this._updateEntitySelects();
  }

  _renderCustomThemeSection(config) {
    const isCustom = config.card_theme === 'custom';
    return `
      <div class="section" id="custom_theme_section" style="display: ${isCustom ? 'block' : 'none'};">
        <div class="section-title">${this._t('customThemeColors')}</div>
        
        <div class="row">
          <div class="field">
            <label>${this._t('cardBackground')}</label>
            <div class="color-row">
              <input type="color" id="custom_background" value="${config.custom_background || '#222222'}" data-field="color">
              <input type="text" id="custom_background_text" value="${config.custom_background || '#222222'}" placeholder="#222222" data-field="color_text">
            </div>
          </div>
          <div class="field">
            <label>${this._t('gaugeBackground')}</label>
            <div class="color-row">
              <input type="color" id="custom_gauge_background" value="${config.custom_gauge_background?.startsWith('#') ? config.custom_gauge_background : '#444444'}" data-field="color">
              <input type="text" id="custom_gauge_background_text" value="${config.custom_gauge_background || '#444444'}" placeholder="#444444 or gradient" data-field="color_text">
            </div>
          </div>
          <div class="field">
            <label>${this._t('centerBackground')}</label>
            <div class="color-row">
              <input type="color" id="custom_center_background" value="${config.custom_center_background?.startsWith('#') ? config.custom_center_background : '#333333'}" data-field="color">
              <input type="text" id="custom_center_background_text" value="${config.custom_center_background || '#333333'}" placeholder="#333333 or gradient" data-field="color_text">
            </div>
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label>${this._t('primaryTextColor')}</label>
            <div class="color-row">
              <input type="color" id="custom_text_color" value="${config.custom_text_color || '#ffffff'}" data-field="color">
              <input type="text" id="custom_text_color_text" value="${config.custom_text_color || '#ffffff'}" placeholder="#ffffff" data-field="color_text">
            </div>
          </div>
          <div class="field">
            <label>${this._t('secondaryTextColor')}</label>
            <div class="color-row">
              <input type="color" id="custom_secondary_text_color" value="${config.custom_secondary_text_color || '#dddddd'}" data-field="color">
              <input type="text" id="custom_secondary_text_color_text" value="${config.custom_secondary_text_color || '#dddddd'}" placeholder="#dddddd" data-field="color_text">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderTitleTypographySection(config) {
    return `
      <div class="section">
        <div class="section-title">${this._t('titleTypography')}</div>
        
        <div class="row">
          <div class="field">
            <label>${this._t('fontSize')}</label>
            <input type="text" id="title_font_size" value="${config.title_font_size || '16px'}" placeholder="16px">
          </div>
          <div class="field">
            <label>${this._t('fontFamily')}</label>
            <input type="text" id="title_font_family" value="${config.title_font_family || ''}" placeholder="inherit">
          </div>
          <div class="field">
            <label>${this._t('fontWeight')}</label>
            <select id="title_font_weight">
              <option value="normal" ${config.title_font_weight === 'normal' ? 'selected' : ''}>${this._t('weightNormal')}</option>
              <option value="bold" ${config.title_font_weight === 'bold' ? 'selected' : ''}>${this._t('weightBold')}</option>
              <option value="lighter" ${config.title_font_weight === 'lighter' ? 'selected' : ''}>${this._t('weightLight')}</option>
              <option value="100" ${config.title_font_weight === '100' ? 'selected' : ''}>100</option>
              <option value="200" ${config.title_font_weight === '200' ? 'selected' : ''}>200</option>
              <option value="300" ${config.title_font_weight === '300' ? 'selected' : ''}>300</option>
              <option value="400" ${config.title_font_weight === '400' ? 'selected' : ''}>400</option>
              <option value="500" ${config.title_font_weight === '500' ? 'selected' : ''}>500</option>
              <option value="600" ${config.title_font_weight === '600' ? 'selected' : ''}>600</option>
              <option value="700" ${config.title_font_weight === '700' ? 'selected' : ''}>700</option>
              <option value="800" ${config.title_font_weight === '800' ? 'selected' : ''}>800</option>
              <option value="900" ${config.title_font_weight === '900' ? 'selected' : ''}>900</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label>${this._t('titleColor')}</label>
            <div class="color-row">
              <input type="color" id="title_font_color" value="${config.title_font_color || '#ffffff'}" data-field="color">
              <input type="text" id="title_font_color_text" value="${config.title_font_color || ''}" placeholder="Auto" data-field="color_text">
            </div>
          </div>
          <div class="field">
            <label>${this._t('cardBackgroundCss')}</label>
            <input type="text" id="card_background" value="${config.card_background || ''}" placeholder="e.g. #222 or gradient">
          </div>
        </div>
      </div>
    `;
  }

  _renderTransparencySection(config) {
    return `
      <div class="section">
        <div class="section-title">${this._t('transparencyOptions')}</div>
        <div class="help-text">${this._t('transparencyHelp')}</div>
        
        <div class="row">
          <div class="field checkbox">
            <input type="checkbox" id="transparent_card_background" ${config.transparent_card_background ? 'checked' : ''}>
            <label for="transparent_card_background">${this._t('transparentCardBg')}</label>
          </div>
          <div class="field checkbox">
            <input type="checkbox" id="transparent_gauge_background" ${config.transparent_gauge_background ? 'checked' : ''}>
            <label for="transparent_gauge_background">${this._t('transparentGaugeBg')}</label>
          </div>
          <div class="field checkbox">
            <input type="checkbox" id="transparent_center_background" ${config.transparent_center_background ? 'checked' : ''}>
            <label for="transparent_center_background">${this._t('transparentCenterBg')}</label>
          </div>
        </div>
      </div>
    `;
  }

  _renderEntityOptions(selectedEntity) {
    if (!this._hass || !this._hass.states) {
      return `<option value="">${this._t('selectEntity')}</option>`;
    }
    
    const entities = Object.keys(this._hass.states).sort();
    const options = entities.map(entityId => {
      const selected = entityId === selectedEntity ? 'selected' : '';
      return `<option value="${entityId}" ${selected}>${entityId}</option>`;
    }).join('');
    
    return `<option value="">-- ${this._t('selectEntity')} --</option>${options}`;
  }

  _renderGaugeSection(index, gauge, title, cssClass) {
    const severity = gauge.severity || [
      { color: '#4caf50', value: 0 },
      { color: '#ff9800', value: 50 },
      { color: '#f44336', value: 75 }
    ];
    const markers = gauge.markers || [];
    const zones = gauge.zones || [];

    return `
      <div class="section gauge-section ${cssClass}">
        <div class="section-title">${title}</div>
        
        <div class="row">
          <div class="field full">
            <label>${this._t('entity')}</label>
            <select id="gauge${index}_entity">
              ${this._renderEntityOptions(gauge.entity)}
            </select>
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label>${this._t('minValue')}</label>
            <input type="number" id="gauge${index}_min" value="${gauge.min !== undefined ? gauge.min : 0}" step="any">
          </div>
          <div class="field">
            <label>${this._t('maxValue')}</label>
            <input type="number" id="gauge${index}_max" value="${gauge.max !== undefined ? gauge.max : 100}" step="any">
          </div>
          <div class="field">
            <label>${this._t('unit')}</label>
            <input type="text" id="gauge${index}_unit" value="${gauge.unit || ''}" placeholder="%">
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label>${this._t('decimals')}</label>
            <input type="number" id="gauge${index}_decimals" value="${gauge.decimals !== undefined ? gauge.decimals : 1}" min="0" max="5">
          </div>
          <div class="field">
            <label>${this._t('ledsCount')}</label>
            <input type="number" id="gauge${index}_leds_count" value="${gauge.leds_count || (index === 0 ? 80 : 100)}" min="10" max="200">
          </div>
          <div class="field">
            <label>${this._t('ledSize')}</label>
            <input type="number" id="gauge${index}_led_size" value="${gauge.led_size || (index === 0 ? 6 : 8)}" min="2" max="20">
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label>${this._t('theme')}</label>
            <select id="gauge${index}_theme">
              <option value="default" ${gauge.theme === 'default' ? 'selected' : ''}>${this._t('themeDefault')}</option>
              <option value="light" ${gauge.theme === 'light' ? 'selected' : ''}>${this._t('themeLight')}</option>
              <option value="dark" ${gauge.theme === 'dark' ? 'selected' : ''}>${this._t('themeDark')}</option>
              <option value="custom" ${gauge.theme === 'custom' ? 'selected' : ''}>${this._t('themeCustom')}</option>
            </select>
          </div>
          <div class="field">
            <label>${this._t('animationDuration')}</label>
            <input type="number" id="gauge${index}_animation_duration" value="${gauge.animation_duration || 800}" min="0" max="5000" step="100">
          </div>
        </div>

        <div class="row">
          <div class="field checkbox">
            <input type="checkbox" id="gauge${index}_bidirectional" ${gauge.bidirectional ? 'checked' : ''}>
            <label for="gauge${index}_bidirectional">${this._t('bidirectionalMode')}</label>
          </div>
          <div class="field checkbox">
            <input type="checkbox" id="gauge${index}_hide_inactive_leds" ${gauge.hide_inactive_leds ? 'checked' : ''}>
            <label for="gauge${index}_hide_inactive_leds">${this._t('hideInactiveLeds')}</label>
          </div>
          <div class="field checkbox">
            <input type="checkbox" id="gauge${index}_smooth_transitions" ${gauge.smooth_transitions !== false ? 'checked' : ''}>
            <label for="gauge${index}_smooth_transitions">${this._t('smoothTransitions')}</label>
          </div>
        </div>

        <div class="row">
          <div class="field checkbox">
            <input type="checkbox" id="gauge${index}_center_shadow" ${gauge.center_shadow ? 'checked' : ''}>
            <label for="gauge${index}_center_shadow">${this._t('centerShadow')}</label>
          </div>
          <div class="field checkbox">
            <input type="checkbox" id="gauge${index}_outer_shadow" ${gauge.outer_shadow ? 'checked' : ''}>
            <label for="gauge${index}_outer_shadow">${this._t('outerShadow')}</label>
          </div>
        </div>

        <div class="row" id="gauge${index}_center_shadow_options" style="display: ${gauge.center_shadow ? 'flex' : 'none'};">
          <div class="field">
            <label>${this._t('centerShadowBlur')}</label>
            <input type="number" id="gauge${index}_center_shadow_blur" value="${gauge.center_shadow_blur || 30}" min="0" max="100">
          </div>
          <div class="field">
            <label>${this._t('centerShadowSpread')}</label>
            <input type="number" id="gauge${index}_center_shadow_spread" value="${gauge.center_shadow_spread || 15}" min="0" max="100">
          </div>
        </div>

        <div class="row" id="gauge${index}_outer_shadow_options" style="display: ${gauge.outer_shadow ? 'flex' : 'none'};">
          <div class="field">
            <label>${this._t('outerShadowBlur')}</label>
            <input type="number" id="gauge${index}_outer_shadow_blur" value="${gauge.outer_shadow_blur || 30}" min="0" max="100">
          </div>
          <div class="field">
            <label>${this._t('outerShadowSpread')}</label>
            <input type="number" id="gauge${index}_outer_shadow_spread" value="${gauge.outer_shadow_spread || 15}" min="0" max="100">
          </div>
        </div>

        <div class="sub-section">
          <div class="sub-title">${this._t('severityThresholds')}</div>
          <div class="help-text">${this._t('severityHelp')}</div>
          <div class="severity-list" id="gauge${index}_severity_list">
            ${severity.map((s, i) => `
              <div class="severity-item" data-index="${i}">
                <input type="color" value="${s.color}" data-field="color">
                <input type="text" value="${s.color}" placeholder="#4caf50" data-field="color_text" style="width: 80px;">
                <input type="number" value="${s.value}" placeholder="Value" data-field="value" min="0">
                <button class="remove-btn" data-action="remove-severity" data-gauge="${index}" data-item="${i}">×</button>
              </div>
            `).join('')}
          </div>
          <button class="add-btn" data-action="add-severity" data-gauge="${index}">${this._t('addThreshold')}</button>
        </div>

        <div class="sub-section">
          <div class="sub-title">${this._t('markers')}</div>
          <div class="row">
            <div class="field">
              <label>${this._t('markersRadius')}</label>
              <input type="number" id="gauge${index}_markers_radius" value="${gauge.markers_radius !== undefined ? gauge.markers_radius : ''}" placeholder="Auto" min="10" max="300" step="1">
            </div>
            <div class="field checkbox">
              <input type="checkbox" id="gauge${index}_markers_inside" ${gauge.markers_inside !== false ? 'checked' : ''}>
              <label for="gauge${index}_markers_inside">${this._t('markersInside')}</label>
            </div>
          </div>
          <div class="markers-list" id="gauge${index}_markers_list">
            ${markers.map((m, i) => `
              <div class="marker-item" data-index="${i}">
                <input type="number" value="${m.value}" placeholder="Value" data-field="value" step="any">
                <input type="color" value="${m.color || '#ffffff'}" data-field="color">
                <input type="text" value="${m.label || ''}" placeholder="Label" data-field="label">
                <button class="remove-btn" data-action="remove-marker" data-gauge="${index}" data-item="${i}">×</button>
              </div>
            `).join('')}
          </div>
          <button class="add-btn" data-action="add-marker" data-gauge="${index}">${this._t('addMarker')}</button>
        </div>

        <div class="sub-section">
          <div class="sub-title">${this._t('coloredZones')}</div>
          <div class="zones-list" id="gauge${index}_zones_list">
            ${zones.map((z, i) => `
              <div class="zone-item" data-index="${i}">
                <input type="number" value="${z.from}" placeholder="From" data-field="from" step="any">
                <input type="number" value="${z.to}" placeholder="To" data-field="to" step="any">
                <input type="color" value="${z.color || '#2196f3'}" data-field="color">
                <input type="number" value="${z.opacity !== undefined ? z.opacity : 0.3}" placeholder="Opacity" data-field="opacity" min="0" max="1" step="0.1">
                <button class="remove-btn" data-action="remove-zone" data-gauge="${index}" data-item="${i}">×</button>
              </div>
            `).join('')}
          </div>
          <button class="add-btn" data-action="add-zone" data-gauge="${index}">${this._t('addZone')}</button>
        </div>

        <div class="sub-section">
          <div class="sub-title">${this._t('valueUnitTypography')}</div>
          
          <div class="row">
            <div class="field">
              <label>${this._t('valueFont')}</label>
              <input type="text" id="gauge${index}_value_font_family" value="${gauge.value_font_family || ''}" placeholder="inherit">
            </div>
            <div class="field">
              <label>${this._t('valueSize')}</label>
              <input type="text" id="gauge${index}_value_font_size" value="${gauge.value_font_size || ''}" placeholder="${index === 0 ? '24px' : '18px'}">
            </div>
            <div class="field">
              <label>${this._t('valueWeight')}</label>
              <select id="gauge${index}_value_font_weight">
                <option value="" ${!gauge.value_font_weight ? 'selected' : ''}>${this._t('weightAuto')}</option>
                <option value="normal" ${gauge.value_font_weight === 'normal' ? 'selected' : ''}>${this._t('weightNormal')}</option>
                <option value="bold" ${gauge.value_font_weight === 'bold' ? 'selected' : ''}>${this._t('weightBold')}</option>
                <option value="lighter" ${gauge.value_font_weight === 'lighter' ? 'selected' : ''}>${this._t('weightLight')}</option>
                <option value="100" ${gauge.value_font_weight === '100' ? 'selected' : ''}>100</option>
                <option value="200" ${gauge.value_font_weight === '200' ? 'selected' : ''}>200</option>
                <option value="300" ${gauge.value_font_weight === '300' ? 'selected' : ''}>300</option>
                <option value="400" ${gauge.value_font_weight === '400' ? 'selected' : ''}>400</option>
                <option value="500" ${gauge.value_font_weight === '500' ? 'selected' : ''}>500</option>
                <option value="600" ${gauge.value_font_weight === '600' ? 'selected' : ''}>600</option>
                <option value="700" ${gauge.value_font_weight === '700' ? 'selected' : ''}>700</option>
                <option value="800" ${gauge.value_font_weight === '800' ? 'selected' : ''}>800</option>
                <option value="900" ${gauge.value_font_weight === '900' ? 'selected' : ''}>900</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label>${this._t('valueColor')}</label>
              <div class="color-row">
                <input type="color" id="gauge${index}_value_font_color" value="${gauge.value_font_color || '#ffffff'}" data-field="color">
                <input type="text" id="gauge${index}_value_font_color_text" value="${gauge.value_font_color || ''}" placeholder="Auto" data-field="color_text">
              </div>
            </div>
            <div class="field">
              <label>${this._t('unitFont')}</label>
              <input type="text" id="gauge${index}_unit_font_family" value="${gauge.unit_font_family || ''}" placeholder="inherit">
            </div>
            <div class="field">
              <label>${this._t('unitSize')}</label>
              <input type="text" id="gauge${index}_unit_font_size" value="${gauge.unit_font_size || ''}" placeholder="${index === 0 ? '14px' : '12px'}">
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label>${this._t('unitWeight')}</label>
              <select id="gauge${index}_unit_font_weight">
                <option value="" ${!gauge.unit_font_weight ? 'selected' : ''}>${this._t('weightAuto')}</option>
                <option value="normal" ${gauge.unit_font_weight === 'normal' ? 'selected' : ''}>${this._t('weightNormal')}</option>
                <option value="bold" ${gauge.unit_font_weight === 'bold' ? 'selected' : ''}>${this._t('weightBold')}</option>
                <option value="lighter" ${gauge.unit_font_weight === 'lighter' ? 'selected' : ''}>${this._t('weightLight')}</option>
                <option value="100" ${gauge.unit_font_weight === '100' ? 'selected' : ''}>100</option>
                <option value="200" ${gauge.unit_font_weight === '200' ? 'selected' : ''}>200</option>
                <option value="300" ${gauge.unit_font_weight === '300' ? 'selected' : ''}>300</option>
                <option value="400" ${gauge.unit_font_weight === '400' ? 'selected' : ''}>400</option>
                <option value="500" ${gauge.unit_font_weight === '500' ? 'selected' : ''}>500</option>
                <option value="600" ${gauge.unit_font_weight === '600' ? 'selected' : ''}>600</option>
                <option value="700" ${gauge.unit_font_weight === '700' ? 'selected' : ''}>700</option>
                <option value="800" ${gauge.unit_font_weight === '800' ? 'selected' : ''}>800</option>
                <option value="900" ${gauge.unit_font_weight === '900' ? 'selected' : ''}>900</option>
              </select>
            </div>
            <div class="field">
              <label>${this._t('unitColor')}</label>
              <div class="color-row">
                <input type="color" id="gauge${index}_unit_font_color" value="${gauge.unit_font_color || '#dddddd'}" data-field="color">
                <input type="text" id="gauge${index}_unit_font_color_text" value="${gauge.unit_font_color || ''}" placeholder="Auto" data-field="color_text">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _attachListeners() {
    // Standard inputs - use 'change' to avoid too frequent updates
    const inputs = this.shadowRoot.querySelectorAll('input:not([type="color"]), select');
    inputs.forEach(input => {
      input.addEventListener('change', () => this._updateConfig());
    });

    // Color pickers - real-time update of associated text
    const colorPickers = this.shadowRoot.querySelectorAll('input[type="color"]');
    colorPickers.forEach(picker => {
      picker.addEventListener('input', (e) => {
        // Update associated text field
        const textInput = e.target.parentElement.querySelector('[data-field="color_text"]');
        if (textInput) textInput.value = e.target.value;
        this._updateConfig();
      });
    });

    // Color texts
    const colorTexts = this.shadowRoot.querySelectorAll('input[data-field="color_text"]');
    colorTexts.forEach(text => {
      text.addEventListener('change', (e) => {
        // Update associated color picker
        const picker = e.target.parentElement.querySelector('input[type="color"]');
        if (picker && e.target.value.match(/^#[0-9a-fA-F]{6}$/)) {
          picker.value = e.target.value;
        }
        this._updateConfig();
      });
    });

    // Add/remove buttons
    const buttons = this.shadowRoot.querySelectorAll('button[data-action]');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const action = e.target.dataset.action;
        const gaugeIndex = parseInt(e.target.dataset.gauge);
        const itemIndex = e.target.dataset.item !== undefined ? parseInt(e.target.dataset.item) : null;
        this._handleListAction(action, gaugeIndex, itemIndex);
      });
    });

    // Dynamic lists - numeric and text inputs
    ['severity', 'markers', 'zones'].forEach(listType => {
      [0, 1].forEach(gaugeIndex => {
        const list = this.shadowRoot.getElementById(`gauge${gaugeIndex}_${listType}_list`);
        if (list) {
          const inputs = list.querySelectorAll('input:not([type="color"])');
          inputs.forEach(input => {
            input.addEventListener('change', () => this._updateConfig());
          });
        }
      });
    });

    // Show/hide shadow options
    [0, 1].forEach(index => {
      const centerShadow = this.shadowRoot.getElementById(`gauge${index}_center_shadow`);
      const outerShadow = this.shadowRoot.getElementById(`gauge${index}_outer_shadow`);
      if (centerShadow) {
        centerShadow.addEventListener('change', () => {
          const options = this.shadowRoot.getElementById(`gauge${index}_center_shadow_options`);
          if (options) options.style.display = centerShadow.checked ? 'flex' : 'none';
          this._updateConfig();
        });
      }
      if (outerShadow) {
        outerShadow.addEventListener('change', () => {
          const options = this.shadowRoot.getElementById(`gauge${index}_outer_shadow_options`);
          if (options) options.style.display = outerShadow.checked ? 'flex' : 'none';
          this._updateConfig();
        });
      }
    });

    // Show/hide custom theme section
    const cardTheme = this.shadowRoot.getElementById('card_theme');
    if (cardTheme) {
      cardTheme.addEventListener('change', () => {
        const customSection = this.shadowRoot.getElementById('custom_theme_section');
        if (customSection) {
          customSection.style.display = cardTheme.value === 'custom' ? 'block' : 'none';
        }
        this._updateConfig();
      });
    }
  }

  _handleListAction(action, gaugeIndex, itemIndex) {
    // First, save current input state
    this._saveCurrentState();

    // Clone config to avoid modifying original
    this._config = JSON.parse(JSON.stringify(this._config));
    
    if (!this._config.gauges) this._config.gauges = [{}, {}];
    if (!this._config.gauges[gaugeIndex]) this._config.gauges[gaugeIndex] = {};

    switch (action) {
      case 'add-severity':
        if (!this._config.gauges[gaugeIndex].severity) {
          this._config.gauges[gaugeIndex].severity = [];
        }
        this._config.gauges[gaugeIndex].severity.push({ color: '#4caf50', value: 0 });
        break;
      case 'remove-severity':
        if (this._config.gauges[gaugeIndex].severity) {
          this._config.gauges[gaugeIndex].severity.splice(itemIndex, 1);
        }
        break;
      case 'add-marker':
        if (!this._config.gauges[gaugeIndex].markers) {
          this._config.gauges[gaugeIndex].markers = [];
        }
        this._config.gauges[gaugeIndex].markers.push({ value: 0, color: '#ffffff', label: '' });
        break;
      case 'remove-marker':
        if (this._config.gauges[gaugeIndex].markers) {
          this._config.gauges[gaugeIndex].markers.splice(itemIndex, 1);
        }
        break;
      case 'add-zone':
        if (!this._config.gauges[gaugeIndex].zones) {
          this._config.gauges[gaugeIndex].zones = [];
        }
        this._config.gauges[gaugeIndex].zones.push({ from: 0, to: 25, color: '#2196f3', opacity: 0.3 });
        break;
      case 'remove-zone':
        if (this._config.gauges[gaugeIndex].zones) {
          this._config.gauges[gaugeIndex].zones.splice(itemIndex, 1);
        }
        break;
    }

    this._render();
    this._fireConfigChanged();
  }

  _saveCurrentState() {
    // Clone config before modification (in case it's still frozen)
    if (this._config) {
      this._config = JSON.parse(JSON.stringify(this._config));
    }
    
    // Quick save of current values in config
    const getInputValue = (id) => {
      const el = this.shadowRoot.getElementById(id);
      if (!el) return undefined;
      if (el.type === 'checkbox') return el.checked;
      if (el.type === 'number') {
        const val = parseFloat(el.value);
        return isNaN(val) ? undefined : val;
      }
      return el.value;
    };

    // Save general values
    this._config.name = getInputValue('name') ?? this._config.name ?? '';
    this._config.gauge_size = getInputValue('gauge_size') ?? this._config.gauge_size ?? 200;
    this._config.inner_gauge_size = getInputValue('inner_gauge_size') ?? this._config.inner_gauge_size ?? 130;
    this._config.inner_gauge_radius = getInputValue('inner_gauge_radius') ?? this._config.inner_gauge_radius ?? 65;
    this._config.title_position = getInputValue('title_position') ?? this._config.title_position ?? 'bottom';
    this._config.card_theme = getInputValue('card_theme') ?? this._config.card_theme ?? 'default';
    this._config.hide_card = getInputValue('hide_card') ?? this._config.hide_card ?? false;
    this._config.power_save_mode = getInputValue('power_save_mode') ?? this._config.power_save_mode ?? false;
    this._config.debounce_updates = getInputValue('debounce_updates') ?? this._config.debounce_updates ?? false;
    this._config.hide_shadows = getInputValue('hide_shadows') ?? this._config.hide_shadows ?? false;
    this._config.update_interval = getInputValue('update_interval') ?? this._config.update_interval ?? 1000;

    // Save custom theme settings
    this._config.custom_background = getInputValue('custom_background_text') ?? this._config.custom_background ?? '';
    this._config.custom_gauge_background = getInputValue('custom_gauge_background_text') ?? this._config.custom_gauge_background ?? '';
    this._config.custom_center_background = getInputValue('custom_center_background_text') ?? this._config.custom_center_background ?? '';
    this._config.custom_text_color = getInputValue('custom_text_color_text') ?? this._config.custom_text_color ?? '';
    this._config.custom_secondary_text_color = getInputValue('custom_secondary_text_color_text') ?? this._config.custom_secondary_text_color ?? '';

    // Save title typography settings
    this._config.title_font_size = getInputValue('title_font_size') ?? this._config.title_font_size ?? '';
    this._config.title_font_family = getInputValue('title_font_family') ?? this._config.title_font_family ?? '';
    this._config.title_font_weight = getInputValue('title_font_weight') ?? this._config.title_font_weight ?? '';
    this._config.title_font_color = getInputValue('title_font_color_text') ?? this._config.title_font_color ?? '';
    this._config.card_background = getInputValue('card_background') ?? this._config.card_background ?? '';

    // Save transparency options
    this._config.transparent_card_background = getInputValue('transparent_card_background') ?? this._config.transparent_card_background ?? false;
    this._config.transparent_gauge_background = getInputValue('transparent_gauge_background') ?? this._config.transparent_gauge_background ?? false;
    this._config.transparent_center_background = getInputValue('transparent_center_background') ?? this._config.transparent_center_background ?? false;

    // Save gauge values
    for (let i = 0; i < 2; i++) {
      if (!this._config.gauges) this._config.gauges = [{}, {}];
      if (!this._config.gauges[i]) this._config.gauges[i] = {};

      this._config.gauges[i].entity = getInputValue(`gauge${i}_entity`) ?? this._config.gauges[i].entity ?? '';
      this._config.gauges[i].min = getInputValue(`gauge${i}_min`) ?? this._config.gauges[i].min ?? 0;
      this._config.gauges[i].max = getInputValue(`gauge${i}_max`) ?? this._config.gauges[i].max ?? 100;
      this._config.gauges[i].unit = getInputValue(`gauge${i}_unit`) ?? this._config.gauges[i].unit ?? '';
      this._config.gauges[i].decimals = getInputValue(`gauge${i}_decimals`) ?? this._config.gauges[i].decimals ?? 1;
      this._config.gauges[i].leds_count = getInputValue(`gauge${i}_leds_count`) ?? this._config.gauges[i].leds_count ?? (i === 0 ? 80 : 100);
      this._config.gauges[i].led_size = getInputValue(`gauge${i}_led_size`) ?? this._config.gauges[i].led_size ?? (i === 0 ? 6 : 8);
      this._config.gauges[i].markers_radius = getInputValue(`gauge${i}_markers_radius`) ?? this._config.gauges[i].markers_radius ?? undefined;
      this._config.gauges[i].markers_inside = getInputValue(`gauge${i}_markers_inside`) ?? this._config.gauges[i].markers_inside ?? true;
      this._config.gauges[i].theme = getInputValue(`gauge${i}_theme`) ?? this._config.gauges[i].theme ?? 'default';
      this._config.gauges[i].animation_duration = getInputValue(`gauge${i}_animation_duration`) ?? this._config.gauges[i].animation_duration ?? 800;
      this._config.gauges[i].bidirectional = getInputValue(`gauge${i}_bidirectional`) ?? this._config.gauges[i].bidirectional ?? false;
      this._config.gauges[i].hide_inactive_leds = getInputValue(`gauge${i}_hide_inactive_leds`) ?? this._config.gauges[i].hide_inactive_leds ?? false;
      this._config.gauges[i].smooth_transitions = getInputValue(`gauge${i}_smooth_transitions`) ?? this._config.gauges[i].smooth_transitions ?? true;
      this._config.gauges[i].center_shadow = getInputValue(`gauge${i}_center_shadow`) ?? this._config.gauges[i].center_shadow ?? false;
      this._config.gauges[i].outer_shadow = getInputValue(`gauge${i}_outer_shadow`) ?? this._config.gauges[i].outer_shadow ?? false;

      // Save value and unit fonts
      this._config.gauges[i].value_font_family = getInputValue(`gauge${i}_value_font_family`) ?? this._config.gauges[i].value_font_family ?? '';
      this._config.gauges[i].value_font_size = getInputValue(`gauge${i}_value_font_size`) ?? this._config.gauges[i].value_font_size ?? '';
      this._config.gauges[i].value_font_weight = getInputValue(`gauge${i}_value_font_weight`) ?? this._config.gauges[i].value_font_weight ?? '';
      this._config.gauges[i].value_font_color = getInputValue(`gauge${i}_value_font_color_text`) ?? this._config.gauges[i].value_font_color ?? '';
      this._config.gauges[i].unit_font_family = getInputValue(`gauge${i}_unit_font_family`) ?? this._config.gauges[i].unit_font_family ?? '';
      this._config.gauges[i].unit_font_size = getInputValue(`gauge${i}_unit_font_size`) ?? this._config.gauges[i].unit_font_size ?? '';
      this._config.gauges[i].unit_font_weight = getInputValue(`gauge${i}_unit_font_weight`) ?? this._config.gauges[i].unit_font_weight ?? '';
      this._config.gauges[i].unit_font_color = getInputValue(`gauge${i}_unit_font_color_text`) ?? this._config.gauges[i].unit_font_color ?? '';

      // Save current dynamic lists
      ['severity', 'markers', 'zones'].forEach(listType => {
        const list = this.shadowRoot.getElementById(`gauge${i}_${listType}_list`);
        if (list) {
          const items = list.querySelectorAll(`.${listType === 'severity' ? 'severity-item' : listType === 'markers' ? 'marker-item' : 'zone-item'}`);
          if (listType === 'severity') {
            this._config.gauges[i].severity = Array.from(items).map(item => ({
              color: item.querySelector('[data-field="color"]').value,
              value: parseFloat(item.querySelector('[data-field="value"]').value) || 0
            }));
          } else if (listType === 'markers') {
            this._config.gauges[i].markers = Array.from(items).map(item => ({
              value: parseFloat(item.querySelector('[data-field="value"]').value) || 0,
              color: item.querySelector('[data-field="color"]').value,
              label: item.querySelector('[data-field="label"]').value
            }));
          } else if (listType === 'zones') {
            this._config.gauges[i].zones = Array.from(items).map(item => ({
              from: parseFloat(item.querySelector('[data-field="from"]').value) || 0,
              to: parseFloat(item.querySelector('[data-field="to"]').value) || 0,
              color: item.querySelector('[data-field="color"]').value,
              opacity: parseFloat(item.querySelector('[data-field="opacity"]').value) || 0.3
            }));
          }
        }
      });
    }
  }

  _updateConfig() {
    const getValue = (id) => {
      const el = this.shadowRoot.getElementById(id);
      if (!el) return undefined;
      if (el.type === 'checkbox') return el.checked;
      if (el.type === 'number') {
        const val = parseFloat(el.value);
        return isNaN(val) ? undefined : val;
      }
      return el.value;
    };

    const newConfig = {
      type: 'custom:dual-gauge-card',
      name: getValue('name') || '',
      gauge_size: getValue('gauge_size') || 200,
      inner_gauge_size: getValue('inner_gauge_size') || 130,
      inner_gauge_radius: getValue('inner_gauge_radius') || 65,
      title_position: getValue('title_position') || 'bottom',
      card_theme: getValue('card_theme') || 'default',
      hide_card: getValue('hide_card') || false,
      power_save_mode: getValue('power_save_mode') || false,
      debounce_updates: getValue('debounce_updates') || false,
      hide_shadows: getValue('hide_shadows') || false,
      update_interval: getValue('update_interval') || 1000,
      gauges: [0, 1].map(idx => this._getGaugeConfig(idx))
    };

    // Add optional parameters only if defined
    const customBg = getValue('custom_background_text');
    if (customBg) newConfig.custom_background = customBg;
    
    const customGaugeBg = getValue('custom_gauge_background_text');
    if (customGaugeBg) newConfig.custom_gauge_background = customGaugeBg;
    
    const customCenterBg = getValue('custom_center_background_text');
    if (customCenterBg) newConfig.custom_center_background = customCenterBg;
    
    const customTextColor = getValue('custom_text_color_text');
    if (customTextColor) newConfig.custom_text_color = customTextColor;
    
    const customSecondaryText = getValue('custom_secondary_text_color_text');
    if (customSecondaryText) newConfig.custom_secondary_text_color = customSecondaryText;

    // Title typography
    const titleFontSize = getValue('title_font_size');
    if (titleFontSize) newConfig.title_font_size = titleFontSize;
    
    const titleFontFamily = getValue('title_font_family');
    if (titleFontFamily) newConfig.title_font_family = titleFontFamily;
    
    const titleFontWeight = getValue('title_font_weight');
    if (titleFontWeight) newConfig.title_font_weight = titleFontWeight;
    
    const titleFontColor = getValue('title_font_color_text');
    if (titleFontColor) newConfig.title_font_color = titleFontColor;
    
    const cardBackground = getValue('card_background');
    if (cardBackground) newConfig.card_background = cardBackground;

    // Transparency
    if (getValue('transparent_card_background')) newConfig.transparent_card_background = true;
    if (getValue('transparent_gauge_background')) newConfig.transparent_gauge_background = true;
    if (getValue('transparent_center_background')) newConfig.transparent_center_background = true;

    this._config = newConfig;
    this._fireConfigChanged();
  }

  _getGaugeConfig(index) {
    const getValue = (id) => {
      const el = this.shadowRoot.getElementById(id);
      if (!el) return undefined;
      if (el.type === 'checkbox') return el.checked;
      if (el.type === 'number') {
        const val = parseFloat(el.value);
        return isNaN(val) ? undefined : val;
      }
      return el.value;
    };

    const config = {
      entity: getValue(`gauge${index}_entity`) || '',
      min: getValue(`gauge${index}_min`) !== undefined ? getValue(`gauge${index}_min`) : 0,
      max: getValue(`gauge${index}_max`) !== undefined ? getValue(`gauge${index}_max`) : 100,
      unit: getValue(`gauge${index}_unit`) || '',
      decimals: getValue(`gauge${index}_decimals`) !== undefined ? getValue(`gauge${index}_decimals`) : 1,
      leds_count: getValue(`gauge${index}_leds_count`) !== undefined ? getValue(`gauge${index}_leds_count`) : (index === 0 ? 80 : 100),
      led_size: getValue(`gauge${index}_led_size`) !== undefined ? getValue(`gauge${index}_led_size`) : (index === 0 ? 6 : 8),
      markers_radius: getValue(`gauge${index}_markers_radius`) !== undefined ? getValue(`gauge${index}_markers_radius`) : undefined,
      markers_inside: getValue(`gauge${index}_markers_inside`) !== false,
      theme: getValue(`gauge${index}_theme`) || 'default',
      animation_duration: getValue(`gauge${index}_animation_duration`) !== undefined ? getValue(`gauge${index}_animation_duration`) : 800,
      bidirectional: getValue(`gauge${index}_bidirectional`) || false,
      hide_inactive_leds: getValue(`gauge${index}_hide_inactive_leds`) || false,
      smooth_transitions: getValue(`gauge${index}_smooth_transitions`) !== false,
      center_shadow: getValue(`gauge${index}_center_shadow`) || false,
      center_shadow_blur: getValue(`gauge${index}_center_shadow_blur`) || 30,
      center_shadow_spread: getValue(`gauge${index}_center_shadow_spread`) || 15,
      outer_shadow: getValue(`gauge${index}_outer_shadow`) || false,
      outer_shadow_blur: getValue(`gauge${index}_outer_shadow_blur`) || 30,
      outer_shadow_spread: getValue(`gauge${index}_outer_shadow_spread`) || 15
    };

    // Get severity thresholds
    const severityList = this.shadowRoot.getElementById(`gauge${index}_severity_list`);
    if (severityList) {
      const items = severityList.querySelectorAll('.severity-item');
      config.severity = Array.from(items).map(item => ({
        color: item.querySelector('[data-field="color"]').value,
        value: parseFloat(item.querySelector('[data-field="value"]').value) || 0
      }));
    }

    // Get markers
    const markersList = this.shadowRoot.getElementById(`gauge${index}_markers_list`);
    if (markersList) {
      const items = markersList.querySelectorAll('.marker-item');
      config.markers = Array.from(items).map(item => ({
        value: parseFloat(item.querySelector('[data-field="value"]').value) || 0,
        color: item.querySelector('[data-field="color"]').value,
        label: item.querySelector('[data-field="label"]').value
      }));
    }

    // Get zones
    const zonesList = this.shadowRoot.getElementById(`gauge${index}_zones_list`);
    if (zonesList) {
      const items = zonesList.querySelectorAll('.zone-item');
      config.zones = Array.from(items).map(item => ({
        from: parseFloat(item.querySelector('[data-field="from"]').value) || 0,
        to: parseFloat(item.querySelector('[data-field="to"]').value) || 0,
        color: item.querySelector('[data-field="color"]').value,
        opacity: parseFloat(item.querySelector('[data-field="opacity"]').value) || 0.3
      }));
    }

    // Get value and unit fonts
    // Always include these properties to prevent them from disappearing
    const valueFontFamily = getValue(`gauge${index}_value_font_family`);
    config.value_font_family = valueFontFamily ?? '';
    
    const valueFontSize = getValue(`gauge${index}_value_font_size`);
    config.value_font_size = valueFontSize ?? '';
    
    const valueFontWeight = getValue(`gauge${index}_value_font_weight`);
    config.value_font_weight = valueFontWeight ?? '';
    
    const valueFontColor = getValue(`gauge${index}_value_font_color_text`);
    config.value_font_color = valueFontColor ?? '';
    
    const unitFontFamily = getValue(`gauge${index}_unit_font_family`);
    config.unit_font_family = unitFontFamily ?? '';
    
    const unitFontSize = getValue(`gauge${index}_unit_font_size`);
    config.unit_font_size = unitFontSize ?? '';
    
    const unitFontWeight = getValue(`gauge${index}_unit_font_weight`);
    config.unit_font_weight = unitFontWeight ?? '';
    
    const unitFontColor = getValue(`gauge${index}_unit_font_color_text`);
    config.unit_font_color = unitFontColor ?? '';

    return config;
  }

  _fireConfigChanged() {
    const event = new Event('config-changed', { bubbles: true, composed: true });
    event.detail = { config: this._config };
    this.dispatchEvent(event);
  }
}

// ============================================================================
// REGISTER EDITOR
// ============================================================================

customElements.define('dual-gauge-card-editor', DualGaugeCardEditor);

console.info(
  '%c DUAL-GAUGE-CARD-EDITOR %c Editor loaded ',
  'color: white; background: #03a9f4; font-weight: bold;',
  'color: #03a9f4; background: white; font-weight: bold;'
);
