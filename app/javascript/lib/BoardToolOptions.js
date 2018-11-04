import Eventer from "./Eventer";

class ToolOptions extends Eventer {
  constructor() {
    super();
    this.options = [];
  }

  get length() {
    return this.options.length;
  }

  add(opt) {
    if (!opt.name)
      throw "Options must have names";

    this.options.push(opt);
  }

  get(name) {
    return this.options.find(o => o.name === name) || null;
  }

  // each(iterator, context) {
  //   _.each(this.options, iterator, context);
  // }

  clear() {
    this.options = [];
  }
}

export default ToolOptions;