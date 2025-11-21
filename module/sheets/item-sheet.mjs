const { HandlebarsApplicationMixin } = foundry.applications.api;
const { DocumentSheetV2 } = foundry.applications.api;

export class CWItemSheet extends HandlebarsApplicationMixin(DocumentSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["cw", "sheet", "item"],
    position: { width: 550, height: 500 },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    form: { template: "systems/colonial-weather/templates/item/item-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    // 1. Context references
    context.item = this.document;
    context.system = this.document.system;
    context.config = CONFIG.CW;
    
    // 2. Explicitly pass the editable state (Important for the editor!)
    context.editable = this.isEditable;

    // 3. Enrich the description (CRITICAL FIX)
    // This converts the raw text into HTML the editor can display
    context.enrichedDescription = await TextEditor.enrichHTML(this.document.system.description, {
        async: true,
        secrets: this.document.isOwner,
        relativeTo: this.document
    });
    
    // 4. Helper data
    context.traitTypes = { "merit": "Merit", "flaw": "Flaw" };
    
    return context;
  }
}