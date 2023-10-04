import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { GameResult } from '../../../types/CoveyTownSocket';

/**
 * A component that renders a list of GameResult's as a leaderboard, formatted as a table with the following columns:
 * - Player: the name of the player
 * - Wins: the number of games the player has won
 * - Losses: the number of games the player has lost
 * - Ties: the number of games the player has tied
 * Each column has a header (a table header `th` element) with the name of the column.
 *
 *
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 *
 * @returns
 */
export default function Leaderboard({ results }: { results: GameResult[] }): JSX.Element {
  /**
   * type to represent if player1 has won, lost, or tied the game
   */
  type GameEndStatus = 'WIN' | 'LOSS' | 'TIE';

  // Map from playername to tuple, in the form of [wins, losses, ties]
  const playerResults: Map<string, [number, number, number]> = new Map();

  // An array representation of the above, for sorting purposes
  let playerResultsArray: [string, [number, number, number]][];

  /**
   * Converts the win or loss of a player from a 1 and a 0 to a GameEndStatus type
   * @param scores the object which represents if a player has won or lost the game
   * @returns a GameEndStatus indicating if player1 has won
   */
  function getGameEndStatusForPlayerOne(scores: [string, number][]): GameEndStatus {
    if (scores[0][1] !== scores[1][1]) {
      if (scores[0][1]) {
        return 'WIN';
      } else {
        return 'LOSS';
      }
    }
    return 'TIE';
  }

  /**
   * Calculates the wins, losses, and ties for any player in the results array
   * @param playerUsername  the player's username
   * @param gameEndStatusForPlayerOne 'WIN' if player1 has won, 'LOSS' if they lost, 'TIE' if the game was a tie
   * @param isPlayerOne if we are player1, true else false
   * @returns the tuple of the players record, in the form of [wins, losses, ties]
   */
  function calculatePlayerRecordTuple(
    playerUsername: string,
    gameEndStatusForPlayerOne: GameEndStatus,
    isPlayerOne: boolean,
  ): [number, number, number] {
    const tup = playerResults.get(playerUsername) ?? [0, 0, 0];
    if (gameEndStatusForPlayerOne === 'WIN') {
      if (isPlayerOne) {
        tup[0] += 1;
      } else {
        tup[1] += 1;
      }
    } else if (gameEndStatusForPlayerOne === 'LOSS') {
      if (isPlayerOne) {
        tup[1] += 1;
      } else {
        tup[0] += 1;
      }
    } else {
      tup[2] += 1;
    }
    return tup;
  }

  results.map(result => {
    const scores = Object.entries(result.scores);
    const gameEndStatusForPlayerOne = getGameEndStatusForPlayerOne(scores);
    const player1Username = scores[0][0];
    const player2Username = scores[1][0];
    const tup1 = calculatePlayerRecordTuple(player1Username, gameEndStatusForPlayerOne, true);
    const tup2 = calculatePlayerRecordTuple(player2Username, gameEndStatusForPlayerOne, false);
    playerResults.set(player1Username, tup1);
    playerResults.set(player2Username, tup2);
  });

  playerResultsArray = Array.from(playerResults);
  playerResultsArray = playerResultsArray.sort((r1, r2) => r2[1][0] - r1[1][0]);

  return (
    <>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Player</Th>
              <Th>Wins</Th>
              <Th>Losses</Th>
              <Th>Ties</Th>
            </Tr>
          </Thead>
          <Tbody>
            {playerResultsArray.map((result, key) => (
              <Tr key={key}>
                <Td>{result[0]}</Td>
                <Td>{result[1][0]}</Td>
                <Td>{result[1][1]}</Td>
                <Td>{result[1][2]}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}
