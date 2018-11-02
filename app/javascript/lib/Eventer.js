
class EventCriteria {
  constructor(eventString) {
    const parts = (eventString).split(".");
    this.name = parts.shift() || null;
    this.namespaces = parts;
  }

  empty() {
    return this.name === null && this.namespaces.length === 0;
  }
}

class EventListener {
  constructor(criteria, fn) {
    this.criteria = criteria;
    this.fn = fn;
  }

  matches(searchCriteria, fn) {
    if ((searchCriteria.empty() && !fn) || (searchCriteria.name && searchCriteria.name !== this.criteria.name)) {
      return false;
    }

    const nsMatch = searchCriteria.namespaces.every(ns => this.criteria.namespaces.includes(ns));
    const fnMatch = fn ? (fn === this.fn || fn === this.fn.fn) : true;

    return nsMatch && fnMatch;
  }
}

class Eventer {
  constructor(obj) {
    if (obj) return mixin(obj);
  }

  on(event, fn) {
    if (this._listeners === undefined) {
      this._listeners = [];
    }

    const criteria = new EventCriteria(event);
    if (criteria.name === null)
      throw "Invalid Event Name: " + event;

    this._listeners.push(new EventListener(criteria, fn));
    return this;
  }

  once(event, fn) {
    function wrapperFn() {
      this.off("", wrapperFn);
      fn.apply(this, arguments);
    }

    wrapperFn.fn = fn;

    return this.on(event, wrapperFn);
  }

  off(event, fn) {
    if (this._listeners === undefined) {
      return;
    }

    // all
    if (0 == arguments.length) {
      delete this._listeners;
      return this;
    }

    // specific event
    const criteria = new EventCriteria(event);
    this._listeners = this._listeners.filter(l => !l.matches(criteria, fn));

    if (this._listeners.length === 0) {
      delete this._listeners;
    }

    return this;
  }

  trigger(event) {
    if (this._listeners === undefined) {
      return;
    }

    const criteria = new EventCriteria(event);
    const args = [].slice.call(arguments, 1);
    this._listeners.filter(l => l.matches(criteria)).forEach(l => l.fn.apply(this, args));
  }
  //
  // listeners(event, fn) {
  //   if (this._listeners !== undefined) {
  //     const criteria = new EventCriteria(event);
  //     return this._listeners.filter(l => l.matches(criteria, fn));
  //   } else {
  //     return [];
  //   }
  // }
  //
  // hasListeners(event) {
  //   return !!this.listeners(event).length;
  // }
}

function mixin(obj) {
  for (var key in Eventer.prototype) {
    obj[key] = Eventer.prototype[key];
  }
  return obj;
}

export default Eventer;