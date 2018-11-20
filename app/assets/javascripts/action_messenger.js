
function ActionMessenger(client, url, callback) {
  this.client = client;
  this.url = url;
  this.sentMessageIds = [];
  this.callback = callback;
  this.subscription = null;
  this.ignoreReflections = true;
}

_.extend(ActionMessenger.prototype, {

  connect: function() {
    var self = this;
    this.subscription = this.client.subscribe(this.url, function(message) {
      self.handleAddActionMessage(message);
    });
  },

  handleAddActionMessage: function(message) {
    var index = _.indexOf(this.sentMessageIds, message.uid);
    if (index >= 0) {
      this.sentMessageIds.splice(index, 1);
    } else {
      this.callback(message);
    }
  },

  sendActionMessage: function(action) {
    if (this.subscription == null) throw "Messenger is not connected";
    if (this.ignoreReflections) {
      this.sentMessageIds.push(action.uid);
    }
    // Publish action, omitting any privateData
    this.client.publish(this.url, action);
  }

});