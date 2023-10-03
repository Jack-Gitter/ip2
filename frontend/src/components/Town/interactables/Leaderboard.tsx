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
  // for each player, I need to make a function to run through results, get the number of total games played, number of wins, and losses
  const players: Set<string> = new Set();
  useEffect(() => {
    results.map(result => {
      for (const [key] of Object.entries(result.scores)) {
        players.add(key);
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
