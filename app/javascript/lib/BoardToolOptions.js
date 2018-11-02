import Eventer from "./Eventer";

// ToolOptions is a collection of options, indexed by name and held in a sorted array
// Raises an event any time any value of an option changes
class ToolOptions extends Eventer{
  constructor() {
    super();
    this.options = new Map();
    this._version = 0;
  }

  get length() {
    return this._version && this.options.size;
  }

  add(opt) {
    if (!opt.name)
      throw "Options must have names";

    this._version += 1;
    this.options.set(opt.name, opt);
  }

  get(name) {
    return this._version && this.options.get(name);
  }

  each(iterator, context) {
    _.each(this.sorted, iterator, context);
  }

  clear() {
    this._version += 1;
    this.options.clear();
  }
}

export default ToolOptions;