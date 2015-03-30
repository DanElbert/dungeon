function PingTool(board) {
  Tool.call(this, board);
  this.super = Tool.prototype;
  this.color = null;
}
PingTool.prototype = _.extend(PingTool.prototype, Tool.prototype, {
  buildOptions: function() {
    this.options.add({type: "color", name: "color", label: "Color", value: "#EE204D"});
  },

  optionsChanged: function() {
    this.color = this.options.get("color").value;
  },
  enable: function() {
    var self = this;
    var board = this.board;

    $(board.event_manager).on('click.PingTool', function(evt, mapEvt) {
      var action = {actionType: "pingAction", point: mapEvt.mapPoint, color: self.color, uid: generateActionId()};
      self.board.addAction(action, null, true);
    });
  },
  disable: function() {
    $(this.board.event_manager).off(".PingTool");
  },
  draw: function() {}
});