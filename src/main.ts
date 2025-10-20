import "./style.css";

document.body.innerHTML = `
  <h1>D2🎨</h1>
  <canvas id="canvas"></canvas>
  <button id="undo">undo</button>
  <button id="redo">redo</button>
  <button id="clear">clear</button>
  <br>
  <button id="thin">thin</button>
  <button id="thick">thick</button>
`;

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
canvas.height = 256;
canvas.width = 256;

const undo = document.getElementById("undo")! as HTMLButtonElement;
const redo = document.getElementById("redo")! as HTMLButtonElement;
const clear = document.getElementById("clear")! as HTMLButtonElement;

const thin = document.getElementById("thin")!;
const thick = document.getElementById("thick")!;

const context = canvas.getContext("2d")!;

type Point = { x: number; y: number };

class Line {
  private points: Point[] = [];
  private size: number;

  constructor(start: Point, size: number) {
    this.points.push(start);
    this.size = size;
  }

  execute(context: CanvasRenderingContext2D) {
    if (this.points.length < 2) {
      return;
    }
    context.lineWidth = this.size;
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.stroke();
  }

  grow(x: number, y: number) {
    this.points.push({ x, y });
  }
}

const lines: Line[] = [];
let currentLine: Line | null = null;
const redoCommands: Line[] = [];

const cursor = { active: false, x: 0, y: 0 };
let currentSize = 1;

function selectTool(thickness: number, button: HTMLElement) {
  currentSize = thickness;
  thin.classList.remove("selectedTool");
  thick.classList.remove("selectedTool");
  button.classList.add("selectedTool");

  if (thickness === 1) {
    console.log("thin");
  } else if (thickness === 5) {
    console.log("thick");
  }
}

thin.addEventListener("click", () => selectTool(1, thin));
thick.addEventListener("click", () => selectTool(5, thick));
selectTool(1, thin);

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  const startPoint = { x: e.offsetX, y: e.offsetY };
  currentLine = new Line(startPoint, currentSize);
  lines.push(currentLine);

  redoCommands.length = 0;

  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active && currentLine) {
    currentLine.grow(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
});

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    line.execute(context);
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
  currentLine = null;
  redoCommands.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
  console.log("clear");
});

// reece was here
