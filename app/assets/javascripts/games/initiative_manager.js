function InitiativeManager(board, init_url) {
  this.board = board;
  this.container = this.board.mainMenu.getInitiativeContainer();
  this.isOpen = false;


  //this.initiativeWindow = $("<div />").appendTo(this.container);
  //this.initiativeWindow.dialog({
  //    autoOpen: true, //false,
  //    dialogClass: "initiative_dialog",
  //    title: "Initiative",
  //    width: 225,
  //    maxWidth: 360,
  //    position: {my: "right top", at: "right-20 top+20", of: "body"},
  //    open: function() {
  //      var $this = $(this);
  //      var position = $this.dialog( "option", "position" );
  //      $this.dialog("option", "position", position);
  //    }
  //});

  var bsModalMarkup = '\
<div class="modal modeless fade" tabindex="-1" role="dialog">\
  <div class="modal-dialog modal-sm">\
    <div class="modal-content">\
      <div class="modal-header">\
        <h5 class="modal-title">Initiative</h5>\
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
      </div>\
      <div class="modal-body"></div>\
    </div>\
  </div>\
</div>';

  this.initiativeWindow = $(bsModalMarkup).appendTo(this.container);

  var self = this;

  this.initiative = $("<div />")
      .appendTo(this.initiativeWindow.find(".modal-body"))
      .initiative({
        url: INITIATIVE_URL
      })
      .on("changed", function(e, evt) { self.triggerChanged(evt.initiative); });

  this.initiativeWindow.modal({
    backdrop: false,
    keyboard: false,
    show: false
  }).draggable({
    handle: ".modal-header"
  });

  this.initiativeWindow.on("shown.bs.modal", function() { self.isOpen = true; });
  this.initiativeWindow.on("hidden.bs.modal", function() { self.isOpen = false; });
}

_.extend(InitiativeManager.prototype, {

  toggleDisplay: function() {
    if (this.isOpen) {
      this.initiativeWindow.modal("hide");
    } else {
      this.initiativeWindow.modal("show");
    }
  },

  update: function(data) {
    this.initiative.initiative("update", data);
  },

  triggerChanged: function(data) {
    data = data || this.initiative.initiative("data");
    $(this).trigger('changed', {
      initiative: data
    });
  }
});