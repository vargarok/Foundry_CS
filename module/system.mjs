// Colonial Weather System - v13 ApplicationV2 implementation
import { CWActor } from "./actor/cw-actor.mjs";
import { CWItem } from "./item/cw-item.mjs";

export const CW = {
  ID: "colonial-weather",
  ATTR_ORDER: ["str","dex","sta","cha","soc","app","int","edu","wit"],
  GRAVITIES: ["Zero","Low","Normal","High"]
};

Hooks.once("init", function() {
  console.log("Colonial Weather | Initializing V13 system");

  // Assign document classes
  CONFIG.Actor.documentClass = CWActor;
  CONFIG.Item.documentClass  = CWItem;

  // Register V2 sheets
  const { HandlebarsApplicationMixin } = foundry.applications.api;
  const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;

  class CWCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    static DEFAULT_OPTIONS = {
      id: "cw-character-sheet",
      tag: "form",
      classes: ["cw","sheet","actor"],
      window: { title: "CW.SheetActor" },
      form: { submitOnChange: true, closeOnSubmit: false },
      actions: {
        rollSkill: this.#onRollSkill,
        hitLoc:    this.#onHitLocation
      }
    };

    static PARTS = {
      form: { template: "systems/colonial-weather/templates/actor/character-sheet-v2.hbs" }
    };

    static async #onRollSkill(event, target) {
      const section = target.closest(".skill-row");
      const skillKey = section?.dataset?.skill;
      const sheet = this;
      const actor = sheet.document;
      await CW.rollPool(actor, skillKey);
    }

    static async #onHitLocation(event, target) {
      const sheet = this;
      const actor = sheet.document;
      const { value, label } = await CW.rollHitLocation();
      await actor.update({ "system.health.location": value });
      ui.notifications?.info(`Hit location: ${label} (${value})`);
    }

    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      const a = this.document.system?.attributes ?? {};
      const s = this.document.system?.skills ?? {};
      context.attributes = a;
      context.skills     = s;
      context.attrOrder  = CW.ATTR_ORDER;
      context.gravities  = CW.GRAVITIES;
      return context;
    }
  }

  class CWItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    static DEFAULT_OPTIONS = {
      id: "cw-item-sheet",
      tag: "form",
      classes: ["cw","sheet","item"],
      window: { title: "CW.SheetItem" },
      form: { submitOnChange: true, closeOnSubmit: false }
    };

    static PARTS = {
      form: { template: "systems/colonial-weather/templates/item/item-sheet-v2.hbs" }
    };
  }

  // Register sheets via namespaced collections (V13)
  foundry.documents.collections.Actors.registerSheet(CW.ID, CWCharacterSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: "CW.SheetActor"
  });

  foundry.documents.collections.Items.registerSheet(CW.ID, CWItemSheet, {
    makeDefault: true,
    label: "CW.SheetItem"
  });

  // Expose convenience API
  game.cw = {
    rollPool: CW.rollPool,
    rollHitLocation: CW.rollHitLocation
  };
});

CW.rollPool = async function(actor, skillKey) {
  const sys = actor.system ?? {};
  const sk = sys.skills?.[skillKey] ?? { value: 0, label: skillKey ?? "Skill", attr: "dex", specialized: false };
  const attrKey = sk.attr || "dex";
  const attr = sys.attributes?.[attrKey]?.value ?? 0;
  const pool = (Number(attr) || 0) + (Number(sk.value) || 0);
  const bonus = sk.specialized ? 1 : 0;
  const dice = Math.max(pool + bonus, 1);
  const roll = await (new Roll(`${dice}d10`)).evaluate();

  const results = roll.dice?.[0]?.results ?? [];
  const successes = results.filter(r => (r.result ?? 0) >= 6).length;
  const botch = (successes === 0) && results.some(r => r.result === 1);

  const label = sk.label ?? skillKey ?? "Skill";
  const flavor = `<strong>${foundry.utils.escapeHTML(actor.name)}</strong> rolls <em>${foundry.utils.escapeHTML(label)}</em> (${attrKey.toUpperCase()}+${foundry.utils.escapeHTML(label)})`;
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor });
  return { successes, botch, dice };
};

CW.rollHitLocation = async function() {
  const r = await (new Roll("1d10")).evaluate();
  const total = r.total ?? 0;
  const map = {1:"Head", 2:"Chest", 3:"Stomach", 4:"Stomach", 5:"Right leg", 6:"Left leg", 7:"Right leg", 8:"Left leg", 9:"Right arm", 10:"Left arm"};
  const label = map[total] ?? String(total);
  await r.toMessage({ flavor: `Hit Location: ${label}` });
  return { value: total, label };
};
