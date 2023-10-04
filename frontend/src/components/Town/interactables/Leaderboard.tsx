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
  // if both values are zero, add a tie -- we are evaluating these wins, losses, and ties on the fly in the html, not storing them in a data structure
  const playerResults: Map<string, [number, number, number]> = new Map();
  results.map(result => {
    const scores = Object.entries(result.scores);
    let p1Win = false;
    let p1Lose = false;
    const player1Username = scores[0][0];
    const player2Username = scores[1][0];
    if (scores[0][1] !== scores[1][1]) {
      if (scores[0][1]) {
        p1Win = true;
      } else {
        p1Lose = true;
      }
    }
    const tup1 = playerResults.get(player1Username) ?? [0, 0, 0];
    const tup2 = playerResults.get(player2Username) ?? [0, 0, 0];
    if (p1Win) {
      tup1[0] += 1;
      tup2[1] += 1;
    } else if (p1Lose) {
      tup1[1] += 1;
      tup2[0] += 1;
    } else {
      tup1[2] += 1;
      tup2[2] += 1;
    }
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
