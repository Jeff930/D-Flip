// Flipbook functionality
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
const homeButton = document.getElementById('homeButton');
const colorContainer = document.querySelector('.colorContainer');
const colorPicker = document.getElementById('colorPicker'); 

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
let eraserEnabled = false;
let selectedColor = '#000000'; // Default color

// Redirect to select page
homeButton.addEventListener('click', () => {
    window.location.href = 'select.html';
});

// Pencil button toggle
pencilButton.addEventListener('click', () => {
    pencilEnabled = !pencilEnabled;
    eraserEnabled = false;
    canvas.style.pointerEvents = pencilEnabled ? 'auto' : 'none';
    pencilButton.textContent = pencilEnabled ? '🛑 Stop Drawing' : '✏️ Draw';
    eraserButton.textContent = '🩹 Erase'; 
    colorContainer.style.display = pencilEnabled ? 'flex' : 'none';
});

// Eraser button toggle
eraserButton.addEventListener('click', () => {
    eraserEnabled = !eraserEnabled;
    pencilEnabled = false;
    canvas.style.pointerEvents = eraserEnabled ? 'auto' : 'none';
    eraserButton.textContent = eraserEnabled ? '🛑 Stop Erasing' : '🩹 Erase';
    pencilButton.textContent = '✏️ Draw'; 

    colorContainer.style.display = 'none';
});

document.getElementById('clearButton').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all drawings?")) {
        const canvas = document.getElementById('drawingCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

// Handle color selection from color picker
colorPicker.addEventListener('input', (event) => {
    selectedColor = event.target.value;
    eraserEnabled = false;
    pencilEnabled = true;
    pencilButton.textContent = '🛑 Stop Drawing';
    eraserButton.textContent = '🩹 Erase';
});

// Get correct canvas-relative coordinates
function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Drawing or erasing on canvas
canvas.addEventListener('mousedown', (e) => {
    if (!pencilEnabled && !eraserEnabled) return;
    drawing = true;
    ctx.beginPath();
    const pos = getMousePos(e);
    ctx.moveTo(pos.x, pos.y);

    ctx.globalCompositeOperation = eraserEnabled ? 'destination-out' : 'source-over';
    ctx.lineWidth = eraserEnabled ? 20 : 2;
    ctx.strokeStyle = eraserEnabled ? 'rgba(0,0,0,1)' : selectedColor;
    ctx.lineCap = 'round';
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        const pos = getMousePos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
});

canvas.addEventListener('mouseout', () => {
    drawing = false;
});

document.getElementById('saveButton').addEventListener('click', () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const currentPage = document.querySelector('.page:not([style*="display: none"]) img');

    if (currentPage) {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Prevent CORS issues
        img.src = currentPage.src;

        img.onload = () => {
            // Clear the canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the book page first
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Now, merge the drawings on top
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'book_page_with_drawing.png';
            link.click();
        };

        img.onerror = () => {
            alert("Error loading image. Ensure it's hosted with proper CORS headers.");
        };
    }
});

