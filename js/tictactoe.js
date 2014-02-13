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
    game_options['ai_marker'] = opponent_marker(game_options['player_marker']);
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
  var dump_game_board = function(board) {
    for (y = 0; y < board.length; ++y) {
      row = board[y];
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
    console.log('stats', game_record);
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
      game_options['first_player'] = ['x', 'o'][Math.floor((Math.random() * 2))];
    }
    current_turn = game_options['player_marker'] === game_options['first_player'] ? 'player' : 'ai';

    start_game();
  });


  // * * * * * * * * * * * * * * * * * * * //
  // keeping track of game moves & progress

  // return whether or not it is the players turn
  var is_player_turn = function() {
    return (current_turn === 'player');
  };

  // check to see if the givem marker has won the game
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

  // record a specific move for a given marker
  var record_move = function(y, x, marker) {
    current_game_board[y][x] = marker;
    render_game_board();
  };
  
  var player_loses = function() {
    console.log('Player has lost!');
    $('winner').html('Player');
    game_record['losses']++;
    end_game();
  }

  var player_draws = function() {
    console.log('Game is a draw.');
    $('winner').html('DRAW');
    game_record['draws']++;
    end_game();
  }

  var player_wins = function() {
    console.log('Player has won!');
    $('winner').html('Player');
    game_record['wins']++;
    end_game();
  }

  // record a player move
  var player_move = function(y, x) {
    record_move(y, x, game_options['player_marker']);
    if (is_winner(current_game_board, game_options['player_marker'])) {
      player_wins();
    } else if (get_remaining_moves(current_game_board).length === 0) {
      player_draws();
    } else {
      current_turn = 'ai';
      ai_take_turn();
    }
  };

  // player clicks empty cell
  $('.empty').on('click', function(e) {
    if (is_player_turn() && $(this).hasClass('empty')) {
      player_move($(this).attr('y'), $(this).attr('x'));
    } else {
      console.log('not your turn!');
    }
  });


  // * * * * * * * * * * * * * * * * * * * //
  // Game moves - AI
  var mm_max = 99
  var mm_min = -mm_max;

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

  // look at all available spaces remaining and select one at ramdom
  var ai_make_random_move = function() {
    var moves = get_remaining_moves(current_game_board);
    var move = moves[Math.floor((Math.random() * moves.length))];
    ai_move(move[0], move[1]);
  };

  // select the best possible move for the ai give the current board
  var ai_make_best_move = function() {
    // first move can be random to keep things interesting
    if (get_remaining_moves(current_game_board).length === 9) {
      ai_make_random_move();
    } else {
      // look ahead at all possible remaining moves and select the move with the best outcome
      var board_clone = current_game_board.slice(0);
      move = find_best_move(board_clone, game_options['ai_marker'], 0, -mm_max, +mm_max);
      ai_move(move[0], move[1]);
    }
  };

  // get the mopponent's marker for the given marker
  var opponent_marker = function(marker) {
    return marker === 'x' ? 'o' : 'x';
  }

  // recursive search using alpha/beta pruning to determine the bext possible move for the given marker
  var find_best_move = function(board, marker, depth, alpha, beta) {
    // determine all possible moves remaining and if there are none we return a draw
    var moves = get_remaining_moves(board);
    if (moves.length === 0) {
      return 0;
    }

    // if this board is a win scenario weight it best/worst dpending on which marker wins and how deep we are
    // alpha is our best possible move, beta is our worst
    if (is_winner(board, marker)) {
      return 99 - depth;
    } else if (is_winner(board, opponent_marker(marker))) {
      return -99 + depth;
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
      player_losess();
    } else if (get_remaining_moves(current_game_board).length === 0) {
      player_draws();
    } else {
      current_turn = 'player';
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

});
