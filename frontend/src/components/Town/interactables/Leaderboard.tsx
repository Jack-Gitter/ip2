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
  type GameEndStatus = 'WIN' | 'LOSS' | 'TIE';

  function getGameEndResult(scores: [string, number][]): GameEndStatus {
    if (scores[0][1] !== scores[1][1]) {
      if (scores[0][1]) {
        return 'WIN';
      } else {
        return 'LOSS';
      }
    }
    return 'TIE';
  }
  const playerResults: Map<string, [number, number, number]> = new Map();

  function calculatePlayerRecordTuple(
    playerUsername: string,
    gameResult: GameEndStatus,
    isPlayerTwo: boolean,
  ): [number, number, number] {
    const tup = playerResults.get(playerUsername) ?? [0, 0, 0];
    if (gameResult === 'WIN') {
      if (!isPlayerTwo) {
        tup[0] += 1;
      } else {
        tup[1] += 1;
      }
    } else if (gameResult === 'LOSS') {
      if (!isPlayerTwo) {
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
    const gameEndResult = getGameEndResult(scores);
    const player1Username = scores[0][0];
    const player2Username = scores[1][0];
    const tup1 = calculatePlayerRecordTuple(player1Username, gameEndResult, false);
    const tup2 = calculatePlayerRecordTuple(player2Username, gameEndResult, true);
    playerResults.set(player1Username, tup1);
    playerResults.set(player2Username, tup2);
  });
  let playerResultsArray = Array.from(playerResults);
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
