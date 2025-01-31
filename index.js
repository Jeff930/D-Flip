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

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("saveButton");

    if (!saveButton) {
        console.error("Save button not found.");
        return;
    }

    saveButton.addEventListener("click", async () => {
        const bookElement = document.querySelector(".book");
        const drawingCanvas = document.getElementById("drawingCanvas");

        if (!bookElement) {
            alert("Error: .book element not found.");
            return;
        }

        try {
            // Capture the book's current appearance
            const bookCanvas = await html2canvas(bookElement, {
                useCORS: true,  // Helps capture images from external sources
                scale: 2        // Increases resolution for better quality
            });

            // Create a final canvas with the same size as bookCanvas
            const finalCanvas = document.createElement("canvas");
            finalCanvas.width = bookCanvas.width;
            finalCanvas.height = bookCanvas.height;
            const finalCtx = finalCanvas.getContext("2d");

            // Draw the book screenshot
            finalCtx.drawImage(bookCanvas, 0, 0);

            // Draw the user’s drawing on top (adjusting size to match bookCanvas)
            finalCtx.drawImage(drawingCanvas, 0, 0, bookCanvas.width, bookCanvas.height);

            // Download the final image
            const link = document.createElement("a");
            link.href = finalCanvas.toDataURL("image/png");
            link.download = "book_page_with_drawing.png";
            link.click();
        } catch (error) {
            console.error("Error capturing the book:", error);
            alert("Failed to capture the book.");
        }
    });
});
