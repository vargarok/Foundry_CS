const { HandlebarsApplicationMixin } = foundry.applications.api;
const { DocumentSheetV2 } = foundry.applications.sheets; // Correct V13 Path

export class CWItemSheet extends HandlebarsApplicationMixin(DocumentSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["cw", "sheet", "item"],
    position: { width: 550, height: 600 }, // Increased height slightly
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
        // Define any sheet-specific actions here if needed
    }
  };

  static PARTS = {
    form: { template: "systems/colonial-weather/templates/item/item-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    context.item = this.document;
    context.system = this.document.system;
    context.config = CONFIG.CW;
    
    // Force editable to true for the owner (fixes issues if isEditable is undefined)
    context.editable = this.document.isOwner; 

    // Debugging: Log this to your Console (F12) to ensure data exists
    console.log("CW | Preparing Item Sheet", {
        description: this.document.system.description,
        editable: context.editable
    });

    // Enrich HTML - Ensure we fallback to an empty string if null
    const rawDesc = this.document.system.description || "";
    context.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(
        rawDesc, 
        {
            async: true,
            secrets: this.document.isOwner,
            relativeTo: this.document
        }
    );
    
    context.traitTypes = { "merit": "Merit", "flaw": "Flaw" };
    
    return context;
  }
}