import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  GameArea,
  GameMoveCommand,
  GameResult,
  GameStatus,
  InteractableCommand,
  TicTacToeGameState,
  TicTacToeGridPosition,
  TicTacToeMove,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import GameAreaController from './GameAreaController';
import TicTacToeAreaController from './TicTacToeAreaController';
import { InteractableID } from '../../generated/client';

describe('[T1] TicTacToeAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  function ticTacToeAreaControllerWithProp({
    _id,
    history,
    x,
    o,
    undefinedGame,
    status,
    moves,
    winner,
  }: {
    _id?: string;
    history?: GameResult[];
    x?: string;
    o?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    moves?: TicTacToeMove[];
    winner?: string;
  }) {
    const id = _id || nanoid();
    const players = [];
    if (x) players.push(x);
    if (o) players.push(o);
    const ret = new TicTacToeAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'TicTacToeArea',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                x: x,
                o: o,
                moves: moves || [],
                winner: winner,
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
      mockTownController.getPlayer.mockImplementation(playerID => {
        const p = mockTownController.players.find(player => player.id === playerID);
        assert(p);
        return p;
      });
      mockTownController.sendInteractableCommand.mockImplementationOnce(
        (s: InteractableID, c: InteractableCommand) => {
          return new Promise(resolve => resolve({ gameID: id, something: s, else: c }));
        },
      );
    }
    return ret;
  }
  describe('[T1.1]', () => {
    describe('isActive', () => {
      it('should return true if the game is in progress', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('should return false if the game is not in progress', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'OVER',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
    describe('isPlayer', () => {
      it('should return true if the current player is a player in this game', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: ourPlayer.id,
        });
        expect(controller.isPlayer).toBe(true);
      });
      it('should return false if the current player is not a player in this game', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: otherPlayers[0].id,
          o: otherPlayers[1].id,
        });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('gamePiece', () => {
      it('should return the game piece of the current player if the current player is a player in this game', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: ourPlayer.id,
        });
        expect(controller.gamePiece).toBe('X');

        //check O
        const controller2 = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          o: ourPlayer.id,
        });
        expect(controller2.gamePiece).toBe('O');
      });
      it('should throw an error if the current player is not a player in this game', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: otherPlayers[0].id,
          o: otherPlayers[1].id,
        });
        expect(() => controller.gamePiece).toThrowError();
      });
    });
    describe('status', () => {
      it('should return the status of the game', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.status).toBe('IN_PROGRESS');
      });
      it('should return WAITING_TO_START if the game is not defined', () => {
        const controller = ticTacToeAreaControllerWithProp({
          undefinedGame: true,
        });
        expect(controller.status).toBe('WAITING_TO_START');
      });
    });
    describe('whoseTurn', () => {
      it('should return the player whose turn it is initially', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: ourPlayer.id,
          o: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(ourPlayer);
      });
      it('should return the player whose turn it is after a move', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: ourPlayer.id,
          o: otherPlayers[0].id,
          moves: [
            {
              gamePiece: 'X',
              row: 0,
              col: 0,
            },
          ],
        });
        expect(controller.whoseTurn).toBe(otherPlayers[0]);
      });
      it('should return undefined if the game is not in progress', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'OVER',
          x: ourPlayer.id,
          o: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(undefined);
      });
    });
    describe('isOurTurn', () => {
      it('should return true if it is our turn', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: ourPlayer.id,
          o: otherPlayers[0].id,
        });
        expect(controller.isOurTurn).toBe(true);
      });
      it('should return false if it is not our turn', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: otherPlayers[0].id,
          o: ourPlayer.id,
        });
        expect(controller.isOurTurn).toBe(false);
      });
    });
    describe('moveCount', () => {
      it('should return the number of moves that have been made', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: ourPlayer.id,
          o: otherPlayers[0].id,
          moves: [
            {
              gamePiece: 'X',
              row: 0,
              col: 0,
            },
          ],
        });
        expect(controller.moveCount).toBe(1);
      });
    });
    describe('board', () => {
      it('should return an empty board by default', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: ourPlayer.id,
          o: otherPlayers[0].id,
        });
        expect(controller.board).toEqual([
          [undefined, undefined, undefined],
          [undefined, undefined, undefined],
          [undefined, undefined, undefined],
        ]);
      });
    });
    describe('x', () => {
      it('should return the x player if there is one', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: ourPlayer.id,
          o: otherPlayers[0].id,
        });
        expect(controller.x).toBe(ourPlayer);
      });
      it('should return undefined if there is no x player and the game is waiting to start', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.x).toBe(undefined);
      });
      it('should return undefined if there is no x player', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          o: otherPlayers[0].id,
        });
        expect(controller.x).toBe(undefined);
      });
    });
    describe('o', () => {
      it('should return the o player if there is one', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: otherPlayers[0].id,
          o: ourPlayer.id,
        });
        expect(controller.o).toBe(ourPlayer);
      });
      it('should return undefined if there is no o player and the game is waiting to start', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.o).toBe(undefined);
      });
      it('should return undefined if there is no o player', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: otherPlayers[0].id,
        });
        expect(controller.o).toBe(undefined);
      });
    });
    describe('winner', () => {
      it('should return the winner if there is one', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'OVER',
          x: otherPlayers[0].id,
          o: ourPlayer.id,
          winner: ourPlayer.id,
        });
        expect(controller.winner).toBe(ourPlayer);
      });
      it('should return undefined if there is no winner', () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'OVER',
          x: otherPlayers[0].id,
          o: ourPlayer.id,
        });
        expect(controller.winner).toBe(undefined);
      });
    });
    describe('makeMove', () => {
      it('should throw an error if there is no game (no instanceID)', async () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'OVER',
          x: otherPlayers[0].id,
          o: ourPlayer.id,
        });
        const sendInteractableCommandMock = mockTownController.sendInteractableCommand;
        expect(async () => controller.makeMove(0, 0)).rejects.toThrowError();
        expect(sendInteractableCommandMock.mock.calls).toHaveLength(0);
      });
      it('should throw an error if there is no game (no instanceID)', async () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'WAITING_TO_START',
          x: otherPlayers[0].id,
          o: ourPlayer.id,
        });
        const sendInteractableCommandMock = mockTownController.sendInteractableCommand;
        expect(async () => controller.makeMove(0, 0)).rejects.toThrowError();
        expect(sendInteractableCommandMock.mock.calls).toHaveLength(0);
      });
      it('should throw an error if the game is not in progress (OVER STATUS)', async () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'OVER',
          x: otherPlayers[0].id,
          o: ourPlayer.id,
        });
        const sendInteractableCommandMock = mockTownController.sendInteractableCommand;
        await controller.joinGame();
        sendInteractableCommandMock.mockClear();
        expect(async () => controller.makeMove(0, 0)).rejects.toThrowError();
        expect(sendInteractableCommandMock.mock.calls).toHaveLength(0);
      });
      it('should throw an error if the game is not in progress (WAITING_TO_START STATUS)', async () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'WAITING_TO_START',
          x: otherPlayers[0].id,
          o: ourPlayer.id,
        });
        const sendInteractableCommandMock = mockTownController.sendInteractableCommand;
        await controller.joinGame();
        sendInteractableCommandMock.mockClear();
        expect(async () => controller.makeMove(0, 0)).rejects.toThrowError();
        expect(sendInteractableCommandMock.mock.calls).toHaveLength(0);
      });
      /*it('Should call townController.sendInteractableCommand', async () => {
        const controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: otherPlayers[0].id,
          o: ourPlayer.id,
        });
        const move1: TicTacToeMove = {
          gamePiece: 'X',
          row: 0,
          col: 0,
        };
        const command1: GameMoveCommand<TicTacToeMove> = {
          type: 'GameMove',
          gameID: controller.id,
          move: move1,
        };
        const move2: TicTacToeMove = {
          gamePiece: 'O',
          row: 1,
          col: 1,
        };
        const command2: GameMoveCommand<TicTacToeMove> = {
          type: 'GameMove',
          gameID: controller.id,
          move: move2,
        };
        const sendInteractableCommandMock = mockTownController.sendInteractableCommand;
        await controller.joinGame();
        sendInteractableCommandMock.mockClear();
        await controller.makeMove(0, 0);
        await controller.makeMove(1, 1);
        expect(sendInteractableCommandMock.mock.calls).toHaveLength(2);
        expect(sendInteractableCommandMock).toHaveBeenCalledWith(controller.id, command1);
        expect(sendInteractableCommandMock).toHaveBeenCalledWith(controller.id, command2);
      });*/
    });
  });
  describe('[T1.2] _updateFrom', () => {
    describe('if the game is in progress', () => {
      let controller: TicTacToeAreaController;
      beforeEach(() => {
        controller = ticTacToeAreaControllerWithProp({
          status: 'IN_PROGRESS',
          x: ourPlayer.id,
          o: otherPlayers[0].id,
        });
      });
      it('should emit a boardChanged event with the new board', () => {
        const model = controller.toInteractableAreaModel();
        const emitSpy = jest.spyOn(controller, 'emit');
        const newMoves: ReadonlyArray<TicTacToeMove> = [
          {
            gamePiece: 'X',
            row: 0 as TicTacToeGridPosition,
            col: 0 as TicTacToeGridPosition,
          },
        ];
        assert(model.game);
        const newModel: GameArea<TicTacToeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        expect(emitSpy).toHaveBeenCalledWith('boardChanged', [
          ['X', undefined, undefined],
          [undefined, undefined, undefined],
          [undefined, undefined, undefined],
        ]);
      });
      it('should not emit a boardChanged event if the board has not changed', () => {
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(controller.toInteractableAreaModel(), controller.occupants);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith('gameUpdated');
      });
      it('should emit a turnChanged event with true if it is our turn', () => {
        // our player is x, so make a move with x, then o, then check to see the emit
        const model = controller.toInteractableAreaModel();
        const emitSpy = jest.spyOn(controller, 'emit');
        const newMoves: ReadonlyArray<TicTacToeMove> = [
          {
            gamePiece: 'X',
            row: 0 as TicTacToeGridPosition,
            col: 0 as TicTacToeGridPosition,
          },
        ];
        assert(model.game);
        const newModel: GameArea<TicTacToeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, controller.occupants);
        const model2 = controller.toInteractableAreaModel();
        const newMoves2: ReadonlyArray<TicTacToeMove> = [
          {
            gamePiece: 'O',
            row: 1 as TicTacToeGridPosition,
            col: 1 as TicTacToeGridPosition,
          },
        ];
        assert(model2.game);
        const newModel2: GameArea<TicTacToeGameState> = {
          ...model2,
          game: {
            ...model2.game,
            state: {
              ...model2.game?.state,
              moves: model2.game.state.moves.concat(newMoves2),
            },
          },
        };
        controller.updateFrom(newModel2, controller.occupants);
        expect(emitSpy).toHaveBeenCalledWith('turnChanged', true);
      });
      it('should emit a turnChanged event with false if it is not our turn', () => {
        const model = controller.toInteractableAreaModel();
        const emitSpy = jest.spyOn(controller, 'emit');
        const newMoves: ReadonlyArray<TicTacToeMove> = [
          {
            gamePiece: 'X',
            row: 1 as TicTacToeGridPosition,
            col: 1 as TicTacToeGridPosition,
          },
        ];
        assert(model.game);
        const newModel: GameArea<TicTacToeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, controller.occupants);
        expect(emitSpy).toHaveBeenCalledWith('turnChanged', false);
      });
      it('should not emit a turnChanged event if the turn has not changed', () => {
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(controller.toInteractableAreaModel(), controller.occupants);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith('gameUpdated');
      });
      it('should update the board returned by the board property', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<TicTacToeMove> = [
          {
            gamePiece: 'X',
            row: 0 as TicTacToeGridPosition,
            col: 0 as TicTacToeGridPosition,
          },
          {
            gamePiece: 'O',
            row: 1 as TicTacToeGridPosition,
            col: 1 as TicTacToeGridPosition,
          },
        ];
        assert(model.game);
        const newModel: GameArea<TicTacToeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        expect(controller.board).toEqual([
          ['X', undefined, undefined],
          [undefined, 'O', undefined],
          [undefined, undefined, undefined],
        ]);
      });
    });
    it('should call super._updateFrom', () => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore - we are testing spying on a private method
      const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
      const controller = ticTacToeAreaControllerWithProp({});
      const model = controller.toInteractableAreaModel();
      controller.updateFrom(model, otherPlayers.concat(ourPlayer));
      expect(spy).toHaveBeenCalled();
    });
  });
});
