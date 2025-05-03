document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    console.log("GeneScape Website Initializing (Final Pass)...");

    // --- Selectors ---
    const entranceScreen = document.getElementById('entrance-screen');
    const mainContent = document.getElementById('main-content');
    const titleContainer = document.getElementById('title-container');
    const companyNameElement = document.getElementById('company-name');
    const genomeCanvas = document.getElementById('genome-canvas');
    const ctx = genomeCanvas ? genomeCanvas.getContext('2d') : null;
    const entranceVideo = document.getElementById('entranceVideo');
    const mainContentArea = document.querySelector('.main-content-area'); // Get content area for height

    // --- Configuration ---
    const companyNameText = "GeneScape Technologies";
    const particleCount = 80;
    const genomeCharCount = 80; // Reduced for more subtlety
    const darkTextColor = getComputedStyle(document.documentElement).getPropertyValue('--color-dark-text').trim() || '#222222';

    let entranceTimeline;
    let canvasAnimationId;

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }
    const entranceColors = ['#e88c0c', '#fef200', '#1fae9f', '#d44a6a', '#ffffff', '#00ffff']; // Added cyan
    const mainColors = ['#f0f0f0', '#a0d4e4', '#b8e8d0', '#ffffff', '#88ddff']; // Adjusted for image2
    const genomeChars = "ACGTU01";

    function splitTextIntoSpans(selector) {
        // ... (splitTextIntoSpans function remains the same) ...
        const element = document.querySelector(selector);
        if (!element) return null;
        const text = element.textContent.trim(); // Trim whitespace
        element.innerHTML = '';
        const spans = [];
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.position = 'relative';
            if (char === ' ') span.style.width = '0.25em';
            element.appendChild(span);
            spans.push(span);
        });
        return spans;
    }

    // --- Particle Text Animation ---
    function createParticleText() {
        // ... (particle creation logic is mostly the same) ...
        companyNameElement.innerHTML = '';
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.classList.add('particle');
            particle.textContent = companyNameText[Math.floor(random(0, companyNameText.length))];
            companyNameElement.appendChild(particle);
            gsap.set(particle, {
                position: 'absolute', top: '50%', left: '50%', xPercent: -50, yPercent: -50,
                color: entranceColors[Math.floor(random(0, entranceColors.length))],
                fontSize: `${random(10, 20)}px`, // Slightly larger base particles
                x: random(-window.innerWidth * 0.6, window.innerWidth * 0.6), // Wider spread
                y: random(-window.innerHeight * 0.6, window.innerHeight * 0.6),
                opacity: 0
            });
            particles.push(particle);
        }

        const targetLetters = [];
        companyNameText.split('').forEach((char) => {
            const letter = document.createElement('span');
            letter.textContent = char === ' ' ? '\u00A0' : char;
            letter.style.position = 'relative'; letter.style.display = 'inline-block';
            letter.style.visibility = 'hidden';
            // Get font size *after* setting it in CSS for accuracy
            const computedStyle = getComputedStyle(companyNameElement);
            letter.style.fontSize = computedStyle.fontSize;
            letter.style.fontWeight = computedStyle.fontWeight;
            letter.style.fontFamily = computedStyle.fontFamily;
             letter.style.color = 'transparent'; // Hide effectively
            companyNameElement.appendChild(letter);
            targetLetters.push(letter);
        });

        requestAnimationFrame(() => {
            const letterPositions = targetLetters.map(letter => {
                const rect = letter.getBoundingClientRect();
                const parentRect = companyNameElement.getBoundingClientRect();
                return {
                    x: rect.left - parentRect.left + rect.width / 2 - companyNameElement.offsetWidth / 2,
                    y: rect.top - parentRect.top + rect.height / 2 - companyNameElement.offsetHeight / 2
                };
            });
            targetLetters.forEach(letter => letter.remove()); // Clean up placeholders

            const tl = gsap.timeline({ delay: 0.2 }); // Slight delay remains
            particles.forEach((particle, i) => {
                const targetIndex = i % companyNameText.length;
                const targetPos = letterPositions[targetIndex];
                tl.to(particle, {
                    x: targetPos.x + random(-8, 8), y: targetPos.y + random(-8, 8), // Slightly more variance
                    opacity: random(0.6, 1), duration: random(1.2, 2.2),
                    ease: "power3.inOut", // Smoother ease
                }, random(0, 0.3)); // Slightly wider stagger

                tl.to(particle, {
                    fontSize: getComputedStyle(companyNameElement).fontSize, // Match final CSS size
                    textContent: companyNameText[targetIndex],
                    color: darkTextColor, // Final color (dark text)
                    duration: 0.5,
                    ease: "power1.inOut"
                }, "-=0.7"); // Adjust overlap
            });

            tl.call(() => {
                if (titleContainer) titleContainer.style.pointerEvents = 'auto';
            }, [], ">-0.1");

            entranceTimeline.add(tl);
        });
    }


    // --- Genome Canvas Animation ---
    function setupGenomeCanvas() {
        if (!genomeCanvas || !ctx || !mainContentArea) return;
        genomeCanvas.width = window.innerWidth;
        // Set height based on the actual rendered height of the content area + some buffer
        genomeCanvas.height = mainContentArea.scrollHeight + 100; // Add buffer
        mainContent.style.minHeight = `${genomeCanvas.height}px`; // Ensure main content is tall enough

        genomeParticles = [];
        for (let i = 0; i < genomeCharCount; i++) {
            genomeParticles.push({
                x: random(0, genomeCanvas.width), y: random(0, genomeCanvas.height),
                char: genomeChars[Math.floor(random(0, genomeChars.length))],
                size: random(10, 15), // Slightly smaller
                color: mainColors[Math.floor(random(0, mainColors.length))],
                opacity: 0, targetOpacity: random(0.1, 0.5), // Reduced max opacity
                fadeSpeed: random(0.003, 0.015) // Slightly slower fade
            });
        }
        if (!canvasAnimationId) animateGenomeCanvas();
    }

    function animateGenomeCanvas() {
        // ... (animation loop logic remains the same) ...
        if (!ctx) return;
        ctx.clearRect(0, 0, genomeCanvas.width, genomeCanvas.height);
        genomeParticles.forEach(p => {
             if (p.opacity < p.targetOpacity) {
                p.opacity += p.fadeSpeed;
                 if (p.opacity >= p.targetOpacity) { p.opacity = p.targetOpacity; p.targetOpacity = 0; }
            } else if (p.opacity > 0) {
                 p.opacity -= p.fadeSpeed;
                 if (p.opacity <= 0) {
                     p.opacity = 0; p.x = random(0, genomeCanvas.width); p.y = random(0, genomeCanvas.height);
                     p.targetOpacity = random(0.1, 0.5); p.char = genomeChars[Math.floor(random(0, genomeChars.length))];
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
    function onResize() {
        stopGenomeCanvasAnimation();
        // Use debounce or throttle for resize in production if needed
        setTimeout(() => {
            if (mainContent.style.display !== 'none') { // Only setup if visible
                 setupGenomeCanvas();
            }
        }, 250);
    }
    window.addEventListener('resize', onResize);


    // --- Glitch Transition Logic ---
    function createGlitchTransition() {
        console.log("Starting glitch transition...");
        if (titleContainer) titleContainer.style.pointerEvents = 'none';

        const letters = splitTextIntoSpans('#company-name');
        if (!letters) { transitionToMainContent_Fallback(); return; }

        const glitchTl = gsap.timeline({
            onComplete: () => {
                entranceScreen.style.display = 'none';
                if (mainContent) mainContent.style.display = 'flex';
                // Set initial scroll position before canvas setup
                window.scrollTo(0, mainContent.offsetTop);
                // Delay canvas setup slightly to ensure layout is stable
                gsap.delayedCall(0.1, setupGenomeCanvas);
            }
        });

        // 1. Initial quick flash/distortion (subtler)
        glitchTl.to(entranceScreen, { opacity: 0.9, duration: 0.04, yoyo: true, repeat: 2, filter: 'brightness(1.3)' })
            .to(letters, {
                duration: 0.04, opacity: 0.7, x: () => random(-5, 5), y: () => random(-3, 3),
                filter: 'blur(0.5px)', stagger: { amount: 0.2, from: "random" }, yoyo: true, repeat: 1
            }, "<");

        // 2. More intense glitching (focused on letters)
        glitchTl.to(letters, {
                duration: 0.35, x: () => random(-25, 25), y: () => random(-15, 15),
                rotation: () => random(-10, 10),
                color: () => ['#ff00ff', '#00ffff', '#ffff00', '#ffffff', '#555555'][Math.floor(random(0, 5))],
                opacity: () => random(0.3, 0.9), stagger: { amount: 0.4, from: "random" }
            }, "+=0.05")
             .to(entranceVideo, { // Optional video glitch
                  duration: 0.08, filter: 'contrast(1.5) brightness(0.7)', yoyo: true, repeat: 2
             }, "<");

        // 3. Final disintegration and scroll
        glitchTl.to(letters, {
                duration: 0.45, opacity: 0, y: () => random(40, 100), filter: 'blur(4px)',
                stagger: { amount: 0.35, from: "center" }, // Changed stagger origin
                ease: "power1.in"
            }, "-=0.15")
             .to(entranceScreen, {
                 opacity: 0, duration: 0.5, ease: "power1.in"
             }, "<+=0.1");

        // 4. Scroll down
         gsap.set(mainContent, { display: 'flex'}); // Ensure display is set before scroll starts
         glitchTl.to(window, {
             duration: 1.1, scrollTo: { y: mainContent, offsetY: 0 }, ease: "power2.inOut"
         }, "<"); // Start scroll slightly earlier relative to fade
    }

     // Fallback transition
     function transitionToMainContent_Fallback() {
         // ... (Fallback remains the same) ...
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
        if(titleContainer) titleContainer.style.pointerEvents = 'none'; // Disable clicks initially

        createParticleText();

        gsap.set(mainContent, { display: 'none', opacity: 1 });

        // --- Event Listeners ---
        if (titleContainer) {
             titleContainer.addEventListener('click', createGlitchTransition);
        } else {
             console.error("Title container not found!");
        }
         console.log("Initialization complete.");
    }
    init();

}); // End DOMContentLoaded