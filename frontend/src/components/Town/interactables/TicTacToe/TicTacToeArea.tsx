import {
  Button,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import TicTacToeAreaController from '../../../../classes/interactable/TicTacToeAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import Leaderboard from '../Leaderboard';
import TicTacToeBoard from './TicTacToeBoard';

/**
 * The TicTacToeArea component renders the TicTacToe game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the TicTacToeAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A leaderboard (@see Leaderboard.tsx), which is passed the game history as a prop
 * - A list of observers' usernames (in a list with the aria-label 'list of observers in the game', one username per-listitem)
 * - A list of players' usernames (in a list with the aria-label 'list of players in the game', one item for X and one for O)
 *    - If there is no player in the game, the username is '(No player yet!)'
 *    - List the players as (exactly) `X: ${username}` and `O: ${username}`
 * - A message indicating the current game status:
 *    - If the game is in progress, the message is 'Game in progress, {moveCount} moves in, currently {whoseTurn}'s turn'. If it is currently our player's turn, the message is 'Game in progress, {moveCount} moves in, currently your turn'
 *    - Otherwise the message is 'Game {not yet started | over}.'
 * - If the game is in status WAITING_TO_START or OVER, a button to join the game is displayed, with the text 'Join New Game'
 *    - Clicking the button calls the joinGame method on the gameAreaController
 *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 * - The TicTacToeBoard component, which is passed the current gameAreaController as a prop (@see TicTacToeBoard.tsx)
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Tie: description 'Game ended in a tie'
 *    - Our player won: description 'You won!'
 *    - Our player lost: description 'You lost :('
 *
 */
function TicTacToeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<TicTacToeAreaController>(interactableID);

  //const [controller, setController] = useState(gameAreaController);
  // here would it be better to just have the model as the variable?
  const [v, setV] = useState({
    players: gameAreaController.players,
    observers: gameAreaController.observers,
    status: gameAreaController.status,
    moveCount: gameAreaController.moveCount,
    isOurTurn: gameAreaController.isOurTurn,
    whoseTurn: gameAreaController.whoseTurn,
    winner: gameAreaController.winner,
    history: gameAreaController.history,
  });
  /*const [players, setPlayers] = useState(gameAreaController.players);
  const [observers, setObservers] = useState(gameAreaController.observers);
  const [status, setStatus] = useState(gameAreaController.status);
  const [moveCount, setMoveCount] = useState(gameAreaController.moveCount);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const [whoseTurn, setWhoseTurn] = useState(gameAreaController.whoseTurn);
  const [winner, setWinner] = useState(gameAreaController.winner);*/

  //const [model, setModel] = useState(gameAreaController.toInteractableAreaModel());
  // do something like const [model, setModel] = useState(gameAreaController.tomode())
  // then in the updater just do setModel({...gameAreaController.tomodel()})?

  const endGameToast = useToast();
  useEffect(() => {
    /*const updater = () => {
      setObservers(gameAreaController.observers);
      setPlayers(gameAreaController.players);
      setStatus(gameAreaController.status);
      setMoveCount(gameAreaController.moveCount);
      setIsOurTurn(gameAreaController.isOurTurn);
      setWhoseTurn(gameAreaController.whoseTurn);
      setWinner(gameAreaController.winner);
    };*/
    const updater = () => {
      setV({
        players: gameAreaController.players,
        observers: gameAreaController.observers,
        status: gameAreaController.status,
        moveCount: gameAreaController.moveCount,
        isOurTurn: gameAreaController.isOurTurn,
        whoseTurn: gameAreaController.whoseTurn,
        winner: gameAreaController.winner,
        history: gameAreaController.history,
      });
    };
    //const updater = () => {
    // setController(gameAreaController);
    //};
    /* const updater = () => {
      setModel(gameAreaController.toInteractableAreaModel());
      setPlayers(gameAreaController.players);
    };*/

    // how to "rerender accordingly??? is this right?"
    gameAreaController.addListener('gameUpdated', updater);
    gameAreaController.addListener('gameEnd', updater);

    return () => {
      gameAreaController.removeListener('gameUpdated', updater);
      gameAreaController.removeListener('gameEnd', updater);
    };
  }, [gameAreaController]);

  // TODO - implement this component
  return (
    <>
      <Leaderboard results={v.history} />
      <Text>Observers:</Text>
      <List aria-label='list of observers in the game'>
        {v.observers.map(observer => (
          <ListItem key={observer.id}>{observer.userName}</ListItem>
        ))}
      </List>
      <Text>Players:</Text>
      <List aria-label='list of players in the game'>
        {v.players.map(player => (
          <ListItem key={player.id}>
            {player.userName
              ? player.id === gameAreaController.x?.id
                ? `X: ${player.userName}`
                : `O: ${player.userName}`
              : 'No player yet!'}
          </ListItem>
        ))}
      </List>
      <Text>
        Current Game Status:
        {v.status === 'IN_PROGRESS'
          ? ` Game in progress, ${v.moveCount} moves in, currently ${
              v.isOurTurn ? 'your turn' : `${v.whoseTurn?.userName}'s turn`
            }`
          : ` Game ${v.status === 'WAITING_TO_START' ? 'not started yet' : 'over'}`}
      </Text>
      {v.status !== 'IN_PROGRESS' ? (
        <Button onClick={async () => gameAreaController.joinGame()}>Join New Game</Button>
      ) : (
        <></>
      )}
      {v.status === 'OVER' ? (
        endGameToast({
          title: 'Game over',
          description: `${v.winner === undefined ? 'tie' : v.isOurTurn ? 'you lose' : 'you win'}`,
        })
      ) : (
        <></>
      )}
      <TicTacToeBoard gameAreaController={gameAreaController} />;
    </>
  );
}

// Do not edit below this line
/**
 * A wrapper component for the TicTacToeArea component.
 * Determines if the player is currently in a tic tac toe area on the map, and if so,
 * renders the TicTacToeArea component in a modal.
 *
 */
export default function TicTacToeAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'TicTacToe') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <TicTacToeArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
