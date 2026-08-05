/**
 * Dual Gauge Card Editor - Visual Configuration Editor
 * Version: 1.5.0
 *
 * This file is dynamically loaded by dual-gauge-card.js
 * when the user opens the visual editor.
 *
 * The editor is built on the Home Assistant form stack (`ha-form`,
 * `ha-expansion-panel`, `ha-textfield`, `ha-icon-button`), so it inherits the theme,
 * the widgets and the behaviour of the built-in card editors instead of reimplementing
 * a form with raw HTML inputs.
 */

// ============================================================================
// LABELS
// ============================================================================

// Keys match the configuration keys, `ha-form` asks for them through computeLabel()
const LABELS = {
  // General
  name: 'Card name',
  gauge_size: 'Outer gauge size',
  inner_gauge_size: 'Inner gauge size',
  inner_gauge_radius: 'Inner radius',
  title_position: 'Title position',
  card_theme: 'Card theme',
  update_interval: 'Update interval',
  hide_card: 'Hide card frame',
  power_save_mode: 'Power save mode',
  debounce_updates: 'Limit update frequency',
  hide_shadows: 'Hide shadows',

  // Title typography
  title_font_size: 'Font size',
  title_font_family: 'Font family',
  title_font_weight: 'Font weight',
  title_font_color: 'Title color',
  card_background: 'Card background',

  // Transparency
  transparent_card_background: 'Transparent card background',
  transparent_gauge_background: 'Transparent gauge background',
  transparent_center_background: 'Transparent center background',

  // Custom theme
  custom_background: 'Card background',
  custom_gauge_background: 'Gauge background',
  custom_center_background: 'Center background',
  custom_text_color: 'Primary text color',
  custom_secondary_text_color: 'Secondary text color',

  // Gauge
  entity: 'Entity',
  min: 'Minimum value',
  max: 'Maximum value',
  unit: 'Unit',
  decimals: 'Decimals',
  leds_count: 'LEDs count',
  led_size: 'LED size',
  start_angle: 'Start angle',
  arc_length: 'Arc length',
  theme: 'Theme',
  animation_duration: 'Animation duration',
  bidirectional: 'Bidirectional mode',
  hide_inactive_leds: 'Hide inactive LEDs',
  smooth_transitions: 'Smooth transitions',

  // Shadows
  center_shadow: 'Center shadow',
  center_shadow_blur: 'Center shadow blur',
  center_shadow_spread: 'Center shadow spread',
  outer_shadow: 'Outer shadow',
  outer_shadow_blur: 'Outer shadow blur',
  outer_shadow_spread: 'Outer shadow spread',

  // Value and unit typography
  value_font_family: 'Value font',
  value_font_size: 'Value size',
  value_font_weight: 'Value weight',
  value_font_color: 'Value color',
  unit_font_family: 'Unit font',
  unit_font_size: 'Unit size',
  unit_font_weight: 'Unit weight',
  unit_font_color: 'Unit color',

  // Markers
  markers_radius: 'Markers radius',
  markers_inside: 'Labels inside'
};

const HELPERS = {
  inner_gauge_radius: 'Positioning radius of the inner LEDs. The larger it is, the closer the inner gauge gets to the outer one.',
  start_angle: 'Where the gauge starts: 0° = top (12 o\'clock), positive values rotate clockwise.',
  arc_length: 'Angular span of the gauge: 360° = full circle, 270° = dashboard style, 180° = half circle.',
  markers_radius: 'Leave empty to follow the radius of the gauge.',
  card_background: 'Any CSS value, for instance #222 or a gradient.',
  custom_gauge_background: 'Any CSS value, for instance #444 or a gradient.',
  custom_center_background: 'Any CSS value, for instance #333 or a gradient.',
  title_font_color: 'Leave empty to follow the theme.',
  value_font_color: 'Leave empty to follow the theme.',
  unit_font_color: 'Leave empty to follow the theme.'
};

const TEXTS = {
  innerGauge: 'Inner gauge',
  outerGauge: 'Outer gauge',
  titleTypography: 'Title typography',
  transparency: 'Transparency',
  customThemeColors: 'Custom theme colors',
  shadows: 'Shadows',
  valueUnitTypography: 'Value & unit typography',
  severity: 'Color thresholds (severity)',
  severityHelp: 'Colors applied depending on the value. The first threshold corresponds to the lowest values.',
  markers: 'Markers',
  zones: 'Colored zones',
  addThreshold: 'Add threshold',
  addMarker: 'Add marker',
  addZone: 'Add zone',
  remove: 'Remove',
  color: 'Color',
  value: 'Value',
  label: 'Label',
  from: 'From',
  to: 'To',
  opacity: 'Opacity',
  emptySeverity: 'No threshold defined, the default colors are used.',
  emptyMarkers: 'No marker defined.',
  emptyZones: 'No zone defined.'
};

// Descriptions shown by `ha-form` inside an expandable section: it asks for the helper of
// the section schema itself, which carries a title but no name
const SECTION_HELPERS = {
  [TEXTS.transparency]: 'These options force the matching background to transparent and take priority over the theme.'
};

const TITLE_POSITIONS = [
  { value: 'bottom', label: 'Bottom' },
  { value: 'top', label: 'Top' },
  { value: 'inside-top', label: 'Inside top' },
  { value: 'inside-bottom', label: 'Inside bottom' },
  { value: 'none', label: 'None' }
];

const THEME_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'custom', label: 'Custom' }
];

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: 'lighter', label: 'Light' },
  ...['100', '200', '300', '400', '500', '600', '700', '800', '900'].map(w => ({ value: w, label: w }))
];

// ============================================================================
// FORM SCHEMAS
// ============================================================================

const num = (options = {}) => ({ selector: { number: { mode: 'box', ...options } } });
const text = () => ({ selector: { text: {} } });
const bool = () => ({ selector: { boolean: {} } });
const select = (options) => ({ selector: { select: { mode: 'dropdown', options } } });
const grid = (schema) => ({ name: '', type: 'grid', schema });
const expandable = (title, icon, schema) => ({ name: '', type: 'expandable', title, icon, schema });

function generalSchema(config) {
  const schema = [
    { name: 'name', ...text() },
    grid([
      { name: 'gauge_size', ...num({ min: 100, max: 400, unit_of_measurement: 'px' }) },
      { name: 'inner_gauge_size', ...num({ min: 80, max: 300, unit_of_measurement: 'px' }) },
      { name: 'inner_gauge_radius', ...num({ min: 40, max: 150, unit_of_measurement: 'px' }) },
      { name: 'update_interval', ...num({ min: 100, max: 10000, step: 100, unit_of_measurement: 'ms' }) }
    ]),
    grid([
      { name: 'title_position', ...select(TITLE_POSITIONS) },
      { name: 'card_theme', ...select(THEME_OPTIONS) }
    ]),
    grid([
      { name: 'hide_card', ...bool() },
      { name: 'hide_shadows', ...bool() },
      { name: 'power_save_mode', ...bool() },
      { name: 'debounce_updates', ...bool() }
    ]),
    expandable(TEXTS.titleTypography, 'mdi:format-font', [
      grid([
        { name: 'title_font_size', ...text() },
        { name: 'title_font_family', ...text() },
        { name: 'title_font_weight', ...select(FONT_WEIGHTS) }
      ]),
      grid([
        { name: 'title_font_color', ...text() },
        { name: 'card_background', ...text() }
      ])
    ]),
    expandable(TEXTS.transparency, 'mdi:checkerboard', [
      grid([
        { name: 'transparent_card_background', ...bool() },
        { name: 'transparent_gauge_background', ...bool() },
        { name: 'transparent_center_background', ...bool() }
      ])
    ])
  ];

  if (config.card_theme === 'custom') {
    schema.push(expandable(TEXTS.customThemeColors, 'mdi:palette', [
      grid([
        { name: 'custom_background', ...text() },
        { name: 'custom_gauge_background', ...text() },
        { name: 'custom_center_background', ...text() }
      ]),
      grid([
        { name: 'custom_text_color', ...text() },
        { name: 'custom_secondary_text_color', ...text() }
      ])
    ]));
  }

  return schema;
}

function gaugeSchema(gauge) {
  const shadowFields = [
    grid([
      { name: 'center_shadow', ...bool() },
      { name: 'outer_shadow', ...bool() }
    ])
  ];

  if (gauge.center_shadow) {
    shadowFields.push(grid([
      { name: 'center_shadow_blur', ...num({ min: 0, max: 100, unit_of_measurement: 'px' }) },
      { name: 'center_shadow_spread', ...num({ min: 0, max: 100, unit_of_measurement: 'px' }) }
    ]));
  }

  if (gauge.outer_shadow) {
    shadowFields.push(grid([
      { name: 'outer_shadow_blur', ...num({ min: 0, max: 100, unit_of_measurement: 'px' }) },
      { name: 'outer_shadow_spread', ...num({ min: 0, max: 100, unit_of_measurement: 'px' }) }
    ]));
  }

  return [
    { name: 'entity', selector: { entity: {} } },
    grid([
      { name: 'min', ...num({ step: 'any' }) },
      { name: 'max', ...num({ step: 'any' }) },
      { name: 'unit', ...text() },
      { name: 'decimals', ...num({ min: 0, max: 5 }) }
    ]),
    grid([
      { name: 'leds_count', ...num({ min: 10, max: 200 }) },
      { name: 'led_size', ...num({ min: 2, max: 20, unit_of_measurement: 'px' }) },
      { name: 'start_angle', ...num({ min: -360, max: 360, unit_of_measurement: '°' }) },
      { name: 'arc_length', ...num({ min: 10, max: 360, unit_of_measurement: '°' }) }
    ]),
    grid([
      { name: 'theme', ...select(THEME_OPTIONS) },
      { name: 'animation_duration', ...num({ min: 0, max: 5000, step: 100, unit_of_measurement: 'ms' }) }
    ]),
    grid([
      { name: 'bidirectional', ...bool() },
      { name: 'hide_inactive_leds', ...bool() },
      { name: 'smooth_transitions', ...bool() }
    ]),
    expandable(TEXTS.shadows, 'mdi:box-shadow', shadowFields),
    expandable(TEXTS.valueUnitTypography, 'mdi:format-font', [
      grid([
        { name: 'value_font_family', ...text() },
        { name: 'value_font_size', ...text() },
        { name: 'value_font_weight', ...select(FONT_WEIGHTS) },
        { name: 'value_font_color', ...text() }
      ]),
      grid([
        { name: 'unit_font_family', ...text() },
        { name: 'unit_font_size', ...text() },
        { name: 'unit_font_weight', ...select(FONT_WEIGHTS) },
        { name: 'unit_font_color', ...text() }
      ])
    ])
  ];
}

const MARKERS_OPTIONS_SCHEMA = [
  grid([
    { name: 'markers_radius', ...num({ min: 10, max: 300, unit_of_measurement: 'px' }) },
    { name: 'markers_inside', ...bool() }
  ])
];

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Remove the keys Home Assistant should not store: an empty field means "use the default",
 * and writing every default back would bloat the YAML.
 * @param {Object} object - Configuration object
 * @returns {Object} Same object without its empty entries
 */
function stripEmpty(object) {
  const cleaned = {};

  for (const [key, value] of Object.entries(object)) {
    if (value === undefined || value === null || value === '') continue;
    cleaned[key] = value;
  }

  return cleaned;
}

/**
 * Fill in the options whose default is `true` before handing the data to `ha-form`:
 * a switch cannot be tri-state, so an unset option would be shown as disabled while the
 * card actually enables it.
 * @param {Object} gauge - Configuration of a single gauge
 * @returns {Object} Gauge configuration with its "on by default" options resolved
 */
function withGaugeDefaults(gauge) {
  return {
    ...gauge,
    smooth_transitions: gauge.smooth_transitions !== false,
    markers_inside: gauge.markers_inside !== false
  };
}

/**
 * Create an element and assign properties on it
 * @param {string} tag - Tag name
 * @param {Object} props - Properties to assign
 * @returns {HTMLElement} The created element
 */
function createElement(tag, props = {}) {
  const element = document.createElement(tag);
  Object.assign(element, props);
  return element;
}

/**
 * Pick the button element the running Home Assistant frontend provides
 * @returns {string} Tag name of an available button component
 */
function buttonTag() {
  if (customElements.get('ha-button')) return 'ha-button';
  if (customElements.get('mwc-button')) return 'mwc-button';
  return 'button';
}

// ============================================================================
// VISUAL EDITOR CLASS
// ============================================================================

class DualGaugeCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass = null;
    this._rendered = false;
    this._forms = {};
    this._lists = {};
    this._computeLabel = (schema) => LABELS[schema.name] || schema.name;
    this._computeHelper = (schema) => HELPERS[schema.name] || SECTION_HELPERS[schema.title];
  }

  setConfig(config) {
    // Home Assistant hands over a frozen object, clone it before touching anything
    const cloned = config ? JSON.parse(JSON.stringify(config)) : {};

    if (!cloned.type) {
      cloned.type = 'custom:dual-gauge-card';
    }

    if (!Array.isArray(cloned.gauges)) {
      cloned.gauges = [{}, {}];
    }
    while (cloned.gauges.length < 2) {
      cloned.gauges.push({});
    }

    this._config = cloned;
    this._updateEditor();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateEditor();
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    this._updateEditor();
  }

  _updateEditor() {
    if (!this._config || !this._hass || !this.isConnected) return;

    if (!this._rendered) {
      if (!this._rendering) {
        this._rendering = this._render();
      }
      return;
    }

    this._applyConfig();
  }

  /**
   * The Home Assistant form components live in the editor bundle, which is not always
   * loaded yet when a custom editor is created from a dashboard opened in YAML mode.
   */
  async _ensureComponents() {
    if (customElements.get('ha-form') && customElements.get('ha-expansion-panel')) return;

    if (window.loadCardHelpers) {
      try {
        const helpers = await window.loadCardHelpers();
        const card = await helpers.createCardElement({ type: 'entities', entities: [] });
        await card.constructor.getConfigElement();
      } catch (error) {
        console.warn('Dual Gauge Card: could not preload Home Assistant editor components', error);
      }
    }

    await Promise.all([
      customElements.whenDefined('ha-form'),
      customElements.whenDefined('ha-expansion-panel')
    ]);
  }

  async _render() {
    await this._ensureComponents();

    if (!this._config) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .panel-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 8px 16px 16px;
        }
        .helper {
          color: var(--secondary-text-color);
          font-size: 12px;
          line-height: 1.4;
        }
        .empty {
          color: var(--secondary-text-color);
          font-size: 13px;
          font-style: italic;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .list-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .list-row ha-textfield {
          flex: 1;
          min-width: 0;
        }
        .list-row ha-textfield.narrow {
          flex: 0 1 90px;
        }
        .swatch {
          flex: 0 0 auto;
          width: 40px;
          height: 40px;
          padding: 2px;
          border: 1px solid var(--outline-color, var(--divider-color));
          border-radius: 8px;
          background: var(--card-background-color);
          cursor: pointer;
        }
        .actions {
          display: flex;
        }
      </style>
      <div class="content" id="content"></div>
    `;

    const content = this.shadowRoot.getElementById('content');

    this._forms.general = this._createForm(generalSchema(this._config), (value) => {
      this._config = stripEmpty(value);
      this._commit();
    });
    content.appendChild(this._forms.general);

    [0, 1].forEach(index => {
      content.appendChild(this._buildGaugePanel(index));
    });

    this._rendered = true;
    this._applyConfig();
  }

  _createForm(schema, onChange) {
    const form = createElement('ha-form', {
      hass: this._hass,
      schema,
      computeLabel: this._computeLabel,
      computeHelper: this._computeHelper
    });

    form.addEventListener('value-changed', (event) => {
      event.stopPropagation();
      onChange({ ...event.detail.value });
    });

    return form;
  }

  _buildGaugePanel(index) {
    const panel = createElement('ha-expansion-panel', {
      header: index === 0 ? TEXTS.innerGauge : TEXTS.outerGauge,
      outlined: true
    });

    const body = createElement('div', { className: 'panel-content' });

    const form = this._createForm(gaugeSchema(this._gauge(index)), (value) => {
      this._updateGauge(index, stripEmpty(value));
    });
    this._forms[`gauge${index}`] = form;
    body.appendChild(form);

    body.appendChild(this._buildSeverityPanel(index));
    body.appendChild(this._buildMarkersPanel(index));
    body.appendChild(this._buildZonesPanel(index));

    panel.appendChild(body);
    return panel;
  }

  _buildListPanel(header, helperText, emptyText, addLabel, onAdd) {
    const panel = createElement('ha-expansion-panel', { header, outlined: true });

    const body = createElement('div', { className: 'panel-content' });

    if (helperText) {
      body.appendChild(createElement('div', { className: 'helper', textContent: helperText }));
    }

    const list = createElement('div', { className: 'list' });
    body.appendChild(list);

    body.appendChild(createElement('div', { className: 'empty', textContent: emptyText }));

    const actions = createElement('div', { className: 'actions' });
    const addButton = createElement(buttonTag(), { textContent: addLabel });
    addButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onAdd();
    });
    actions.appendChild(addButton);
    body.appendChild(actions);

    panel.appendChild(body);
    panel._list = list;
    panel._empty = body.querySelector('.empty');
    return panel;
  }

  _buildSeverityPanel(index) {
    const panel = this._buildListPanel(
      TEXTS.severity,
      TEXTS.severityHelp,
      TEXTS.emptySeverity,
      TEXTS.addThreshold,
      () => this._addItem(index, 'severity', { color: '#4caf50', value: 0 })
    );
    this._lists[`severity${index}`] = panel;
    return panel;
  }

  _buildMarkersPanel(index) {
    const panel = this._buildListPanel(
      TEXTS.markers,
      null,
      TEXTS.emptyMarkers,
      TEXTS.addMarker,
      () => this._addItem(index, 'markers', { value: 0, color: '#ffffff', label: '' })
    );

    // Markers have gauge-level options on top of the list itself
    const optionsForm = this._createForm(MARKERS_OPTIONS_SCHEMA, (value) => {
      this._updateGauge(index, stripEmpty({ ...this._gauge(index), ...value }));
    });
    this._forms[`markersOptions${index}`] = optionsForm;
    panel._list.parentElement.insertBefore(optionsForm, panel._list);

    this._lists[`markers${index}`] = panel;
    return panel;
  }

  _buildZonesPanel(index) {
    const panel = this._buildListPanel(
      TEXTS.zones,
      null,
      TEXTS.emptyZones,
      TEXTS.addZone,
      () => this._addItem(index, 'zones', { from: 0, to: 25, color: '#2196f3', opacity: 0.3 })
    );
    this._lists[`zones${index}`] = panel;
    return panel;
  }

  // --------------------------------------------------------------------------
  // List rows
  // --------------------------------------------------------------------------

  /**
   * `ha-textfield` mirrors the native input events, and Home Assistant listens to both
   * `input` and `change` on it. Dedupe so a blur right after typing does not fire twice.
   */
  _dedupe(initialValue, onChange) {
    let last = initialValue;

    const commit = (value) => {
      if (value === last) return;
      last = value;
      onChange(value);
    };

    return commit;
  }

  _colorField(item, onChange) {
    const isHex = (value) => /^#[0-9a-fA-F]{6}$/.test(value || '');

    const swatch = createElement('input', { type: 'color', className: 'swatch' });
    swatch.value = isHex(item.color) ? item.color : '#ffffff';

    const field = createElement('ha-textfield', {
      label: TEXTS.color,
      value: item.color || ''
    });

    const commit = this._dedupe(item.color || '', onChange);

    // `change` rather than `input`: the picker fires continuously while dragging and each
    // event rebuilds the card preview
    swatch.addEventListener('change', () => {
      field.value = swatch.value;
      commit(swatch.value);
    });

    ['input', 'change'].forEach(eventName => {
      field.addEventListener(eventName, () => {
        if (isHex(field.value)) {
          swatch.value = field.value;
        }
        commit(field.value);
      });
    });

    return [swatch, field];
  }

  _numberField(label, value, onChange, options = {}) {
    const field = createElement('ha-textfield', {
      label,
      className: 'narrow',
      type: 'number',
      value: value !== undefined && value !== null ? String(value) : '',
      ...options
    });

    const commit = this._dedupe(value, onChange);

    // While typing, ignore the states a number goes through ('', '-', '1e'); on blur,
    // an unreadable field falls back to 0
    field.addEventListener('input', () => {
      const parsed = parseFloat(field.value);
      if (Number.isFinite(parsed)) commit(parsed);
    });

    field.addEventListener('change', () => {
      const parsed = parseFloat(field.value);
      commit(Number.isFinite(parsed) ? parsed : 0);
    });

    return field;
  }

  _textField(label, value, onChange) {
    const field = createElement('ha-textfield', { label, value: value || '' });
    const commit = this._dedupe(value || '', onChange);

    ['input', 'change'].forEach(eventName => {
      field.addEventListener(eventName, () => commit(field.value));
    });

    return field;
  }

  _removeButton(onRemove) {
    const button = createElement('ha-icon-button', { label: TEXTS.remove });
    button.appendChild(createElement('ha-icon', { icon: 'mdi:close' }));
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onRemove();
    });
    return button;
  }

  _buildRow(index, listName, item, itemIndex) {
    const row = createElement('div', { className: 'list-row' });
    const patch = (changes) => this._updateItem(index, listName, itemIndex, changes);

    if (listName === 'severity') {
      row.append(...this._colorField(item, (color) => patch({ color })));
      row.appendChild(this._numberField(TEXTS.value, item.value, (value) => patch({ value }), { step: 'any' }));
    } else if (listName === 'markers') {
      row.appendChild(this._numberField(TEXTS.value, item.value, (value) => patch({ value }), { step: 'any' }));
      row.append(...this._colorField(item, (color) => patch({ color })));
      row.appendChild(this._textField(TEXTS.label, item.label, (label) => patch({ label })));
    } else {
      row.appendChild(this._numberField(TEXTS.from, item.from, (from) => patch({ from }), { step: 'any' }));
      row.appendChild(this._numberField(TEXTS.to, item.to, (to) => patch({ to }), { step: 'any' }));
      row.append(...this._colorField(item, (color) => patch({ color })));
      row.appendChild(this._numberField(TEXTS.opacity, item.opacity, (opacity) => patch({ opacity }), {
        step: '0.1',
        min: '0',
        max: '1'
      }));
    }

    row.appendChild(this._removeButton(() => this._removeItem(index, listName, itemIndex)));
    return row;
  }

  _renderList(index, listName) {
    const panel = this._lists[`${listName}${index}`];
    if (!panel) return;

    const items = this._gauge(index)[listName] || [];

    // Rebuild the rows only when items are added or removed. Editing a field already
    // updates the DOM the user is typing in, recreating it would steal the focus.
    if (panel._itemCount === items.length) return;
    panel._itemCount = items.length;

    panel._list.innerHTML = '';
    items.forEach((item, itemIndex) => {
      panel._list.appendChild(this._buildRow(index, listName, item, itemIndex));
    });

    panel._empty.style.display = items.length ? 'none' : '';
  }

  // --------------------------------------------------------------------------
  // Configuration updates
  // --------------------------------------------------------------------------

  _gauge(index) {
    return this._config?.gauges?.[index] || {};
  }

  _updateGauge(index, gauge) {
    const gauges = [...(this._config.gauges || [{}, {}])];
    gauges[index] = gauge;
    this._config = { ...this._config, gauges };
    this._commit();
  }

  _addItem(index, listName, item) {
    const gauge = this._gauge(index);
    this._updateGauge(index, { ...gauge, [listName]: [...(gauge[listName] || []), item] });
  }

  _removeItem(index, listName, itemIndex) {
    const gauge = this._gauge(index);
    const list = [...(gauge[listName] || [])];
    list.splice(itemIndex, 1);

    const updated = { ...gauge, [listName]: list };
    if (!list.length) {
      delete updated[listName];
    }

    this._updateGauge(index, updated);
  }

  _updateItem(index, listName, itemIndex, changes) {
    const gauge = this._gauge(index);
    const list = [...(gauge[listName] || [])];
    if (!list[itemIndex]) return;

    list[itemIndex] = { ...list[itemIndex], ...changes };
    this._updateGauge(index, { ...gauge, [listName]: list });
  }

  _applyConfig() {
    const config = this._config;

    this._forms.general.hass = this._hass;
    this._forms.general.schema = generalSchema(config);
    this._forms.general.data = config;

    [0, 1].forEach(index => {
      const gauge = this._gauge(index);

      const data = withGaugeDefaults(gauge);

      const form = this._forms[`gauge${index}`];
      form.hass = this._hass;
      form.schema = gaugeSchema(gauge);
      form.data = data;

      const markersOptions = this._forms[`markersOptions${index}`];
      markersOptions.hass = this._hass;
      markersOptions.data = data;

      this._renderList(index, 'severity');
      this._renderList(index, 'markers');
      this._renderList(index, 'zones');
    });
  }

  _commit() {
    this._applyConfig();
    this._fireConfigChanged();
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
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
