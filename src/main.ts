import "./style.css";

document.body.innerHTML = `
  <h1>D2🎨</h1>
  <canvas id="canvas"></canvas>
`;

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
canvas.height = 256;
canvas.width = 256;

document.appendChild(canvas);
