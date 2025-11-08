const TEMPLATE = "systems/colonial-weather/templates/items/implant-sheet.hbs";
export class CWImplantSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cw", "sheet", "item"],
      width: 520, height: 540, template: TEMPLATE,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "details" }]
    });
  }
  getData(opts) {
    const data = super.getData(opts);
    data.categories = ["cybernetic","biotech","symbiont"];
    data.legality   = ["legal","restricted","black"];
    if (!Handlebars.helpers.join) {
      Handlebars.registerHelper("join", (arr, sep) => (Array.isArray(arr) ? arr.join(sep ?? ", ") : ""));
    }
    // Normalize effects for the template: allow {0:{...}} shape to render as an array
    const eff = data.item?.system?.effects;
    if (!Array.isArray(eff)) {
        data.item.system.effects = Array.isArray(eff) ? eff : Object.values(eff ?? []);
    }
    return data;
  }
  activateListeners(html) {
    console.log("CW Implant Sheet listeners ready for", this.item.id);  
    super.activateListeners(html);
    html.find(".add-effect").on("click", async () => {
  console.log("CW Add Effect clicked for", this.item.id, "type:", this.item.type);

    // Build a clean array and append
    const current = Array.isArray(this.item.system.effects)
    ? foundry.utils.deepClone(this.item.system.effects)
    : Object.values(this.item.system.effects ?? []);
    const newEff = {
    label: "New Effect",
    when: { rollType: "", tagsCsv: "" },
    mods: [{ path: "dicePool", op: "add", value: 1 }]
  };

  current.push(newEff);
  await this.item.update({ "system.effects": current }, { render: false });
  await this.item.sheet.render(true);
  console.log("CW effects after update:", this.item.system.effects);
});
  }
}
Items.registerSheet("colonial-weather", CWImplantSheet, { types: ["implant"], makeDefault: true });
