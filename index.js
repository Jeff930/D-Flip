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
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit the viewport
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing state
let drawing = false;
let pencilEnabled = false;

pencilButton.addEventListener('click', () => {
    pencilEnabled = !pencilEnabled;
    canvas.style.pointerEvents = pencilEnabled ? 'auto' : 'none';
    pencilButton.textContent = pencilEnabled ? '🛑 Stop Drawing' : '✏️ Pencil';
});

canvas.addEventListener('mousedown', (e) => {
    if (!pencilEnabled) return;
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing && pencilEnabled) {
        ctx.lineTo(e.clientX, e.clientY);
        ctx.strokeStyle = 'black'; // Change line color here
        ctx.lineWidth = 2; // Change line width here
        ctx.lineCap = 'round';
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    if (drawing && pencilEnabled) {
        drawing = false;
    }
});

canvas.addEventListener('mouseout', () => {
    if (drawing && pencilEnabled) {
        drawing = false;
    }
});
