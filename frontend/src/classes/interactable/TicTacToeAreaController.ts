import {
  GameArea,
  GameMoveCommand,
  GameStatus,
  InteractableCommand,
  TicTacToeGameState,
  TicTacToeGridPosition,
  TicTacToeMove,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type TicTacToeCell = 'X' | 'O' | undefined;
export type TicTacToeEvents = GameEventTypes & {
  board: (board: TicTacToeCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Tic Tac Toe game, and for sending commands to the server
 */
export default class TicTacToeAreaController extends GameAreaController<
  TicTacToeGameState,
  TicTacToeEvents
> {
  /**
   * Returns the current state of the board.
   *
   * The board is a 3x3 array of TicTacToeCell, which is either 'X', 'O', or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[2][2] is the bottom-right cell
   */
  get board(): TicTacToeCell[][] {
    const ret: TicTacToeCell[][] = [
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ];
    const currentBoard: ReadonlyArray<TicTacToeMove> | undefined = this._model.game?.state.moves;
    if (currentBoard !== undefined) {
      for (const move of currentBoard) {
        ret[move.row][move.col] = move.gamePiece;
      }
    }
    return ret;
  }

  /**
   * Returns the player with the 'X' game piece, if there is one, or undefined otherwise
   */
  get x(): PlayerController | undefined {
    if (this._model.game === undefined || this._model.game.state.x === undefined) {
      return undefined;
    }
    /* for (const player of this.players) {
      if (player !== undefined && player.id === this._model.game.state.x) {
        return player;
      }
    }*/
    for (const observer of this.observers) {
      if (observer !== undefined && observer.id === this._model.game.state.x) {
        return observer;
      }
    }

    return undefined;
  }

  /**
   * Returns the player with the 'O' game piece, if there is one, or undefined otherwise
   */
  get o(): PlayerController | undefined {
    if (this._model.game === undefined || this._model.game.state.o === undefined) {
      return undefined;
    }
    /* for (const player of this.players) {
      if (player !== undefined && player.id === this._model.game.state.o) {
        return player;
      }
    } */
    for (const observer of this.observers) {
      if (observer !== undefined && observer.id === this._model.game.state.o) {
        return observer;
      }
    }
    return undefined;
  }

  /**
   * Returns the number of moves that have been made in the game
   */
  get moveCount(): number {
    const game = this._model.game;
    if (game === undefined) {
      return 0;
    } else {
      return game.state.moves.length;
    }
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    const game = this._model.game;
    if (game === undefined || this._model.game?.state.status !== 'OVER') {
      return undefined;
    }
    /* for (const player of this.players) {
      if (player !== undefined && player.id === this._model.game.state.winner) {
        return player;
      }
    } */
    for (const observer of this.observers) {
      if (observer !== undefined && observer.id === this._model.game.state.winner) {
        return observer;
      }
    }
    return undefined;
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   */
  get whoseTurn(): PlayerController | undefined {
    const game = this._model.game;
    if (game === undefined || game.state.status !== 'IN_PROGRESS') {
      return undefined;
    }
    const gamePieceToBePlayed =
      game.state.moves.length === 0
        ? 'X'
        : game.state.moves[game.state.moves.length - 1].gamePiece === 'X'
        ? 'O'
        : 'X';
    /* for (const player of this.players) {
      if (player !== undefined) {
        if (
          (gamePieceToBePlayed === 'X' && player.id === game.state.x) ||
          (gamePieceToBePlayed === 'O' && player.id === game.state.o)
        ) {
          return player;
        }
      }
    }*/
    for (const observer of this.observers) {
      if (observer !== undefined) {
        if (
          (gamePieceToBePlayed === 'X' && observer.id === game.state.x) ||
          (gamePieceToBePlayed === 'O' && observer.id === game.state.o)
        ) {
          return observer;
        }
      }
    }
    return undefined;
  }

  /**
   * Returns true if it is our turn to make a move in the game
   * Returns false if it is not our turn, or if the game is not in progress
   */

  get isOurTurn(): boolean {
    const ourPlayer: PlayerController = this._townController.ourPlayer;
    const playerWhosTurnItIs: PlayerController | undefined = this.whoseTurn;
    return playerWhosTurnItIs !== undefined && ourPlayer === playerWhosTurnItIs;
    /* const game = this._model.game;
    if (game === undefined || game.state.status !== 'IN_PROGRESS') {
      return false;
    }
    const gamePieceToBePlayed =
      game.state.moves.length === 0
        ? 'X'
        : game.state.moves[game.state.moves.length - 1].gamePiece === 'X'
        ? 'O'
        : 'X';

    if (
      (gamePieceToBePlayed === 'X' && ourPlayersId === game?.state.x) ||
      (gamePieceToBePlayed === 'O' && ourPlayersId === game.state.o)
    ) {
      return true;
    }
    return false;*/
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    const ourPlayer = this._townController.ourPlayer;
    const game = this._model.game;
    if (game === undefined) {
      return false;
    }
    return (
      (game.players[0] !== undefined && game.players[0] === ourPlayer.id) ||
      (game.players[1] !== undefined && game.players[1] === ourPlayer.id)
    );
  }

  /**
   * Returns the game piece of the current player, if the current player is a player in this game
   *
   * Throws an error PLAYER_NOT_IN_GAME_ERROR if the current player is not a player in this game
   */
  get gamePiece(): 'X' | 'O' {
    const currentPlayer: PlayerController = this._townController.ourPlayer;
    const game = this._model.game;
    if (game === undefined) {
      throw new Error(PLAYER_NOT_IN_GAME_ERROR);
    }
    if (currentPlayer.id === game.state.x) {
      return 'X';
    }
    if (currentPlayer.id === game.state.o) {
      return 'O';
    }
    throw new Error(PLAYER_NOT_IN_GAME_ERROR);
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    const game = this._model.game;
    if (game === undefined || this._model.game?.state.status === undefined) {
      return 'WAITING_TO_START';
    } else {
      return this._model.game?.state.status;
    }
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    const game = this._model.game;
    if (game === undefined) {
      return false;
    }
    return game.state.status === 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this TicTacToeAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   *
   * If the board has changed, emits a 'boardChanged' event with the new board. If the board has not changed,
   *  does not emit the event.
   *
   * If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   */
  protected _updateFrom(newModel: GameArea<TicTacToeGameState>): void {
    const oldGame = { ...this._model.game };
    super._updateFrom(newModel);
    this._instanceID = newModel.game?.id;
    if (this._model.game === undefined || oldGame === undefined) {
      return;
    }
    const newMoves = this._model.game.state.moves;
    const oldMoves = oldGame.state?.moves ?? [];
    if (newMoves.length !== oldMoves.length) {
      this.emit('boardChanged', this.board);
      const ourPlayer = this._townController.ourPlayer;
      const ourTurn =
        (newMoves[newMoves.length - 1].gamePiece === 'X' &&
          ourPlayer.id === this._model.game.state.o) ||
        (newMoves[newMoves.length - 1].gamePiece === 'O' &&
          ourPlayer.id === this._model.game.state.x);
      this.emit('turnChanged', ourTurn);
    }
  }

  /**
   * Sends a request to the server to make a move in the game.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'GameMove',
   * and send the gameID provided by `this._instanceID`.
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   * @param row Row of the move
   * @param col Column of the move
   */
  public async makeMove(row: TicTacToeGridPosition, col: TicTacToeGridPosition) {
    if (this._model.game === undefined || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }

    // have checked that game status is in progress, so whoseTurn is never undefined
    const gamePiece = this.whoseTurn?.id === this._model.game?.state.x ? 'X' : 'O';
    const move: TicTacToeMove = {
      gamePiece: gamePiece,
      row: row,
      col: col,
    };

    const command: GameMoveCommand<TicTacToeMove> = {
      type: 'GameMove',
      gameID: this._instanceID ?? '',
      move: move,
    };
    await this._townController.sendInteractableCommand(this.id, command);
    //this._updateFrom(this._model);
  }
}
