import Eventer from "../Eventer";

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

  clear() {
    this.options = [];
  }

  *[Symbol.iterator]() {
    for (let o of this.options) {
      yield o;
    }
  }
}

export default ToolOptions;