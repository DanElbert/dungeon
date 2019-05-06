import cable from "actioncable";

let actioncableConsumer = null;

function getConsumer() {
  if (actioncableConsumer === null) {
    actioncableConsumer = cable.createConsumer();
  }
  return actioncableConsumer;
}

class ActionMessenger {
  constructor(channel, params, callback) {
    this.consumer = getConsumer();
    const subParams = Object.assign({channel: channel}, params || {});
    this.channel = this.consumer.subscriptions.create(subParams, {
      received: msg => this.handleAddActionMessage(msg)
    });

    this.sentMessageIds = [];
    this.callback = callback;
    this.ignoreReflections = true;
  }

  handleAddActionMessage(message) {
    var index = this.sentMessageIds.findIndex(i => i === message.uid);
    if (index >= 0) {
      this.sentMessageIds.splice(index, 1);
    } else {
      this.callback(message);
    }
  }

  sendActionMessage(action) {
    if (this.ignoreReflections) {
      this.sentMessageIds.push(action.uid);
    }

    this.channel.perform("add_action", action);
  }
}



export {
  ActionMessenger
};