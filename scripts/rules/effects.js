// scripts/rules/effects.js
export function collectRollMods(actor, context) {
  const out = { dicePool: 0, initiative: 0, sources: [] };
  const tags = new Set(context?.tags ?? []);

  for (const it of actor.items ?? []) {
    const bundles = [];
    if (Array.isArray(it.system?.effects)) bundles.push(it.system.effects);
    if (Array.isArray(it.system?.onUse))   bundles.push(it.system.onUse);

    for (const arr of bundles) for (const eff of arr) {
      if (!eff?.mods) continue;

      // allow easy CSV tag editing in HBS
      if (eff.when?.tagsCsv && !eff.when?.tags) {
        eff.when.tags = eff.when.tagsCsv.split(",").map(s => s.trim()).filter(Boolean);
      }

      const rollOk = !eff.when?.rollType || eff.when.rollType === context.rollType;
      const tagsOk = !eff.when?.tags?.length || eff.when.tags.every(t => tags.has(t));
      if (!rollOk || !tagsOk) continue;

      for (const m of eff.mods) {
        const v = Number(m?.value) || 0;
        if (m.path === "dicePool"   && m.op === "add") out.dicePool   += v;
        if (m.path === "initiative" && m.op === "add") out.initiative += v;
      }
      out.sources.push(eff.label || it.name);
    }
  }
  return out;
}
globalThis.CWEffects = { collectRollMods };