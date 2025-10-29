import "./style.css";

const stickerEmojis: string[] = ["🤡", "🔥", "🌟"];

const stickerButtonsHTML = stickerEmojis
  .map((emoji, index) =>
    `<button class="stickerButton" data-index="${index}">${emoji}</button>`
  ).join("");

document.body.innerHTML = `
  <h1>D2🎨</h1>
  <canvas id="canvas"></canvas>
  <button id="undo">undo</button>
  <button id="redo">redo</button>
  <button id="clear">clear</button>
  <br>
  <button id="thin">thin</button>
  <button id="thick">thick</button>
  <br><br>
  ${stickerButtonsHTML}
  <button id="customSticker">+Custom Sticker</button>
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

class ToolPreview {
  private position: Point;
  private size: number;

  constructor(position: Point, size: number) {
    this.position = position;
    this.size = size;
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(
      this.position.x,
      this.position.y,
      this.size / 2,
      0,
      Math.PI * 2,
    );
    context.lineWidth = 1;
    context.stroke();
  }
}

class Sticker {
  private position: Point;

  constructor(private emoji: string, position: Point) {
    this.position = position;
  }

  execute(context: CanvasRenderingContext2D) {
    context.font = "24px serif";
    context.fillText(this.emoji, this.position.x - 20, this.position.y);
  }

  drag(newPosition: Point) {
    this.position = newPosition;
  }

  getPosition() {
    return this.position;
  }

  getEmoji() {
    return this.emoji;
  }
}

class StickerPreview {
  constructor(private emoji: string, private position: Point) {}

  draw(context: CanvasRenderingContext2D) {
    context.font = "24px serif";
    context.fillText(this.emoji, this.position.x - 20, this.position.y);
  }
}

const lines: Line[] = [];
let currentLine: Line | null = null;
const redoCommands: Line[] = [];

const stickers: Sticker[] = [];
let currentSticker: Sticker | null = null;
let stickerPreview: StickerPreview | null = null;
let selectedEmoji: string | null = null;

const cursor = { active: false, x: 0, y: 0 };
let currentSize = 1;
let toolPreview: ToolPreview | null = null;

function selectTool(thickness: number, button: HTMLElement) {
  currentSize = thickness;
  selectedEmoji = null;
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

function renderStickerButtons() {
  const buttons = document.querySelectorAll(".stickerButton");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = parseInt((button as HTMLElement).dataset.index!);
      selectedEmoji = stickerEmojis[index];
      stickerPreview = null;
      canvas.dispatchEvent(new Event("tool-moved"));
    });
  });
}
renderStickerButtons();

document.getElementById("customSticker")!.addEventListener("click", () => {
  const text = prompt("Custom sticker text", "");
  if (text) {
    stickerEmojis.push(text.trim());
    const newButton = document.createElement("button");
    newButton.className = "stickerButton";
    newButton.dataset.index = (stickerEmojis.length - 1).toString();
    newButton.textContent = text.trim();
    document.getElementById("customSticker")!.before(newButton);
    newButton.addEventListener("click", () => {
      selectedEmoji = text.trim();
      stickerPreview = null;
      canvas.dispatchEvent(new Event("tool-moved"));
    });
  }
});

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  const startPoint = { x: e.offsetX, y: e.offsetY };

  if (selectedEmoji) {
    currentSticker = new Sticker(selectedEmoji, startPoint);
    stickers.push(currentSticker);
    redoCommands.length = 0;
    stickerPreview = null;
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else {
    currentLine = new Line(startPoint, currentSize);
    lines.push(currentLine);
    redoCommands.length = 0;
    toolPreview = null;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mousemove", (e) => {
  const position = { x: e.offsetX, y: e.offsetY };

  if (cursor.active && currentLine) {
    currentLine.grow(position.x, position.y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else if (cursor.active && currentSticker) {
    currentSticker.drag(position);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else if (selectedEmoji) {
    stickerPreview = new StickerPreview(selectedEmoji, position);
    canvas.dispatchEvent(new Event("tool-moved"));
  } else {
    toolPreview = new ToolPreview(position, currentSize);
    canvas.dispatchEvent(new Event("tool-moved"));
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
  currentSticker = null;
  toolPreview = null;
  stickerPreview = null;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < lines.length; i++) {
    lines[i].execute(context);
  }
  for (let i = 0; i < stickers.length; i++) {
    stickers[i].execute(context);
  }
});

canvas.addEventListener("tool-moved", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < lines.length; i++) {
    lines[i].execute(context);
  }
  for (let i = 0; i < stickers.length; i++) {
    stickers[i].execute(context);
  }
  if (stickerPreview) {
    stickerPreview.draw(context);
  } else if (toolPreview) {
    toolPreview.draw(context);
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
  stickers.length = 0;
  currentLine = null;
  currentSticker = null;
  redoCommands.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// reece was here
