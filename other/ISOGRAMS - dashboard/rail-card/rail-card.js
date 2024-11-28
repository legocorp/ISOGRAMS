class TrainScheduleCard extends HTMLElement {
    setConfig(config) {
        if (!config.entity) {
            throw new Error("Please define a train schedule entity.");
        }

        this.entity = config.entity;
        this.title = config.title || "Train Schedule";
        this.icon = config.icon || "mdi:train"; // Default icon if not specified
        this.updateInterval = config.update_interval || 60000; // Update every 60 seconds by default

        this.attachShadow({ mode: "open" });
        this.render();
    }

    set hass(hass) {
        this._hass = hass;
        this.entityState = hass.states[this.entity];
        if (!this.entityState) {
            throw new Error("Entity not found.");
        }
        this.render();
    }

    render() {
        if (!this._hass || !this.entityState) return;

        const trains = this.entityState.attributes.trains || [];
        const nextTrains = trains.slice(0, 3);

        const style = `
          <style>
            :host {
              display: block;
              width: 100%;
              box-sizing: border-box;
            }
            ha-card {
              padding: 16px;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              border-radius: var(--ha-card-border-radius, 12px);
              background: var(--card-background-color);
              color: var(--primary-text-color);
              box-shadow: var(--ha-card-box-shadow, none);
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 16px;
            }
            .icon {
              margin-right: 8px;
              font-size: 1.4em;
            }
            .title {
              font-size: 1.2em;
              font-weight: bold;
            }
            .last-refresh {
              font-size: 0.8em;
              color: var(--secondary-text-color);
              margin-left: auto;
            }
            .column-header {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 8px;
              font-weight: bold;
              font-size: 0.9em;
              color: var(--secondary-text-color);
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid var(--divider-color);
            }
            .train-box {
              background: var(--primary-background-color, #f0f0f0);
              border-radius: var(--ha-card-border-radius, 8px);
              padding: 12px;
              margin-bottom: 12px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 8px;
              align-items: center;
            }
            .train-box:last-child {
              margin-bottom: 0;
            }
            .train-box .bold-text {
              font-weight: bold;
            }
            .on-time {
              background-color: #2E8B57;
              color: white;
              padding: 2px 4px;
              border-radius: 4px;
              text-align: center;
            }
            .delayed {
              background-color: #DAA520;
              color: white;
              padding: 2px 4px;
              border-radius: 4px;
              text-align: center;
            }
            .cancelled {
              background-color: #FF6347;
              color: white;
              padding: 2px 4px;
              border-radius: 4px;
              text-align: center;
            }
          </style>
        `;

        const cardContent = `
          <ha-card>
            <div class="header">
              <ha-icon class="icon" icon="${this.icon}"></ha-icon>
              <div class="title">${this.title}</div>
              <div class="last-refresh" id="last-refresh-time">Last refreshed: Loading...</div>
            </div>
            <div class="column-header">
              <div>Time</div>
              <div>Expected</div>
              <div>Destination</div>
              <div>Status</div>
              <div>Platform</div>
            </div>
            ${nextTrains.map(train => {
                const scheduledTime = new Date(train.scheduled);
                const expectedTime = new Date(train.expected);

                const isInvalidDate = isNaN(scheduledTime.getTime()) || isNaN(expectedTime.getTime());
                const status = isInvalidDate ? 'Cancelled' :
                               train.expected === 'cancelled' ? 'Cancelled' :
                               expectedTime > scheduledTime ? 'Delayed' : 'On Time';

                const statusClass = status.toLowerCase().replace(" ", "-");

                return `
                  <div class="train-box">
                    <div class="bold-text">${isInvalidDate ? 'N/A' : scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>${isInvalidDate || train.expected === 'cancelled' ? 'N/A' : expectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>${isInvalidDate ? 'Cancelled' : train.terminus || '-'}</div>
                    <div class="${statusClass} bold-text">${status}</div>
                    <div>${train.platform || '-'}</div>
                  </div>
                `;
            }).join("")}
          </ha-card>
        `;

        this.shadowRoot.innerHTML = style + cardContent;
        this.updateLastRefreshTime();
    }

    updateLastRefreshTime() {
        const refreshTimeElement = this.shadowRoot.getElementById("last-refresh-time");
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        refreshTimeElement.textContent = `Last refreshed: ${formattedTime}`;
    }

    connectedCallback() {
        this._updateInterval = setInterval(() => {
            this.render();
        }, this.updateInterval);
    }

    disconnectedCallback() {
        clearInterval(this._updateInterval);
    }

    static getConfigElement() {
        return document.createElement("hui-generic-entity-row");
    }

    static getStubConfig() {
        return { entity: "sensor.train_schedule" };
    }
}

customElements.define("train-schedule-card", TrainScheduleCard);
