document.addEventListener('DOMContentLoaded', () => {

    // Register GSAP plugins
    gsap.registerPlugin(ScrollToPlugin, TextPlugin); // Added TextPlugin

    console.log("GeneScape Website Initializing...");

    // --- Selectors ---
    const entranceScreen = document.getElementById('entrance-screen');
    const mainContent = document.getElementById('main-content');
    const titleContainer = document.getElementById('title-container'); // Use the container now
    const companyNameElement = document.getElementById('company-name');
    const genomeCanvas = document.getElementById('genome-canvas');
    const ctx = genomeCanvas ? genomeCanvas.getContext('2d') : null; // Handle canvas potentially not existing
    const entranceVideo = document.getElementById('entranceVideo');

    // --- Configuration ---
    const companyNameText = "GeneScape Technologies";
    const particleCount = 80; // Reduced slightly
    const genomeCharCount = 100;

    let entranceTimeline;
    let canvasAnimationId;

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }

    const entranceColors = ['#e88c0c', '#fef200', '#1fae9f', '#d44a6a', '#ffffff'];
    const mainColors = ['#f0f0f0', '#a0d4e4', '#b8e8d0', '#ffffff'];
    const genomeChars = "ACGTU01";

    // Utility to split text into spans for letter animations
    function splitTextIntoSpans(selector) {
        const element = document.querySelector(selector);
        if (!element) return null;
        const text = element.textContent;
        element.innerHTML = ''; // Clear existing content
        const spans = [];
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block'; // Allow transform
            span.style.position = 'relative'; // Allow z-index changes maybe
            if (char === ' ') span.style.width = '0.25em'; // Give space width
            element.appendChild(span);
            spans.push(span);
        });
        return spans;
    }


    // --- Particle Text Animation ---
    function createParticleText() {
        companyNameElement.innerHTML = ''; // Clear
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            // ... (particle creation code remains the same as before) ...
             const particle = document.createElement('span');
            particle.classList.add('particle');
            particle.textContent = companyNameText[Math.floor(random(0, companyNameText.length))]; // Random char initially
            companyNameElement.appendChild(particle);

            gsap.set(particle, {
                position: 'absolute', top: '50%', left: '50%', xPercent: -50, yPercent: -50,
                color: entranceColors[Math.floor(random(0, entranceColors.length))],
                fontSize: `${random(8, 18)}px`,
                x: random(-window.innerWidth / 2, window.innerWidth / 2),
                y: random(-window.innerHeight / 2, window.innerHeight / 2),
                opacity: 0
            });
            particles.push(particle);
        }

        const targetLetters = [];
         companyNameText.split('').forEach((char) => {
            // ... (target letter creation for positioning remains same) ...
             const letter = document.createElement('span');
            letter.classList.add('target-letter');
            letter.textContent = char === ' ' ? '\u00A0' : char;
            letter.style.position = 'relative'; letter.style.display = 'inline-block';
            letter.style.visibility = 'hidden';
             letter.style.fontSize = getComputedStyle(companyNameElement).fontSize;
            companyNameElement.appendChild(letter);
            targetLetters.push(letter);
        });

        requestAnimationFrame(() => {
             const letterPositions = targetLetters.map(letter => {
                 // ... (position calculation remains same) ...
                 const rect = letter.getBoundingClientRect();
                const parentRect = companyNameElement.getBoundingClientRect();
                return {
                    x: rect.left - parentRect.left + rect.width / 2 - companyNameElement.offsetWidth / 2,
                    y: rect.top - parentRect.top + rect.height / 2 - companyNameElement.offsetHeight / 2
                };
            });
             targetLetters.forEach(letter => letter.remove());

            // Animate particles (Faster Start)
            const tl = gsap.timeline({ delay: 0.1 }); // Reduced delay
            particles.forEach((particle, i) => {
                 const targetIndex = i % companyNameText.length;
                 const targetPos = letterPositions[targetIndex];
                tl.to(particle, {
                    x: targetPos.x + random(-5, 5), y: targetPos.y + random(-5, 5),
                    opacity: random(0.5, 1), duration: random(1.0, 2.0), // Slightly faster duration
                    ease: "power2.inOut",
                }, random(0, 0.2)); // Faster stagger start

                 tl.to(particle, {
                     fontSize: getComputedStyle(companyNameElement).fontSize,
                     textContent: companyNameText[targetIndex],
                     color: 'var(--color-entrance-text)', // Use CSS variable
                     duration: 0.4, // Faster morph
                     ease: "power1.inOut"
                 }, "-=0.6"); // Adjust overlap
            });

            // No button reveal needed here, handled by CSS hover
            // Ensure title container is clickable after animation
            tl.call(() => {
                titleContainer.style.pointerEvents = 'auto'; // Enable clicks
            }, [], ">-0.2"); // Enable slightly before animation ends

            entranceTimeline.add(tl);
        });
    }

    // --- REMOVED createCylinder() ---
    // --- REMOVED createWaterfall() ---

    // --- Genome Canvas Animation ---
    let genomeParticles = [];
    function setupGenomeCanvas() {
        if (!genomeCanvas || !ctx) return; // Don't run if canvas doesn't exist
        genomeCanvas.width = window.innerWidth;
        genomeCanvas.height = mainContent.offsetHeight; // Match main content section height
        genomeParticles = [];

        for (let i = 0; i < genomeCharCount; i++) {
            genomeParticles.push({
                x: random(0, genomeCanvas.width), y: random(0, genomeCanvas.height),
                char: genomeChars[Math.floor(random(0, genomeChars.length))],
                size: random(10, 16), color: mainColors[Math.floor(random(0, mainColors.length))],
                opacity: 0, targetOpacity: random(0.1, 0.7), fadeSpeed: random(0.005, 0.02)
            });
        }
        if (!canvasAnimationId) animateGenomeCanvas();
    }

    function animateGenomeCanvas() {
        if (!ctx) return;
        ctx.clearRect(0, 0, genomeCanvas.width, genomeCanvas.height);
        genomeParticles.forEach(p => {
            // ... (fade logic remains the same) ...
             if (p.opacity < p.targetOpacity) {
                p.opacity += p.fadeSpeed;
                 if (p.opacity >= p.targetOpacity) { p.opacity = p.targetOpacity; p.targetOpacity = 0; }
            } else if (p.opacity > 0) {
                 p.opacity -= p.fadeSpeed;
                 if (p.opacity <= 0) {
                     p.opacity = 0; p.x = random(0, genomeCanvas.width); p.y = random(0, genomeCanvas.height);
                     p.targetOpacity = random(0.1, 0.7); p.char = genomeChars[Math.floor(random(0, genomeChars.length))];
                     p.color = mainColors[Math.floor(random(0, mainColors.length))];
                 }
            }
            ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px monospace`; ctx.fillText(p.char, p.x, p.y);
        });
        ctx.globalAlpha = 1.0;
        canvasAnimationId = requestAnimationFrame(animateGenomeCanvas);
    }

    function stopGenomeCanvasAnimation() { if (canvasAnimationId) cancelAnimationFrame(canvasAnimationId); canvasAnimationId = null; }
    function onResize() { stopGenomeCanvasAnimation(); setTimeout(setupGenomeCanvas, 250); }
    window.addEventListener('resize', onResize);

    // --- NEW Glitch Transition Logic ---
    function createGlitchTransition() {
        console.log("Starting glitch transition...");

        // Prevent multiple clicks
        if (titleContainer) titleContainer.style.pointerEvents = 'none';

        const letters = splitTextIntoSpans('#company-name'); // Split title into spans
        if (!letters) { // Fallback if splitting fails
            console.error("Could not split title for glitch effect.");
            // Perform simple fade/scroll as fallback?
            transitionToMainContent_Fallback();
            return;
        }

        const glitchTl = gsap.timeline({
            onComplete: () => {
                entranceScreen.style.display = 'none'; // Hide entrance screen
                if (mainContent) mainContent.style.display = 'flex'; // Show main content
                setupGenomeCanvas(); // Start canvas animation only after transition
                // Reset title container pointer events if needed for back navigation later
                // if (titleContainer) titleContainer.style.pointerEvents = 'auto';
            }
        });

        // 1. Initial quick flash/distortion
        glitchTl.to(entranceScreen, { // Flash effect
                opacity: 0.8, duration: 0.05, yoyo: true, repeat: 3,
                filter: 'brightness(1.5) contrast(1.2)' // Quick flash
            })
            .to(letters, { // Scramble letters briefly
                duration: 0.05,
                opacity: 0.5,
                // skewX: () => random(-20, 20),
                // skewY: () => random(-10, 10),
                x: () => random(-10, 10),
                y: () => random(-5, 5),
                filter: 'blur(1px)',
                stagger: { amount: 0.3, from: "random" },
                yoyo: true,
                repeat: 1
            }, "<"); // Start simultaneously with flash

        // 2. More intense glitching - letter shifting, color changes
        glitchTl.to(letters, {
                duration: 0.4,
                x: () => random(-30, 30),
                y: () => random(-20, 20),
                rotation: () => random(-15, 15),
                color: () => ['#ff00ff', '#00ffff', '#ffff00', '#ffffff'][Math.floor(random(0, 4))], // Random glitch colors
                opacity: () => random(0.2, 0.8),
                stagger: { amount: 0.5, from: "random" }
            }, "+=0.1")
            .to(entranceVideo, { // Glitch video slightly? (optional, can be heavy)
                 duration: 0.1, filter: 'contrast(2) brightness(0.5)', yoyo: true, repeat: 3
            }, "<");


        // 3. Final disintegration and scroll
        glitchTl.to(letters, { // Letters fly off / fade
                duration: 0.5,
                opacity: 0,
                // x: () => random(-200, 200),
                y: () => random(50, 150), // Fall down
                // scale: 0.5,
                filter: 'blur(5px)',
                stagger: { amount: 0.4, from: "end" },
                ease: "power2.in"
            }, "-=0.2")
             .to(entranceScreen, { // Fade out entire screen during letter disintegration
                 opacity: 0,
                 duration: 0.6,
                 ease: "power1.in"
             }, "<+=0.1"); // Start slightly after letters start fading


        // 4. Scroll down (starts while entrance fades)
         glitchTl.to(window, {
             duration: 1.2, // Slightly longer scroll
             scrollTo: { y: mainContent, offsetY: 0 },
             ease: "power2.inOut"
         }, "<"); // Start scroll when letters start flying off


    }

     // Fallback transition if glitch setup fails
     function transitionToMainContent_Fallback() {
         console.log("Using fallback transition...");
         const fallbackTl = gsap.timeline({
             onComplete: () => {
                 entranceScreen.style.display = 'none';
                 if (mainContent) mainContent.style.display = 'flex';
                 setupGenomeCanvas();
             }
         });
         fallbackTl.to(entranceScreen, { opacity: 0, duration: 0.8, ease: "power1.in" })
                   .to(window, { duration: 1.0, scrollTo: { y: mainContent, offsetY: 0 }, ease: "power2.inOut" }, 0);
     }


    // --- Initialization Function ---
    function init() {
        entranceTimeline = gsap.timeline();
        titleContainer.style.pointerEvents = 'none'; // Disable clicks until ready

        createParticleText(); // Will add itself to entranceTimeline
        // REMOVED: createCylinder();
        // REMOVED: createWaterfall();

        gsap.set(mainContent, { display: 'none', opacity: 1 });

        // --- Event Listeners ---
        // Use title container for click now
        if (titleContainer) {
             titleContainer.addEventListener('click', createGlitchTransition);
        } else {
             console.error("Title container not found!");
             // Maybe add listener to companyNameElement as fallback?
        }

         console.log("Initialization complete.");
    }

    // --- Start Everything ---
    init();

}); // End DOMContentLoaded