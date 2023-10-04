import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import TicTacToeAreaController from '../../../../classes/interactable/TicTacToeAreaController';

export type TicTacToeGameProps = {
  gameAreaController: TicTacToeAreaController;
};

/**
 * A component that will render a single cell in the TicTacToe board, styled
 */
const StyledTicTacToeSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    border: '1px solid black',
    height: '33%',
    fontSize: '50px',
    _disabled: {
      opacity: '100%',
    },
  },
});
/**
 * A component that will render the TicTacToe board, styled
 */
const StyledTicTacToeBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '400px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

/**
 * A component that renders the TicTacToe board
 *
 * Renders the TicTacToe board as a "StyledTicTacToeBoard", which consists of 9 "StyledTicTacToeSquare"s
 * (one for each cell in the board, starting from the top left and going left to right, top to bottom).
 * Each StyledTicTacToeSquare has an aria-label property that describes the cell's position in the board,
 * formatted as `Cell ${rowIndex},${colIndex}`.
 *
 * The board is re-rendered whenever the board changes, and each cell is re-rendered whenever the value
 * of that cell changes.
 *
 * If the current player is in the game, then each StyledTicTacToeSquare is clickable, and clicking
 * on it will make a move in that cell. If there is an error making the move, then a toast will be
 * displayed with the error message as the description of the toast. If it is not the current player's
 * turn, then the StyledTicTacToeSquare will be disabled.
 *
 * @param gameAreaController the controller for the TicTacToe game
 */
export default function TicTacToeBoard({ gameAreaController }: TicTacToeGameProps): JSX.Element {
  const [board, setBoard] = useState(gameAreaController.board);
  const [ourTurn, setOurTurn] = useState(gameAreaController.isOurTurn);
  const badMoveToast = useToast();

  /**
   * displays a toast with an error message if the player makes a move that is not succesfful
   * @param e the Error thrown by makeMove()
   */
  const showBadMoveToast = (e: Error) => {
    badMoveToast({
      status: 'error',
      description: `Error: ${e.message}`,
    });
  };

  useEffect(() => {
    /**
     * sets the state vairable board to the gameAreaController representation
     */
    const changeBoard = () => {
      setBoard(gameAreaController.board);
    };
    /**
     * Sets the turn state variable to the gameAreaController representation
     */
    const changeTurn = () => {
      setOurTurn(gameAreaController.isOurTurn);
    };

    gameAreaController.addListener('boardChanged', changeBoard);
    gameAreaController.addListener('gameUpdated', changeTurn);
    return () => {
      gameAreaController.removeListener('gameUpdated', changeTurn);
      gameAreaController.removeListener('boardChanged', changeBoard);
    };
  }, [gameAreaController]);

  return (
    <StyledTicTacToeBoard aria-label='Tic-Tac-Toe Board'>
      <StyledTicTacToeSquare
        disabled={!ourTurn}
        onClick={async () => {
          try {
            await gameAreaController.makeMove(0, 0);
          } catch (e) {
            if (e instanceof Error) {
              showBadMoveToast(e);
            }
          }
        }}
        aria-label='Cell 0,0'>
        {board[0][0]}
      </StyledTicTacToeSquare>
      <StyledTicTacToeSquare
        disabled={!ourTurn}
        onClick={async () => {
          try {
            await gameAreaController.makeMove(0, 1);
          } catch (e) {
            if (e instanceof Error) {
              showBadMoveToast(e);
            }
          }
        }}
        aria-label='Cell 0,1'>
        {board[0][1]}
      </StyledTicTacToeSquare>
      <StyledTicTacToeSquare
        disabled={!ourTurn}
        onClick={async () => {
          try {
            await gameAreaController.makeMove(0, 2);
          } catch (e) {
            if (e instanceof Error) {
              showBadMoveToast(e);
            }
          }
        }}
        aria-label='Cell 0,2'>
        {board[0][2]}
      </StyledTicTacToeSquare>
      <StyledTicTacToeSquare
        disabled={!ourTurn}
        onClick={async () => {
          try {
            await gameAreaController.makeMove(1, 0);
          } catch (e) {
            if (e instanceof Error) {
              showBadMoveToast(e);
            }
          }
        }}
        aria-label='Cell 1,0'>
        {board[1][0]}
      </StyledTicTacToeSquare>
      <StyledTicTacToeSquare
        disabled={!ourTurn}
        onClick={async () => {
          try {
            await gameAreaController.makeMove(1, 1);
          } catch (e) {
            if (e instanceof Error) {
              showBadMoveToast(e);
            }
          }
        }}
        aria-label='Cell 1,1'>
        {board[1][1]}
      </StyledTicTacToeSquare>
      <StyledTicTacToeSquare
        disabled={!ourTurn}
        onClick={async () => {
          try {
            await gameAreaController.makeMove(1, 2);
          } catch (e) {
            if (e instanceof Error) {
              showBadMoveToast(e);
            }
          }
        }}
        aria-label='Cell 1,2'>
        {board[1][2]}
      </StyledTicTacToeSquare>
      <StyledTicTacToeSquare
        disabled={!ourTurn}
        onClick={async () => {
          try {
            await gameAreaController.makeMove(2, 0);
          } catch (e) {
            if (e instanceof Error) {
              showBadMoveToast(e);
            }
          }
        }}
        aria-label='Cell 2,0'>
        {board[2][0]}
      </StyledTicTacToeSquare>
      <StyledTicTacToeSquare
        disabled={!ourTurn}
        onClick={async () => {
          try {
            await gameAreaController.makeMove(2, 1);
          } catch (e) {
            if (e instanceof Error) {
              showBadMoveToast(e);
            }
          }
        }}
        aria-label='Cell 2,1'>
        {board[2][1]}
      </StyledTicTacToeSquare>
      <StyledTicTacToeSquare
        disabled={!ourTurn}
        onClick={async () => {
          try {
            await gameAreaController.makeMove(2, 2);
          } catch (e) {
            if (e instanceof Error) {
              showBadMoveToast(e);
            }
          }
        }}
        aria-label='Cell 2,2'>
        {board[2][2]}
      </StyledTicTacToeSquare>
    </StyledTicTacToeBoard>
  );
}
