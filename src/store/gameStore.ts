import { create } from 'zustand';
import { GameState, Grid, Player, Position, GameMode, Move } from '../types/game';
import { findBestMove } from '../utils/gameAI';

const GRID_SIZE = 4;

const createEmptyGrid = (): Grid => {
  return Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null)
    )
  );
};

const checkWinner = (grid: Grid, pos: Position): [Player | null, Position[]] => {
  const [x, y, z] = pos;
  const player = grid[x][y][z];
  if (!player) return [null, []];

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
    const positions: Position[] = [pos];
    let count = 1;

    for (const [dx, dy, dz] of dirPair) {
      let cx = x + dx;
      let cy = y + dy;
      let cz = z + dz;

      while (
        cx >= 0 && cx < GRID_SIZE &&
        cy >= 0 && cy < GRID_SIZE &&
        cz >= 0 && cz < GRID_SIZE &&
        grid[cx][cy][cz] === player
      ) {
        positions.push([cx, cy, cz]);
        count++;
        cx += dx;
        cy += dy;
        cz += dz;
      }
    }

    if (count >= 4) {
      return [player, positions];
    }
  }

  return [null, []];
};

export const useGameStore = create<GameState>((set, get) => ({
  grid: createEmptyGrid(),
  currentPlayer: 1,
  winner: null,
  winningPositions: [],
  gameMode: 'pvc',
  moveHistory: [],

  loadGame: (savedState: Partial<GameState>) => {
    set({
      ...savedState,
      winningPositions: [], // Reset winning positions as they're not saved
    });
  },

  placeToken: (x: number, z: number) => {
    if (get().winner) return;

    const grid = JSON.parse(JSON.stringify(get().grid));
    let y = 0;

    while (y < GRID_SIZE && grid[x][z][y] !== null) {
      y++;
    }

    if (y >= GRID_SIZE) return;

    grid[x][z][y] = get().currentPlayer;
    const [winner, winningPositions] = checkWinner(grid, [x, z, y]);
    const moveHistory = [...get().moveHistory, { x, y, z, player: get().currentPlayer }];

    set({
      grid,
      currentPlayer: get().currentPlayer === 1 ? 2 : 1,
      winner,
      winningPositions,
      moveHistory,
    });

    // Computer's turn
    if (!winner && get().gameMode === 'pvc' && get().currentPlayer === 2) {
      setTimeout(() => {
        const [cx, cy, cz] = findBestMove(grid);
        get().placeToken(cx, cz);
      }, 500);
    }
  },

  undoMove: () => {
    const { moveHistory, gameMode, winner } = get();
    if (moveHistory.length === 0) return;

    const newGrid = createEmptyGrid();
    const newHistory = [...moveHistory];
    
    // Remove last move (and computer's move in PvC mode if it exists)
    const lastMove = newHistory[newHistory.length - 1];
    const movesToRemove = gameMode === 'pvc' && lastMove.player === 1 ? 2 : 1;
    newHistory.splice(-movesToRemove);

    // Rebuild grid from remaining moves
    newHistory.forEach(({ x, y, z, player }) => {
      newGrid[x][z][y] = player;
    });

    // Set current player to the one whose move was undone
    const nextPlayer = lastMove.player;

    set({
      grid: newGrid,
      moveHistory: newHistory,
      currentPlayer: nextPlayer,
      winner: null,
      winningPositions: [],
    });
  },

  setGameMode: (mode: GameMode) => {
    set({ gameMode: mode });
    get().resetGame();
  },

  resetGame: () => {
    set({
      grid: createEmptyGrid(),
      currentPlayer: 1,
      winner: null,
      winningPositions: [],
      moveHistory: [],
    });
  },
}));