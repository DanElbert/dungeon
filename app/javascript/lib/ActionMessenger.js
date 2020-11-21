import { getConsumer } from "./actionCable";

class ActionMessenger {
  constructor(channel, params, callback) {
    this.consumer = getConsumer();
    const subParams = Object.assign({channel: channel}, params || {});

    this.sentMessageIds = new Set();
    this.callback = callback;
    this.ignoreReflections = true;
    this.connected = false;
    this.onConnected = null;
    this.onDisconnected = null;

    this.channel = this.consumer.subscriptions.create(subParams, {
      received: msg => this.handleAddActionMessage(msg),
      connected: () => this.handleConnected(),
      disconnected: opts => this.handleDisconnected(opts)
    });
  }

  handleDisconnected(opts) {
    this.connected = false;
    if (opts.willAttemptReconnect) {
      if (this.onDisconnected !== null) {
        this.onDisconnected();
      }
    }
  }

  handleConnected() {
    this.connected = true;
    if (this.onConnected !== null) {
      this.onConnected();
    }
  }

  handleAddActionMessage(message) {
    if (this.sentMessageIds.has(message.uid)) {
      this.sentMessageIds.delete(message.uid);
    } else {
      this.callback(message);
    }
  }

  sendActionMessage(action) {
    if (this.ignoreReflections) {
      this.sentMessageIds.add(action.uid);
    }

    this.channel.perform("add_action", action);
  }
}



export {
  ActionMessenger
};