// scripts/item/cw-item.js
export class CWItem extends Item {}
CONFIG.Item.documentClass = CONFIG.Item.documentClass ?? CWItem;
