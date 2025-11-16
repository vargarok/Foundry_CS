export class CWActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
    const s = this.system ?? {};
    s.derived ||= {};

    const home = String(s.bio?.gravityHome ?? "Normal").toLowerCase();
    const here = String(s.bio?.gravityCurrent ?? "Normal").toLowerCase();
    const g = this._gravityMods(home, here);

    const base = s.attributes ?? {};
    const eff = {
      str: (Number(base.str?.value) || 0) + g.str,
      dex: (Number(base.dex?.value) || 0) + g.dex,
      sta: (Number(base.sta?.value) || 0) + g.sta
    };

    s.derived.effective = eff;
  }

  _gravityMods(home, here) {
    const table = {
      "zero":   {"zero":[0,0,0], "low":[+1,-1,0], "normal":[+2,-1,0], "high":[+3,-2,+2]},
      "low":    {"zero":[-1,0,-1], "low":[0,0,0], "normal":[+1,0,0], "high":[+2,-1,+2]},
      "normal": {"zero":[-2,+1,-2], "low":[-1,0,-1], "normal":[0,0,0], "high":[+1,0,+1]},
      "high":   {"zero":[-3,+2,-3], "low":[-2,+1,-2], "normal":[-1,0,-1], "high":[0,0,0]}
    };
    const arr = (table[home]?.[here]) || [0,0,0];
    return {str:arr[0], dex:arr[1], sta:arr[2]};
  }
}
