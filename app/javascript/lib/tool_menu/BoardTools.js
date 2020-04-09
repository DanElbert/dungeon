import _has from "lodash/has";

class ToolMenuItem {
  constructor(name, options) {
    this.name = name;
    this.label = options.label;
    this.tooltip = options.tooltip;
    this.visible = _has(options, "visible") ? options.visible : true;
    this.selected = _has(options, "selected") ? options.selected : false;
    this.noClickthrough = _has(options, "noClickthrough") ? options.noClickthrough : false;
    this.glyph = options.glyph;
    this.children = options.children;
    this.handler = options.handler;
    this.type = _has(options, "type") ? options.type : "button";
    this.active = _has(options, "active") ? !!options.active : false;

    if (this.children) {
      this.children.forEach(c => c.parent = this);
    }
  }

  unselect() { this.selected = false; }

  unselectOtherChildren(keep) {
    this.children.forEach(c => {
      if (c.name != keep) { c.unselect(); }
    });
  }

  select() {
    this.selected = true;
    if (this.parent) {
      this.parent.unselectOtherChildren(this.name);
      this.parent.select();
    }
  }
}

class ToolMenuGroup extends ToolMenuItem {
  constructor(name, options, children) {
    if (arguments.length == 2) {
      children = options;
      options = {};
    }
    Object.assign(options, {children: children, type: "group"});
    super(name, options);
  }

  unselect() {
    super.unselect();
    if (this.children) {
      this.children.forEach(c => c.unselect());
    }
  }
}

class ZoomMenuItem extends ToolMenuItem {
  constructor(name, options) {
    super(name, options);
    this.type = "zoom";
    this.value = options.value || 1.0;
  }

  displayName() {
    return this.value;
  }
}

class CheckMenuItem extends ToolMenuItem {
  constructor(name, options) {
    super(name, options);

    this.type = "checkbox";
    this.value = options.value || false;
  }

  displayName() {
    return this.value;
  }
}

export {
  ToolMenuItem,
  ToolMenuGroup,
  ZoomMenuItem,
  CheckMenuItem
}