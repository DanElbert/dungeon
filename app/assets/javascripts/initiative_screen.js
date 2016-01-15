
var GAME_SERVER_URL = 'OVERRIDE THIS IN VIEW';
var GAME_ID = 'OVERRIDE THIS IN VIEW';
var USER_ID = 'OVERRIDE THIS IN VIEW';
var USER_AUTH_TOKEN = 'OVERRIDE THIS IN VIEW';
var INITIAL_DATA = 'OVERRIDE THIS IN VIEW';
var INITIATIVE_URL = 'OVERRIDE';


$(document).ready(function() {
  this.gameServerClient = new Faye.Client(GAME_SERVER_URL);
  this.gameServerClient.addExtension(
      {
        outgoing: function(message, callback) {
          message['ext'] = message['ext'] || {};
          message['ext']['user_id'] = USER_ID;
          message['ext']['auth_token'] = USER_AUTH_TOKEN;
          callback(message);
        }
      });

  var $init = $("#init_box").initiative({
    url: INITIATIVE_URL
  });

  var initiative = {
    update: function(data) {
      $init.initiative("update", data);
    }
  };

  var board = {initiative: initiative};

  var initiativeManager = new ActionMessenger(this.gameServerClient, '/game/' + GAME_ID + '/update_initiative', function(message) {
    var action = attachActionMethods(message);

    if (action.actionType == 'updateInitiativeAction') {
      action.apply(board);
    }
  });

  initiativeManager.connect();

  initiative.update(INITIAL_DATA);

  $init.on('changed', function(e, evt) {
    var action = {actionType: "updateInitiativeAction", initiative: evt.initiative, uid: generateActionId()};
    action = attachActionMethods(action);
    action.apply(board);
    initiativeManager.sendActionMessage(action.serialize());
  });
});