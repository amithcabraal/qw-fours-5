import { Grid, Position } from '../types/game';

// Check if a position would result in a win
export function checkPotentialWin(grid: Grid, pos: Position, player: 1 | 2): boolean {
  const [x, y, z] = pos;
  const tempGrid = JSON.parse(JSON.stringify(grid));
  tempGrid[x][z][y] = player;

  // All possible directions for win checking
  const directions = [
    // Straight lines
    [[1,0,0], [-1,0,0]], // x-axis
    [[0,1,0], [0,-1,0]], // y-axis
    [[0,0,1], [0,0,-1]], // z-axis

    // Face diagonals (in xy plane)
    [[1,1,0], [-1,-1,0]], // xy diagonal \
    [[1,-1,0], [-1,1,0]], // xy diagonal /

    // Face diagonals (in xz plane)
    [[1,0,1], [-1,0,-1]], // xz diagonal \
    [[1,0,-1], [-1,0,1]], // xz diagonal /

    // Face diagonals (in yz plane)
    [[0,1,1], [0,-1,-1]], // yz diagonal \
    [[0,1,-1], [0,-1,1]], // yz diagonal /

    // Body diagonals (through cube)
    [[1,1,1], [-1,-1,-1]], // main diagonal \
    [[1,1,-1], [-1,-1,1]], // opposite diagonal /
    [[1,-1,1], [-1,1,-1]], // opposite diagonal \
    [[1,-1,-1], [-1,1,1]], // opposite diagonal /
  ];

  for (const dirPair of directions) {
    let count = 1;

    for (const [dx, dy, dz] of dirPair) {
      let cx = x + dx;
      let cy = y + dy;
      let cz = z + dz;

      while (
        cx >= 0 && cx < 4 &&
        cy >= 0 && cy < 4 &&
        cz >= 0 && cz < 4 &&
        tempGrid[cx][cz][cy] === player
      ) {
        count++;
        cx += dx;
        cy += dy;
        cz += dz;
      }
    }

    if (count >= 4) return true;
  }

  return false;
}

// Evaluate a position's strategic value
function evaluatePosition(grid: Grid, pos: Position): number {
  const [x, y, z] = pos;
  let score = 0;

  // Prefer center positions
  const distanceFromCenter = Math.abs(x - 1.5) + Math.abs(z - 1.5);
  score -= distanceFromCenter;

  // Prefer lower positions (more stable)
  score -= y;

  // Bonus for positions that could lead to multiple wins
  const tempGrid = JSON.parse(JSON.stringify(grid));
  tempGrid[x][z][y] = 2;
  
  // Check surrounding positions for potential future moves
  const directions = [
    [1,0,0], [-1,0,0], [0,0,1], [0,0,-1],
    [1,1,0], [-1,-1,0], [1,-1,0], [-1,1,0],
    [1,0,1], [-1,0,-1], [1,0,-1], [-1,0,1]
  ];

  for (const [dx, dz] of directions) {
    const nx = x + dx;
    const nz = z + dz;
    if (nx >= 0 && nx < 4 && nz >= 0 && nz < 4) {
      let ny = 0;
      while (ny < 4 && tempGrid[nx][nz][ny] !== null) ny++;
      if (ny < 4) score += 1;
    }
  }

  return score;
}

export function findBestMove(grid: Grid): Position {
  const validMoves: Position[] = [];
  const moveScores: number[] = [];

  // Collect all valid moves
  for (let x = 0; x < 4; x++) {
    for (let z = 0; z < 4; z++) {
      let y = 0;
      while (y < 4 && grid[x][z][y] !== null) y++;
      if (y < 4) {
        const pos: Position = [x, y, z];
        validMoves.push(pos);

        // Check if this move would win
        if (checkPotentialWin(grid, pos, 2)) {
          return pos; // Winning move, take it immediately
        }

        // Check if opponent would win, need to block
        if (checkPotentialWin(grid, pos, 1)) {
          return pos; // Blocking move, take it immediately
        }

        // Otherwise, evaluate position
        moveScores.push(evaluatePosition(grid, pos));
      }
    }
  }

  // If no immediate winning or blocking moves, choose the best strategic position
  const maxScore = Math.max(...moveScores);
  const bestMoves = validMoves.filter((_, i) => moveScores[i] === maxScore);
  
  // Randomly select from the best moves to add unpredictability
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}