import "./style.css";

document.body.innerHTML = `
  <h1>D2🎨</h1>
  <canvas id="canvas"></canvas>
  <button id="undo">undo</button>
  <button id="redo">redo</button>
  <button id="clear">clear</button>
`;

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
canvas.height = 256;
canvas.width = 256;

const undo = document.getElementById("undo")! as HTMLButtonElement;
const redo = document.getElementById("redo")! as HTMLButtonElement;
const clear = document.getElementById("clear")! as HTMLButtonElement;

const context = canvas.getContext("2d")!;

type Point = { x: number; y: number };
const lines: Point[][] = [];
let currentLine: Point[] = [];

const redoCommands: Point[][] = [];

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  currentLine = [{ x: e.offsetX, y: e.offsetY }];
  lines.push(currentLine);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    const point = { x: e.offsetX, y: e.offsetY };
    currentLine.push(point);
    //console.log("drawing:", point);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length >= 2) {
      context.beginPath();
      context.moveTo(line[0].x, line[0].y);
      for (let i = 1; i < line.length; i++) {
        context.lineTo(line[i].x, line[i].y);
      }
      context.stroke();
    }
  }
});

undo.addEventListener("click", () => {
  if (lines.length > 0) {
    const lastLine = lines.pop();
    if (lastLine) {
      redoCommands.push(lastLine);
      canvas.dispatchEvent(new Event("drawing-changed"));
      console.log("undo");
    }
  }
});

redo.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    const restoredLine = redoCommands.pop();
    if (restoredLine) {
      lines.push(restoredLine);
      canvas.dispatchEvent(new Event("drawing-changed"));
      console.log("redo");
    }
  }
});

clear.addEventListener("click", () => {
  lines.length = 0;
  currentLine = [];
  redoCommands.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
  console.log("clear");
});

// reece was here
