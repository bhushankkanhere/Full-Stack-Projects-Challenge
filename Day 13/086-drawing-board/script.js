const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
let drawing = false;

context.lineCap = "round";
context.lineJoin = "round";
context.fillStyle = "#ffffff";
context.fillRect(0, 0, canvas.width, canvas.height);

function getPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const point = event.touches ? event.touches[0] : event;
  return {
    x: ((point.clientX - rect.left) / rect.width) * canvas.width,
    y: ((point.clientY - rect.top) / rect.height) * canvas.height
  };
}

function startDrawing(event) {
  drawing = true;
  const position = getPosition(event);
  context.beginPath();
  context.moveTo(position.x, position.y);
}

function draw(event) {
  if (!drawing) return;
  const position = getPosition(event);
  context.strokeStyle = colorPicker.value;
  context.lineWidth = Number(brushSize.value);
  context.lineTo(position.x, position.y);
  context.stroke();
}

function stopDrawing() {
  drawing = false;
  context.beginPath();
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  draw(event);
});
canvas.addEventListener("touchend", stopDrawing);

clearBtn.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "drawing-board.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
