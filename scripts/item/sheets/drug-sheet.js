const TEMPLATE = "systems/colonial-weather/templates/items/drug-sheet.hbs";
export class CWDrugSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cw", "sheet", "item"], width: 520, height: 520, template: TEMPLATE
    });
  }
}
Items.registerSheet("colonial-weather", CWDrugSheet, { types: ["drug"], makeDefault: true });
