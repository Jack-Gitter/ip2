import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react';
import React, { useEffect } from 'react';
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
  useEffect(() => {
    results.map(result => {
      const scores = Object.entries(result.scores);
      let p1Win = false;
      let p1Lose = false;
      let p1Tie = false;
      const player1Username = scores[0][0];
      const player2Username = scores[1][0];
      if (scores[0][1] === scores[1][1]) {
        p1Tie = true;
      } else if (scores[0][1]) {
        p1Win = true;
      } else {
        p1Lose = true;
      }
      if (!(player1Username in playerResults)) {
        playerResults.set(player1Username, [0, 0, 0]);
      }
      const tup = playerResults.get(player1Username);
      if (p1Win) {
        tup[0] += 1;
      } else if (p1Lose) {
        tup[1] += 1;
      } else {
        tup[2] += 1;
      }
    });
  });

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
          <Tbody></Tbody>
        </Table>
      </TableContainer>
    </>
  );
}
