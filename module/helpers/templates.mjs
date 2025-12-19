export const preloadHandlebarsTemplates = async function() {
  // V13 moves loadTemplates to foundry.applications.handlebars
  // We use the namespaced version to avoid the deprecation warning
  return foundry.applications.handlebars.loadTemplates([
    "systems/colonial-weather/templates/actor/parts/header.hbs",
    "systems/colonial-weather/templates/actor/parts/attributes.hbs",
    "systems/colonial-weather/templates/actor/parts/skills.hbs",
    "systems/colonial-weather/templates/actor/parts/bio.hbs",
    "systems/colonial-weather/templates/parts/active-effects.hbs"
  ]);
};