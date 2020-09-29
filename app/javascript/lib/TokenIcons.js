// Authoritative list of available token icons

class TokenIcon {
  constructor(name, faIcon, color) {
    this.name = name;
    this.faIcon = faIcon;
    this.color = color;
  }

  get fontAwesomeId() {
    return this.faIcon.split(":");
  }
}

class TokenIcons {
  constructor() {
    this._icons = new Map();
  }

  get available() {
    return [...this._icons.values()];
  }

  getIcon(name) {
    return this._icons.get(name) || null;
  }

  addIcon(i) {
    this._icons.set(i.name, i);
  }
}

const icons = new TokenIcons();

icons.addIcon(new TokenIcon("stunned", "far:dizzy", "#000000"));
icons.addIcon(new TokenIcon("poisoned", "fas:skull-crossbones", "#00DD00"));
icons.addIcon(new TokenIcon("bleeding", "fas:heart", "#DD0000"));
icons.addIcon(new TokenIcon("slowed", "fas:anchor", "#000000"));
icons.addIcon(new TokenIcon("burning", "fas:burn", "#DD0000"));

export default icons;