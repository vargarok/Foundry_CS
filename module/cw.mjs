import { CW } from "./config.mjs";
import { CWActor } from "./documents/actor.mjs";
import { CWItem } from "./documents/item.mjs";
import { CWActorSheet } from "./sheets/actor-sheet.mjs";
import { CWItemSheet } from "./sheets/item-sheet.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";

Hooks.once("init", function() {
  console.log("Colonial Weather | Initializing System");

  game.cw = {
    CWActor,
    CWItem
  };

  CONFIG.CW = CW;
  CONFIG.Actor.documentClass = CWActor;
  CONFIG.Item.documentClass = CWItem;

  // Register Sheets (V13 Strict Mode)
  // Unregister the default Core sheets (which are now Legacy AppV1 sheets)
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  
  foundry.documents.collections.Actors.registerSheet("colonial-weather", CWActorSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: "Colonial Weather Actor"
  });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  
  foundry.documents.collections.Items.registerSheet("colonial-weather", CWItemSheet, {
    makeDefault: true,
    label: "Colonial Weather Item"
  });

  preloadHandlebarsTemplates();
});