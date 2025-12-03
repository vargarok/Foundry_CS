const { HandlebarsApplicationMixin, DocumentSheetV2 } = foundry.applications.api;

export class CWItemSheet extends HandlebarsApplicationMixin(DocumentSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["cw", "sheet", "item"],
    position: { width: 550, height: 600 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
        changeTab: this._onChangeTab,
        createEffect: this._onCreateEffect,
        editEffect: this._onEditEffect,
        deleteEffect: this._onDeleteEffect,
        toggleEffect: this._onToggleEffect
    }
  };

  static PARTS = {
    form: { template: "systems/colonial-weather/templates/item/item-sheet.hbs" },
  };

  tabGroups = {
    sheet: "details" // Default to the main details tab
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    context.item = this.document;
    context.system = this.document.system;
    context.config = CONFIG.CW;
    context.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(
        this.document.system.description, 
        { async: true, secrets: this.document.isOwner, rollData: this.document.getRollData() }
    );
    context.tabs = [
        { id: "details", group: "sheet", icon: "fa-solid fa-file-lines", label: "Details" },
        { id: "effects", group: "sheet", icon: "fa-solid fa-bolt", label: "Effects" }
    ];
    context.activeTab = this.tabGroups.sheet;

// Prepare Effects List
    context.effects = this.document.effects.map(e => ({
      id: e.id,
      name: e.name,
      img: e.img,
      disabled: e.disabled,
      sourceName: "This Item"
}));
    
    context.traitTypes = { "merit": "Merit", "flaw": "Flaw" };
    context.attributeOptions = Object.entries(CONFIG.CW.attributeLabels).reduce((acc, [key, label]) => {
    acc[key] = label;
    return acc;
    }, {});
    // Added logic for Armor Coverage
    // We need to flag which locations are checked
    if (this.document.type === "armor") {
        context.coverage = Object.entries(CONFIG.CW.armorLocations).map(([key, label]) => {
            return {
                key,
                label,
                checked: this.document.system.coverage.includes(key)
            };
        });
    }

    return context;
  }
  

    // Robustly handle form data by reading the temporary map
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);

    if (this.document.type === "armor") {
        // 1. Locate the coverage map in the expanded data
        // It should look like: data.temp.coverageMap = { head: true, chest: true }
        const map = data.temp?.coverageMap || {};
        
        // 2. Convert "true" keys into our array
        const newCoverage = Object.entries(map)
            .filter(([key, value]) => value === true) // Keep only checked items
            .map(([key, value]) => key);              // Keep only the key name

        // 3. Save to the actual system property
        data["system.coverage"] = newCoverage;

        // 4. Cleanup temporary data
        delete data.temp;
    }
    
    return data;
  }
  
  static async _onRollWeapon(event, target) {
    const item = this.document.items.get(target.dataset.id);
    
    // 1. Get the bonus from the item (default to 0 if undefined)
    const bonus = item.system.attackBonus || 0;
    
    // 2. Pass it as the 3rd argument to rollDicePool
    // Your rollDicePool function in actor.mjs is already set up to accept (attr, skill, bonus)
    this.document.rollDicePool(item.system.attribute, item.system.skill, bonus);
  }

  // --- TAB HANDLING METHOD ---
  static async _onChangeTab(event, target) {
    const group = target.dataset.group;
    const tab = target.dataset.tab;
    this.tabGroups[group] = tab;
    this.render();
  }

  // --- EFFECT METHODS  ---
  static async _onCreateEffect(event, target) {
      return ActiveEffect.create({
          name: "New Effect",
          icon: "icons/svg/aura.svg",
          origin: this.document.uuid,
          disabled: false,
          transfer: true // Important for Items! Means "Give this effect to the Actor"
      }, { parent: this.document });
  }

  static async _onEditEffect(event, target) {
      const effect = this.document.effects.get(target.closest(".item-row").dataset.effectId);
      return effect.sheet.render(true);
  }

  static async _onDeleteEffect(event, target) {
      const effect = this.document.effects.get(target.closest(".item-row").dataset.effectId);
      return effect.delete();
  }

  static async _onToggleEffect(event, target) {
      const effect = this.document.effects.get(target.closest(".item-row").dataset.effectId);
      return effect.update({ disabled: !effect.disabled });
  }
}
