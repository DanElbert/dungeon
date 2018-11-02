class ToolMenuItem {
  constructor(name, options) {
    this.name = name;
    this.label = options.label;
    this.tooltip = options.tooltip;
    this.visible = _.has(options, "visible") ? options.visible : true;
    this.selected = _.has(options, "selected") ? options.selected : false;
    this.noClickthrough = _.has(options, "noClickthrough") ? options.noClickthrough : false;
    this.glyph = options.glyph;
    this.children = options.children;
    this.handler = options.handler;
    this.type = _.has(options, "type") ? options.type : "button";

    _.each(this.children, function(c) {c.parent = this;}, this);
  }

  unselect() { this.selected = false; }

  unselectOtherChildren(keep) {
    _.each(this.children, function(c) {
      if (c.name != keep) {c.unselect();}
    }, this);
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
    _.extend(options, {children: children, type: "mainButton"});
    super(name, options);
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