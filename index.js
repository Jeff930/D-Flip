// https://stackoverflow.com/a/76978444/383904
const flipBook = (elBook) => {
    elBook.style.setProperty("--c", 0); // Set current to first page
    elBook.querySelectorAll(".page").forEach((page, i) => {
        page.style.setProperty("--i", i);
        page.addEventListener("click", (evt) => {
            const c = !!evt.target.closest(".back") ? i : i + 1;
            elBook.style.setProperty("--c", c);
        });
    });
};

document.querySelectorAll(".book").forEach(flipBook);


const pencilButton = document.getElementById('pencilButton');
const eraserButton = document.getElementById('eraserButton');
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit the viewport
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white'; // Set canvas background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing state
let drawing = false;
let pencilEnabled = false;
let eraserEnabled = false;

// Pencil button toggle
pencilButton.addEventListener('click', () => {
    pencilEnabled = !pencilEnabled;
    eraserEnabled = false;
    canvas.style.pointerEvents = pencilEnabled ? 'auto' : 'none';
    pencilButton.textContent = pencilEnabled ? '🛑 Stop Drawing' : '✏️ Pencil';
    eraserButton.textContent = '🩹 Eraser'; // Reset eraser button text
});

// Eraser button toggle
eraserButton.addEventListener('click', () => {
    eraserEnabled = !eraserEnabled;
    pencilEnabled = false;
    canvas.style.pointerEvents = eraserEnabled ? 'auto' : 'none';
    eraserButton.textContent = eraserEnabled ? '🛑 Stop Erasing' : '🩹 Eraser';
    pencilButton.textContent = '✏️ Pencil'; // Reset pencil button text
});

// Drawing or erasing on canvas
canvas.addEventListener('mousedown', (e) => {
    if (!pencilEnabled && !eraserEnabled) return;
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        ctx.lineTo(e.clientX, e.clientY);
        ctx.strokeStyle = eraserEnabled ? 'white' : 'black'; // Erase or draw
        ctx.lineWidth = eraserEnabled ? 20 : 2; // Eraser is larger
        ctx.lineCap = 'round';
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    if (drawing) {
        drawing = false;
    }
});

canvas.addEventListener('mouseout', () => {
    if (drawing) {
        drawing = false;
    }
});
