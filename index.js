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
            // Identify the left and right page elements (front and back)
            const currentPage = bookElement.style.getPropertyValue("--c"); // Get the current page number
            const pageElement = bookElement.querySelector(`.page:nth-child(${currentPage})`);
            const pageElement2 = bookElement.querySelector(`.page:nth-child(${currentPage * 2 + 1})`);
            if (!pageElement) {
                alert("Error: Could not find the current page.");
                return;
            }

            if (!pageElement2) {
                alert("Error: Could not find the current page 2.");
                return;
            }

            // Get the front and back page elements
            const frontPage = pageElement2.querySelector(".front");
            const backPage = pageElement.querySelector(".back");

            if (!frontPage || !backPage) {
                alert("Error: Could not find the front or back pages.");
                return;
            }

            // Capture both the front and back pages using html2canvas
            const frontPageCanvas = await html2canvas(frontPage, {
                useCORS: true,
                scale: 2
            });
            const backPageCanvas = await html2canvas(backPage, {
                useCORS: true,
                scale: 2
            });

            // Create a final canvas to combine both pages side by side
            const finalCanvas = document.createElement("canvas");
            finalCanvas.width = frontPageCanvas.width + backPageCanvas.width;
            finalCanvas.height = Math.max(frontPageCanvas.height, backPageCanvas.height);
            const finalCtx = finalCanvas.getContext("2d");

            // Draw both pages side by side on the final canvas
            finalCtx.drawImage(backPageCanvas, 0, 0);
            finalCtx.drawImage(frontPageCanvas, backPageCanvas.width, 0);

            // Now capture the drawing canvas and overlay it on top of the book pages
            const updatedDrawingCanvas = document.createElement("canvas");
            updatedDrawingCanvas.width = drawingCanvas.width;
            updatedDrawingCanvas.height = drawingCanvas.height;
            const updatedCtx = updatedDrawingCanvas.getContext("2d");

            updatedCtx.drawImage(drawingCanvas, 0, 0);

            // Overlay the user's drawing on top of the combined book pages
            finalCtx.drawImage(updatedDrawingCanvas, 0, 0, finalCanvas.width, finalCanvas.height);

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
