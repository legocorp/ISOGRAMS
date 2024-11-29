
/**
 * @license
 * Home Assistant Community Store
 * @hacs
 */

class RulerCardPercentage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    setConfig(config) {
        this.config = {
            min: config.min || 0, // Default to 0
            max: config.max || 100, // Default to 100
            step: config.step || 10, // Default to 10
            font_size: config.font_size || '14px', // Optional font size
            ...config,
        };
        this.render();
    }

    render() {
        const { min, max, step } = this.config;

        const tickColor = getComputedStyle(document.body).getPropertyValue('--primary-text-color').trim();
        const subTickColor = getComputedStyle(document.body).getPropertyValue('--secondary-text-color').trim();
        const fontSize = this.config.font_size;

        const ruler = document.createElement('div');
        ruler.className = 'ruler';
        ruler.style.setProperty('--font-size', fontSize);

        // Generate ticks
        for (let value = min; value <= max; value += step) {
            const isMainTick = (value - min) % step === 0;

            const tick = document.createElement('div');
            tick.className = isMainTick ? 'main-tick' : 'sub-tick';
            tick.style.left = `${((value - min) / (max - min)) * 100}%`;
            tick.style.borderColor = isMainTick ? tickColor : subTickColor;
            tick.style.borderWidth = isMainTick ? '2px' : '1px';

            // Add labels for main ticks except for the max value
            if (isMainTick && value !== max) {
                const label = document.createElement('span');
                label.textContent = value;
                label.style.color = tickColor;
                tick.appendChild(label);
            }

            ruler.appendChild(tick);
        }

        // Clear and append elements
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.getStyle());
        this.shadowRoot.appendChild(ruler);
    }

    getStyle() {
        const style = document.createElement('style');
        style.textContent = `
            .ruler {
                position: relative;
                width: 100%;
                height: calc(var(--font-size) * 2); /* Adjust height for text and ticks */
                margin: 0;
                display: flex;
                align-items: flex-end; /* Align ticks and text at the bottom */
            }
            .main-tick,
            .sub-tick {
                position: absolute;
                border-left-style: solid;
            }
            .main-tick {
                height: calc(var(--font-size) * 0.8); /* Main tick height */
                width: 0;
                display: flex;
                align-items: flex-end; /* Align text to the bottom of the tick */
            }
            .main-tick span {
                margin-left: 6px; /* Space between tick and text */
                font-size: var(--font-size);
                font-family: sans-serif;
                line-height: var(--font-size); /* Match text height */
            }
            .sub-tick {
                height: calc(var(--font-size) * 0.5); /* Subtick height */
                width: 0;
            }
        `;
        return style;
    }

    set hass(hass) {
        // Optional re-render logic
    }

    getCardSize() {
        return 1; // Compact height
    }
}

// Register the custom element
customElements.define('ruler-card-percentage', RulerCardPercentage);

// Add the card to the card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'ruler-card-percentage',
    name: 'ISOGRAMS - Ruler Card Percentage',
    preview: true,
    description: 'A custom card to display a ruler with percentage values (0-100), customizable ticks, steps, and hidden max label.',
});
e ticks, steps, and hidden max label.',
});
