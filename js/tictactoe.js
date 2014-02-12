$(document).ready(function() {
  // game options object
  var game_options = {
    first_player: 'x',
    player_marker: 'x',
    ai_marker: 'o',
    difficulty: '90'
  };
  // game record object (keep track of player record)
  var game_record = {
    wins: 0,
    losses: 0,
    draws: 0
  }
  // our current game board
  var current_game_board = [
    ['empty','empty','empty'],
    ['empty','empty','empty'],
    ['empty','empty','empty']
  ];
  // keep track of who's turn it currently is
  var current_turn = 'player';

  // read game options and store locally
  var load_game_options = function() {
    game_options['player_marker'] = $('input[name=player_marker]:checked').val();
    game_options['ai_marker'] = game_options['player_marker'] == 'x' ? 'o' : 'x';
    game_options['first_player'] = $('input[name=first_marker]:checked').val();
    game_options['difficulty'] = $('#difficulty').val();
    console.log('game options', game_options);
  };


  // * * * * * * * * * * * * * * * * * * * //
  // drawing the game UI

  // render an individual game cell
  var render_cell = function(y, x, marker) {
    markers = ['x', 'o', 'empty'];
    markers = $.grep(markers, function(value) {
      return value != marker;
    });
    $('#row' + y + 'col' + x).removeClass(markers.join(' '));
    $('#row' + y + 'col' + x).addClass(marker);
    if (marker !== 'empty') {
      $('#row' + y + 'col' + x).html(marker.toUpperCase());
    } else {
      $('#row' + y + 'col' + x).html('&nbsp;');
    }
  };

  // render the current_game_board
  var render_game_board = function() {
    for (y = 0; y < current_game_board.length; ++y) {
      row = current_game_board[y];
      for (x = 0; x < row.length; ++x) {
        render_cell(y, x, row[x]);
      }
    }
  };

  // reset the game board
  var reset_game = function() {
    current_game_board = [
      ['empty','empty','empty'],
      ['empty','empty','empty'],
      ['empty','empty','empty']
    ];
    render_game_board();
  };

  // debugging to dump out the current state of the game to the console
  var dump_game_board = function() {
    for (y = 0; y < current_game_board.length; ++y) {
      row = current_game_board[y];
      console.log(y, row.join(' '));
    }
  };



  // * * * * * * * * * * * * * * * * * * * //
  // starting/ending a game

  // start a new game
  var start_game = function() {
    reset_game();
    $('#options').hide();
    $('#game').show();

    if (!is_player_turn()) {
      ai_take_turn();
    }
  };
  
  // end a game and show the "play again" options
  var end_game = function() {
    current_turn = 'none';
    $('#game_over').show();
  }

  // play again button click
  $('#play_again').on('click', function(e) {
    $('#options').show();
    $('#game').hide();
    $('#game_over').hide();
  });
    
  // begin game button click
  $('#start_game').on('click', function(e) {
    load_game_options();

    // see if we need to determine a random player to start
    if (game_options['first_player'] === 'random') {
      game_options['first_player'] = ['x', 'o'][Math.floor((Math.random()*2))];
    }
    current_turn = game_options['player_marker'] == game_options['first_player'] ? 'player' : 'ai';

    start_game();
  });
  
  
  // * * * * * * * * * * * * * * * * * * * //
  // keeping track of game moves & progress

  // return whether or not it is the players turn
  var is_player_turn = function() {
    return (current_turn === 'player');
  };
  
  // check to see if the givem marker has won the game
  var is_winner = function(marker) {
    // check diagonally
    if (current_game_board[0][0] === marker && current_game_board[1][1] === marker && current_game_board[2][2] === marker) {
      return true;
    }
    if (current_game_board[0][2] === marker && current_game_board[1][1] === marker && current_game_board[2][0] === marker) {
      return true;
    }
    for (i = 0; i < 3; ++i) {
      // check vertically
      if (current_game_board[i][0] === marker && current_game_board[i][1] === marker && current_game_board[i][2] === marker) {
        return true;
      }
      // check horizontally
      if (current_game_board[0][i] === marker && current_game_board[1][i] === marker && current_game_board[2][i] === marker) {
        return true;
      }
    }
    return false;
  };

  // check to see if all moves have been taken
  var moves_remaining = function() {
    var moves_remaining = 9;
    for (y = 0; y < current_game_board.length; ++y) {
      row = current_game_board[y];
      for (x = 0; x < row.length; ++x) {
        if (row[x] !== 'empty') {
          moves_remaining--;
        }
      }
    }
    return moves_remaining;
  };

  // record a specific move for a given marker
  var record_move = function(y, x, marker) {
    console.log(y,x,marker);
    current_game_board[y][x] = marker;
    render_game_board();
  };

  // record a player move
  var player_move = function(y, x) {
    record_move(y, x, game_options['player_marker']);
    if (is_winner(game_options['player_marker'])) {
      // TODO: this
      console.log('Player has won!');
      game_record['wins']++;
      end_game();
    } else if (moves_remaining() === 0) {
      // TODO: this
      console.log('Game is a draw.');
      game_record['draws']++;
      end_game();
    } else {
      current_turn = 'ai';
      ai_take_turn();
    }
  };

  // player clicks empty cell
  $('.empty').on('click', function(e) {
    if (is_player_turn()) {
      player_move($(this).attr('y'), $(this).attr('x'));
    } else {
      console.log('not your turn!');
    }
  });


  // * * * * * * * * * * * * * * * * * * * //
  // Game moves - AI

  // look at all available spaces remaining and select one at ramdom
  var ai_make_random_move = function() {
    // TODO:  go through entire board and select a random space to place our marker
    var y = 0;
    var x = 0;
    ai_move(y, x);
  };

  // select the best possible move for the ai give the current board
  var ai_make_best_move = function() {
    // TODO:  look ahead at all possible remaining moves and select the move with the best outcome
    ai_make_random_move();
  };

  // record an AI move
  var ai_move = function(y, x) {
    record_move(y, x, game_options['ai_marker']);
    if (is_winner(game_options['ai_marker'])) {
      // TODO: this
      console.log('AI has won!');
      game_record['losses']++;
      end_game();
    } else if (moves_remaining() === 0) {
      // TODO: this
      console.log('Game is a draw.');
      game_record['draws']++;
      end_game();
    } else {
      current_turn = 'player';
    }
  };

  // let the AI take a turn
  var ai_take_turn = function() {
    // simple AI based on difficulty, if some random number is less than our difficulty level select a random move, otherwise select the best move possible
    if (Math.floor((Math.random()*99)+1) < game_options['difficulty']) {
      console.log('ai making random move');
      ai_make_random_move();
    } else {
      console.log('ai making best move');
      ai_make_best_move();
    }
  };
  
});
