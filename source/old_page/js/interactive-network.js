// File: js/interactive-network.js

// Canvas and rendering context
let canvas, ctx;
// Array to store all points on the canvas
const points = [];
// Array to store currently active (animating) lines/comets
let activeLines = [];
// Array to store currently active (animating) explosions
let activeExplosions = [];


// --- Network Settings ---
// YOU CAN TWEAK THESE VALUES TO CHANGE THE APPEARANCE AND BEHAVIOR
const networkSettings = {
    // Number of points to generate on the canvas
    // More points = denser network, potentially more comets
    numPoints: 800, // Try values like 50, 100, 150

    // Radius of the static points (if visible)
    pointRadius: 1.5, // e.g., 1, 2, 2.5

    // Color of the static points. Use rgba for transparency.
    // To hide points, set alpha to 0: 'rgba(133, 141, 148, 0)'
    pointColor: 'rgba(133, 141, 148, 0)', // Points are currently invisible

    // Maximum distance between two points for a comet to connect them
    // Larger value = longer comets, potentially connecting across larger gaps
    connectDistance: 500, // e.g., 150, 250, 300

    // Array of colors for the comets. A random color is chosen for each new comet.
    lineColors: [
        'rgba(255, 127, 80, 0.8)', // --accent-bright
        'rgba(66, 181, 239, 0.7)', // --accent-warm
        'rgba(219, 35, 239, 0.7)',
        'rgba(234, 234, 234, 0.6)'  // --text-color
    ],

    // Starting width of the comet's head
    lineWidthStart: 2.5, // e.g., 1.5, 2, 3

    // Length of the comet's tail, as a fraction of the currently drawn line segment's length.
    cometTailLength: 7.35, // e.g., 0.2 (shorter tail), 0.5 (longer tail)

    // Duration for the comet's head to travel to its destination point
    lineAnimationDuration: 2.8, // e.g., 2.0 (faster), 4.0 (slower)

    // --- Explosion Settings ---
    // Factor by which the pointRadius is multiplied to get the explosion's max radius
    // e.g., if pointRadius is 2 and factor is 10, max explosion radius is 20.
    explosionMaxRadiusFactor: 20, // TRY: 10, 15, 20 (to make it larger)

    // Duration of the explosion animation (in seconds)
    // Higher value = slower explosion
    explosionDuration: 0.9, // TRY: 0.8, 1.0, 1.2 (to make it slower)

    // Maximum number of comets animating simultaneously
    maxActiveLines: 20 // e.g., 8, 15, 20
};

// --- ExplosionEffect Class ---
class ExplosionEffect {
    constructor(x, y, color) {
        this.x = x; // X position of the explosion center
        this.y = y; // Y position of the explosion center
        this.color = color; // Color of the explosion (same as the comet)
        this.radius = networkSettings.pointRadius; // Initial radius (starts small)
        this.opacity = 0.8; // Initial opacity (fairly bright)

        // GSAP animation for the explosion's growth and fade
        gsap.to(this, {
            radius: networkSettings.pointRadius * networkSettings.explosionMaxRadiusFactor, // Animate to max radius
            opacity: 0, // Animate to fully transparent
            duration: networkSettings.explosionDuration, // Use duration from settings
            ease: "expo.out", // "expo.out" gives a fast expansion then slows down at the end
            onComplete: () => {
                // Remove this explosion object from the activeExplosions array when animation is done
                activeExplosions = activeExplosions.filter(exp => exp !== this);
            }
        });
    }

    draw(ctx) {
        // Don't draw if explosion is too small or fully faded
        if (this.opacity <= 0.01 || this.radius <= 0.1) return;

        ctx.beginPath();
        // Draw the arc for the main body of the explosion
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        // Extract RGB components from the RGBA color string to use in the gradient
        // This ensures the gradient uses the base color without being affected by the original alpha of the comet color string
        const rgbColorMatch = this.color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        const rgbColor = rgbColorMatch ? `${rgbColorMatch[1]},${rgbColorMatch[2]},${rgbColorMatch[3]}` : '255,127,80'; // Fallback color

        // Create a radial gradient for the explosion fill
        // It goes from a more opaque center to a transparent edge
        const gradient = ctx.createRadialGradient(
            this.x, this.y, this.radius * 0.1, // Inner circle (start of gradient)
            this.x, this.y, this.radius        // Outer circle (end of gradient)
        );
        // Gradient color stops, using the explosion's current animated opacity
        gradient.addColorStop(0, `rgba(${rgbColor}, ${this.opacity * 0.9})`); // Center is slightly more opaque
        gradient.addColorStop(0.6, `rgba(${rgbColor}, ${this.opacity * 0.5})`); // Mid-point
        gradient.addColorStop(1, `rgba(${rgbColor}, 0)`);                   // Edge is fully transparent

        ctx.fillStyle = gradient;
        ctx.fill();
    }
}


// --- AnimatedLine Class (Comet) ---
class AnimatedLine {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.headProgress = 0;
        this.tailStartProgress = 0;
        this.isVisible = true; // Comet is visible until it "explodes"
        this.color = networkSettings.lineColors[Math.floor(Math.random() * networkSettings.lineColors.length)];

        const tl = gsap.timeline({
            // No onComplete here for activeLines filtering, it's handled when the comet becomes invisible
        });

        // Animate the headProgress from 0 (start) to 1 (destination)
        tl.to(this, {
            headProgress: 1,
            onUpdate: () => {
                // Keep the tailStartProgress trailing the headProgress by cometTailLength
                this.tailStartProgress = Math.max(0, this.headProgress - networkSettings.cometTailLength);
            },
            duration: networkSettings.lineAnimationDuration,
            ease: "linear",
            onComplete: () => {
                // When the comet's head reaches its destination:
                this.isVisible = false; // Mark the comet line/tail as no longer visible

                // Create an explosion effect at the destination point (p2)
                const explosion = new ExplosionEffect(this.p2.x, this.p2.y, this.color);
                activeExplosions.push(explosion); // Add to the array of active explosions

                // Remove this comet from the activeLines array as its flight is over
                // The explosion will manage its own lifecycle.
                activeLines = activeLines.filter(line => line !== this);
            }
        });
    }

    draw() {
        // Only draw the comet if it's marked as visible
        if (!ctx || !this.isVisible) return;

        // Safety check: if head is at destination and tail has caught up,
        // but isVisible is still true (shouldn't happen with current logic), don't draw.
        if (this.headProgress >= 1 && this.tailStartProgress >= this.headProgress) return;

        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;

        // Calculate current head position
        const headX = this.p1.x + dx * this.headProgress;
        const headY = this.p1.y + dy * this.headProgress;

        // Calculate current tail start position
        const tailStartX = this.p1.x + dx * this.tailStartProgress;
        const tailStartY = this.p1.y + dy * this.tailStartProgress;

        // Avoid drawing if the visual segment length is negligible, especially at the very start
        if (Math.abs(headX - tailStartX) < 0.1 && Math.abs(headY - tailStartY) < 0.1 && this.headProgress < 0.05) {
            return;
        }

        // --- Draw the comet tail (line segment) ---
        ctx.beginPath();
        ctx.moveTo(tailStartX, tailStartY);
        ctx.lineTo(headX, headY);

        // Create a linear gradient for the tail's stroke style
        const gradient = ctx.createLinearGradient(tailStartX, tailStartY, headX, headY);
        const baseColorAlphaMatch = this.color.match(/, (\d\.\d+)\)/); // Extract alpha from the comet's base color
        const baseColorAlpha = baseColorAlphaMatch ? parseFloat(baseColorAlphaMatch[1]) : 0.7;

        // Tail gradient: from transparent at its start to more solid towards the head
        gradient.addColorStop(0, this.color.replace(/, \d\.\d+\)/, `, 0)`)); // Start of tail (fully transparent)
        gradient.addColorStop(0.5, this.color.replace(/, \d\.\d+\)/, `, ${baseColorAlpha * 0.3})`)); // Mid-tail
        gradient.addColorStop(1, this.color.replace(/, \d\.\d+\)/, `, ${baseColorAlpha})`));     // End of tail (at head)

        ctx.strokeStyle = gradient;
        ctx.lineWidth = networkSettings.lineWidthStart;
        ctx.lineCap = 'round'; // Rounded ends for the tail segment
        ctx.stroke();

        // --- Draw the comet head (small circle) ---
        const headRadius = networkSettings.lineWidthStart > 1 ? networkSettings.lineWidthStart / 1.5 : 1; // Slightly larger head
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
        // Head fill style uses the comet's color, possibly slightly more opaque
        ctx.fillStyle = this.color.replace(/, \d\.\d+\)/, `, ${Math.min(1, baseColorAlpha + 0.2)})`);
        ctx.fill();
    }
}
// END OF AnimatedLine CLASS DEFINITION


// --- Setup and Utility Functions ---
/**
 * Initializes the canvas, sets up global context (ctx), and event listeners.
 * @param {string} canvasId - The ID of the HTML canvas element.
 * @param {object} [settings={}] - Optional settings object to override defaults in networkSettings.
 * @returns {boolean} True if setup is successful, false otherwise.
 */
function setupInteractiveNetwork(canvasId, settings = {}) {
    canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with ID "${canvasId}" not found.`);
        return false;
    }
    ctx = canvas.getContext('2d');
    // Merge provided settings with defaults (shallow merge)
    Object.assign(networkSettings, settings);

    resizeCanvas(); // Set initial canvas dimensions
    // Add event listener to handle window resizing
    window.addEventListener('resize', () => {
        resizeCanvas();
        activeLines = [];      // Clear active comets
        activeExplosions = []; // Clear active explosions
        createPoints();        // Recreate points for new canvas size
    });

    createPoints(); // Create the initial set of points
    console.log(`Interactive Network: ${networkSettings.numPoints} points created.`);
    return true;
}

/**
 * Resizes the canvas to match its parent element's dimensions.
 * Ensures integer values for width/height to potentially reduce anti-aliasing.
 */
function resizeCanvas() {
    if (!canvas || !canvas.parentElement) return;
    canvas.width = Math.floor(canvas.parentElement.offsetWidth);
    canvas.height = Math.floor(canvas.parentElement.offsetHeight);
}

/**
 * (Re)populates the 'points' array with randomly positioned points.
 */
function createPoints() {
    points.length = 0; // Clear any existing points
    for (let i = 0; i < networkSettings.numPoints; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: networkSettings.pointRadius,
            id: i // Simple identifier
        });
    }
}

/**
 * Draws the static points on the canvas, if they are set to be visible.
 */
function drawStaticPoints() {
    if (!ctx) return;
    // Determine if points should be drawn based on pointColor's alpha value
    const pointColorAlphaMatch = networkSettings.pointColor.match(/, (\d\.\d+|\d)\)/);
    let pointColorAlpha = 0; // Default to invisible
    if (pointColorAlphaMatch) {
        pointColorAlpha = parseFloat(pointColorAlphaMatch[1]);
    } else if (networkSettings.pointColor && !networkSettings.pointColor.includes('rgba')) {
        // If it's a solid color string like 'red' or '#FF0000', assume visible unless explicitly transparent
        pointColorAlpha = 1;
    }

    if (pointColorAlpha === 0) return; // Don't draw if alpha is 0

    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fillStyle = networkSettings.pointColor;
        ctx.fill();
    });
}

/**
 * The main rendering loop function, called by GSAP's ticker.
 * Clears the canvas and redraws all static points, active comets, and active explosions.
 */
function updateNetwork() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    drawStaticPoints(); // Draw background points

    // Draw all currently active comets
    activeLines.forEach(line => {
        line.draw();
    });

    // Draw all currently active explosions
    activeExplosions.forEach(explosion => {
        explosion.draw(ctx);
    });
}

/**
 * Tries to spawn a new comet by randomly selecting two points.
 * A new comet is created if the points are different and within 'connectDistance'.
 */
function spawnRandomLine() {
    // Conditions to prevent spawning: canvas not ready, not enough points, or too many active comets
    if (!canvas || points.length < 2 || activeLines.length >= networkSettings.maxActiveLines) {
        return;
    }

    let p1Index = Math.floor(Math.random() * points.length);
    let p2Index = Math.floor(Math.random() * points.length);
    let attempts = 0;
    const maxAttempts = 50; // Safety break for loops

    // Ensure p1 and p2 are distinct points
    while (p1Index === p2Index && attempts < maxAttempts) {
        p2Index = Math.floor(Math.random() * points.length);
        attempts++;
    }
    if (p1Index === p2Index) return; // Could not find two distinct points

    attempts = 0; // Reset for next loop
    // Find a pair of points within the allowed connection distance
    while (getDistance(points[p1Index], points[p2Index]) > networkSettings.connectDistance && attempts < maxAttempts) {
        p1Index = Math.floor(Math.random() * points.length);
        p2Index = Math.floor(Math.random() * points.length);
        let innerAttempts = 0;
        // Ensure newly picked p1 and p2 are distinct again
        while (p1Index === p2Index && innerAttempts < maxAttempts) {
            p2Index = Math.floor(Math.random() * points.length);
            innerAttempts++;
        }
        if (p1Index === p2Index) { attempts = maxAttempts; break; } // Break outer loop if inner fails
        attempts++;
    }

    // If a suitable pair is found, create a new comet
    if (p1Index !== p2Index && getDistance(points[p1Index], points[p2Index]) <= networkSettings.connectDistance) {
        const newLine = new AnimatedLine(points[p1Index], points[p2Index]);
        activeLines.push(newLine);
    }
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {{x: number, y: number}} p1 - The first point.
 * @param {{x: number, y: number}} p2 - The second point.
 * @returns {number} The distance, or Infinity if points are invalid.
 */
function getDistance(p1, p2) {
    if (!p1 || !p2) return Infinity; // Basic validation
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Expose necessary functions to the global scope for gsap-init.js
window.setupInteractiveNetwork = setupInteractiveNetwork;
window.updateNetwork = updateNetwork;
window.spawnRandomLine = spawnRandomLine;