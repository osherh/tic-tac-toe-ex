const socket = io('http://localhost:3000');

function updateLastMove(move)
{
  const player = move.player;
  const { row, col } = move.cell;
  const cell = document.querySelector(`#cell-${row}-${col}`);
  
  if (cell && !cell.textContent)
  {
    cell.textContent = player;
    cell.disabled = true;
  }
}

function sendMoveToServer(row, col)
{
  socket.emit('move', { row: row, col: col });
}

socket.on('last-move', (move) => {
  updateLastMove(move);
});