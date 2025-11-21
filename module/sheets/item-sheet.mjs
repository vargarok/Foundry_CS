const { HandlebarsApplicationMixin } = foundry.applications.api;
const { DocumentSheetV2 } = foundry.applications.api;

export class CWItemSheet extends HandlebarsApplicationMixin(DocumentSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["cw", "sheet", "item"],
    position: { width: 500, height: 450 },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    form: { template: "systems/colonial-weather/templates/item/item-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    context.item = this.document;
    context.system = this.document.system;
    context.config = CONFIG.CW;
    
    // 1. Explicitly set editable state
    context.editable = this.isEditable;

    // 2. Enrich the description for the editor
    // This converts secrets, links, and rolls into HTML
    context.enrichedDescription = await TextEditor.enrichHTML(this.document.system.description, {
        async: true,
        relativeTo: this.document
    });
    
    context.traitTypes = { "merit": "Merit", "flaw": "Flaw" };
    
    return context;
  }
}