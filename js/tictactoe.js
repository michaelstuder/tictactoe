// * * * * * * * * * * * * * * * * * * * //
// Tic Tac Toe
// Author: Michael Studer (michael@studer.us)
// Date: 2014-02-14
// Description:  A tic-tac-toe game with unbeatable AI

$(document).ready(function() {

  // * * * * * * * * * * * * * * * * * * * //
  // variables and configurations

  // game options object (with defaults)
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

  // the game board
  var current_game_board = [
    ['empty','empty','empty'],
    ['empty','empty','empty'],
    ['empty','empty','empty']
  ];

  // the current player who is taking a turn
  var current_player = 'no one';


  // * * * * * * * * * * * * * * * * * * * //
  // basic game mechanics for starting/ending/etc games

  // read in the user selected game options
  var load_game_options = function() {
    game_options['player_marker'] = $('input[name=player_marker]:checked').val();
    game_options['ai_marker'] = opponent_marker(game_options['player_marker']);
    game_options['first_player'] = $('input[name=first_marker]:checked').val();
    game_options['difficulty'] = $('#difficulty').val();

    // update some display components based on options
    $('#current_difficulty').html('Opponent difficulty: ' + $('#difficulty option:selected').text());
    $('#player_marker_display').html(game_options['player_marker'].toUpperCase());
    $('#player_marker_display').removeClass(game_options['ai_marker']);
    $('#player_marker_display').addClass(game_options['player_marker']);
  };

  // start a new game
  var start_game = function() {
    // load the game options
    load_game_options();

    // see if we need to determine a random player to start
    if (game_options['first_player'] === 'random') {
      game_options['first_player'] = ['x', 'o'][Math.floor((Math.random() * 2))];
    }

    // set the current player
    if (game_options['player_marker'] === game_options['first_player']) {
      set_player('player');
    } else {
      set_player('ai');
    }

    // clear the current game board
    reset_game();
    $('#game').show();

    // determine who takes the first move
    if (!is_player_turn()) {
      ai_take_turn();
    }
  };

  // end a game and show the results
  var end_game = function() {
    set_player('no one');
    render_stats();
    $('#game_over_modal').modal({ backdrop: 'static', show: true });
  }

  // reset the game board
  var reset_game = function() {
    current_game_board = [
      ['empty','empty','empty'],
      ['empty','empty','empty'],
      ['empty','empty','empty']
    ];
    render_game_board();
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

  // debugging to dump out the current state of the game to the console
  var dump_game_board = function(board) {
    for (y = 0; y < board.length; ++y) {
      row = board[y];
      console.log(y, row.join(' '));
    }
  };

  // render the current statistics
  var render_stats = function() {
    $.each(game_record, function(stat, value) {
      $('#' + stat).html(value);
    });
  }


  // * * * * * * * * * * * * * * * * * * * //
  // user interaction event handling

  // player clicks game space
  $('#game td').on('click', function(e) {
    if (!is_player_turn()) {
      alert('It is not your turn!');
    } else if ($(this).hasClass('empty')) {
      player_move($(this).attr('y'), $(this).attr('x'));
    } else {
      alert('This space has already been played!');
    }
  });

  // settings button click
  $('#show_game_options').on('click', function(e) {
    $('#game_options_modal').modal({ backdrop: 'static', show: true });
  });

  // begin game click
  $(document).on('click', '.start_game', function(e) {
    $('#game_options_modal').modal('hide');
    $('#game_over_modal').modal('hide');
    start_game();
  });

  // reset statistics button
  $('#reset_stats').on('click', function(e) {
    if (confirm('Click OK to reset your game statistics')) {
      game_record = {
        wins: 0,
        losses: 0,
        draws: 0
      }
      render_stats();
    }
  });


  // * * * * * * * * * * * * * * * * * * * //
  // keeping track of game moves & progress

  // set who the current player is
  var set_player = function(player) {
    current_player = player;
    var message = current_player === 'ai' ? "Opponent is thinking..." : "It is your turn!";
    message = current_player === 'no one' ? 'Game over! <a href="#" class="start_game ga" ga-cat="link" ga-label="tictactoe gameover board play again">Play Again</a>' : message;
    $('#current_player').html(message);
  }

  // return whether or not it is the players turn
  var is_player_turn = function() {
    return (current_player === 'player');
  };

  // check to see if the given marker has won the game
  var is_winner = function(board, marker) {
    // check diagonally
    if (board[0][0] === marker && board[1][1] === marker && board[2][2] === marker) {
      return true;
    }
    if (board[0][2] === marker && board[1][1] === marker && board[2][0] === marker) {
      return true;
    }
    for (i = 0; i < 3; ++i) {
      // check vertically
      if (board[i][0] === marker && board[i][1] === marker && board[i][2] === marker) {
        return true;
      }
      // check horizontally
      if (board[0][i] === marker && board[1][i] === marker && board[2][i] === marker) {
        return true;
      }
    }
    return false;
  };

  // check through a board and return a list of remaining moves
  var get_remaining_moves = function(board) {
    moves = [];
    for (y = 0; y < board.length; ++y) {
      row = board[y];
      for (x = 0; x < row.length; ++x) {
        if (row[x] === 'empty') {
          moves.push([y,x]);
        }
      }
    }
    return moves;
  }

  // player win scenario
  var player_wins = function() {
    $('#game_over_icon').html('<span class="glyphicon glyphicon-thumbs-up"></span>');
    $('#game_over_title').html('You won!');
    $('#game_over_message').html('Congratulations!  Why don\'t you try against a harder opponent?');
    game_record['wins']++;
    end_game();
  }

  // player lose scenario
  var player_loses = function() {
    $('#game_over_icon').html('<span class="glyphicon glyphicon-thumbs-down"></span>');
    $('#game_over_title').html('You lost...');
    $('#game_over_message').html('Better luck next time.  Did you know that if played properly it is impossible to lose a game of tic-tac-toe? (Though it is still possible to end in a draw.)');
    game_record['losses']++;
    end_game();
  }

  // player draw scenario
  var player_draws = function() {
    $('#game_over_icon').html('<span class="glyphicon glyphicon-random"></span>');
    $('#game_over_title').html('Draw');
    $('#game_over_message').html('You almost had em!  In your defense, when played properly, every single game of tic-tac-toe will end in a draw.');
    game_record['draws']++;
    end_game();
  }

  // record a specific move for a given marker
  var record_move = function(y, x, marker) {
    current_game_board[y][x] = marker;
    render_game_board();
  };

  // record a player move
  var player_move = function(y, x) {
    record_move(y, x, game_options['player_marker']);
    if (is_winner(current_game_board, game_options['player_marker'])) {
      player_wins();
    } else if (get_remaining_moves(current_game_board).length === 0) {
      player_draws();
    } else {
      set_player('ai');
      // delay the AI move slightly to give the user a sense that their opponent is actually "thinking"
      setTimeout(function() {
        ai_take_turn();
      }, 150);
    }
  };

  // get the mopponent's marker for the given marker
  var opponent_marker = function(marker) {
    return marker === 'x' ? 'o' : 'x';
  }


  // * * * * * * * * * * * * * * * * * * * //
  // artificial intelligence

  // alpha/beta max (for scoring best moves)
  var ab_max = 100;

  // look at all available spaces remaining and select one at random
  var ai_make_random_move = function() {
    var moves = get_remaining_moves(current_game_board);
    var move = moves[Math.floor((Math.random() * moves.length))];
    ai_move(move[0], move[1]);
  };

  // select the best possible move for the ai give the current board
  var ai_make_best_move = function() {
    // first move can be random to keep things interesting (otherwise the optimal move is always the center cell)
    if (get_remaining_moves(current_game_board).length === 9) {
      ai_make_random_move();
    } else {
      // look ahead at all possible remaining moves and select the move with the best outcome
      var board_clone = current_game_board.slice(0);
      move = find_best_move(board_clone, game_options['ai_marker'], 0, -ab_max, ab_max);
      ai_move(move[0], move[1]);
    }
  };

  // recursive search using alpha/beta pruning to determine the bext possible move for the given marker
  var find_best_move = function(board, marker, depth, alpha, beta) {
    // determine all possible moves remaining
    var moves = get_remaining_moves(board);

    // if this board is a win scenario weigh it best/worst depending on which marker wins and how deep we are
    // alpha is our best possible move, beta is our worst
    if (is_winner(board, marker)) {
      return ab_max - depth;
    } else if (is_winner(board, opponent_marker(marker))) {
      return -ab_max + depth;
    }

    // if there are no moves remaining we return a draw
    if (moves.length === 0) {
      return 0;
    }


    // keep track of the best move we can find
    var best_move = [];

    // loop over the currently available moves on the board
    for (var i = 0; i < moves.length; i++) {
      var move = moves[i];

      // temporarily make the move
      board[move[0]][move[1]] = marker;

      // recursively get the best score from the child tree (opponents move is next)
      // we invert alpha and beta here since the next move will be made by our opponent
      var opponent_score = find_best_move(board, opponent_marker(marker), depth + 1, -beta, -alpha);

      // revert the move
      board[move[0]][move[1]] = 'empty';

      // beta will be less than alpha if we've gone down a branch resulting in less than ideal play,
      // there's no point in exploring this branch so we can stop looking for results immediately.
      // this prevents us from performing unnecessary computation resulting in a slow AI
      if (beta < alpha) {
        break;
      }

      // see if the inverse of the opponents score is in our favor, if so, set it as our new best path
      if (-opponent_score > alpha) {
        alpha = -opponent_score;
        // if we're back up to the top level of the tree then we've found our best score, flag this as our best move
        if (depth === 0) {
          best_move = move;
        }
      }

    }
    // if we've made it back out of the recursion so we can return the best move we found
    if (depth === 0) {
      return best_move;
    }

    // if we're still traversing the tree we return the score for this depth
    return alpha;
  };

  // record an AI move
  var ai_move = function(y, x) {
    record_move(y, x, game_options['ai_marker']);
    if (is_winner(current_game_board, game_options['ai_marker'])) {
      player_loses();
    } else if (get_remaining_moves(current_game_board).length === 0) {
      player_draws();
    } else {
      set_player('player');
    }
  };

  // AI takes a turn
  var ai_take_turn = function() {
    // simple AI based on difficulty, if some random number is less than our difficulty level select a random move, otherwise select the best move possible
    if (Math.floor((Math.random() * 100)) < game_options['difficulty']) {
      ai_make_random_move();
    } else {
      ai_make_best_move();
    }
  };


  // * * * * * * * * * * * * * * * * * * * //
  // once the page has loaded start a game with the default settings

  start_game();

});
