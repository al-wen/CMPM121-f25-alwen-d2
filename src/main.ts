import "./style.css";

document.body.innerHTML = `
  <h1>D2🎨</h1>
  <canvas id="canvas"></canvas>
  <button id="clear">clear</button>
`;

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
canvas.height = 256;
canvas.width = 256;

const clear = document.getElementById("clear")! as HTMLButtonElement;

const context = canvas.getContext("2d")!;

const cursor = {
  active: false,
  x: 0,
  y: 0,
};

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    context.beginPath();
    context.moveTo(cursor.x, cursor.y);
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

clear.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

// reece was here
