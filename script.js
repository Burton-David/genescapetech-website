// Wait for the DOM and GSAP to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Register GSAP plugins
    gsap.registerPlugin(ScrollToPlugin);

    console.log("GeneScape Website Initializing...");

    // --- Selectors ---
    const entranceScreen = document.getElementById('entrance-screen');
    const mainContent = document.getElementById('main-content');
    const companyNameElement = document.getElementById('company-name');
    const enterButton = document.getElementById('enter-button');
    const cylinderMask = document.querySelector('.cylinder-mask');
    const cylinderContent = document.querySelector('.cylinder-content');
    const genomeCanvas = document.getElementById('genome-canvas');
    const ctx = genomeCanvas.getContext('2d');

    // --- Configuration ---
    const companyNameText = "GeneScape Technologies";
    const particleCount = 100; // Number of particles for text effect
    const cylinderElementCount = 50; // Number of elements in the cylinder
    const cylinderSpeed = 20; // Seconds for one full rotation (lower is faster)
    const genomeCharCount = 100; // Number of characters on canvas

    let entranceTimeline; // Main timeline for entrance animations
    let canvasAnimationId; // To control the canvas animation loop


    // --- Utility Functions ---
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Sample colors from your image palettes (adjust these!)
    const entranceColors = ['#e88c0c', '#fef200', '#1fae9f', '#d44a6a', '#ffffff']; // Oranges, Yellows, Teals, Pinks from img 1
    const mainColors = ['#f0f0f0', '#a0d4e4', '#b8e8d0', '#ffffff']; // Whites, Light blues/greens from img 2
    const genomeChars = "ACGTU01"; // Characters for genome animation


    // --- Particle Text Animation ---
    function createParticleText() {
        companyNameElement.innerHTML = ''; // Clear existing content
        const particles = [];

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.classList.add('particle');
            particle.textContent = companyNameText[Math.floor(random(0, companyNameText.length))]; // Random char initially
            companyNameElement.appendChild(particle);

            gsap.set(particle, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                xPercent: -50,
                yPercent: -50,
                color: entranceColors[Math.floor(random(0, entranceColors.length))],
                fontSize: `${random(8, 18)}px`, // Smaller size for particles
                x: random(-window.innerWidth / 2, window.innerWidth / 2),
                y: random(-window.innerHeight / 2, window.innerHeight / 2),
                opacity: 0
            });
            particles.push(particle);
        }

        // Create target letters (hidden) to get positions
        const targetLetters = [];
        companyNameText.split('').forEach((char, index) => {
            const letter = document.createElement('span');
            letter.classList.add('target-letter');
            letter.textContent = char === ' ' ? '\u00A0' : char; // Handle spaces
            letter.style.position = 'relative'; // Keep them in flow
            letter.style.display = 'inline-block';
            letter.style.visibility = 'hidden'; // Don't show them
             letter.style.fontSize = getComputedStyle(companyNameElement).fontSize; // Match final size
            companyNameElement.appendChild(letter);
            targetLetters.push(letter);
        });


        // Wait a frame for letters to render and get positions
        requestAnimationFrame(() => {
            const letterPositions = targetLetters.map(letter => {
                const rect = letter.getBoundingClientRect();
                const parentRect = companyNameElement.getBoundingClientRect();
                return {
                    // Calculate position relative to the companyNameElement center
                    x: rect.left - parentRect.left + rect.width / 2 - companyNameElement.offsetWidth / 2,
                    y: rect.top - parentRect.top + rect.height / 2 - companyNameElement.offsetHeight / 2
                };
            });

             // Clean up hidden letters
             targetLetters.forEach(letter => letter.remove());

            // Animate particles
            const tl = gsap.timeline({ delay: 0.5 });
            particles.forEach((particle, i) => {
                // Assign each particle roughly to a target letter zone
                 const targetIndex = i % companyNameText.length;
                 const targetPos = letterPositions[targetIndex];

                tl.to(particle, {
                    x: targetPos.x + random(-5, 5), // Move to letter position with slight variance
                    y: targetPos.y + random(-5, 5),
                    opacity: random(0.5, 1),
                    duration: random(1.5, 2.5),
                    ease: "power2.inOut",
                    // Stagger the start time
                }, random(0, 0.5)); // Start particles moving at slightly different times within first 0.5s

                 // Fade particle text towards final text appearance later in timeline
                 tl.to(particle, {
                     fontSize: getComputedStyle(companyNameElement).fontSize, // Grow to final size
                     textContent: companyNameText[targetIndex], // Change to correct letter
                     color: '#FFFFFF', // Final text color (adjust if needed)
                     duration: 0.5,
                     ease: "power1.inOut"
                 }, "-=0.8"); // Overlap with particle movement end
            });

            // Reveal Enter button after animation
            tl.to(enterButton, {
                opacity: 1,
                display: 'inline-block',
                duration: 0.5
            }, ">-0.5"); // Start slightly before particle animation fully settles

             // Add hover effect to show button if it was hidden
             companyNameElement.style.cursor = 'pointer';
             companyNameElement.addEventListener('mouseover', () => {
                 if (getComputedStyle(enterButton).display === 'none') {
                      gsap.to(enterButton, {opacity: 1, display: 'inline-block', duration: 0.3 });
                 }
             });
             // Optional: Hide button on mouse out?
             // companyNameElement.addEventListener('mouseout', () => { ... });

            entranceTimeline.add(tl); // Add this animation to the main entrance timeline
        });


    }

    // --- Cylinder Animation ---
    function createCylinder() {
        cylinderContent.innerHTML = ''; // Clear previous
        let totalWidth = 0;
        const elementHeight = cylinderMask.offsetHeight / 5; // Example height

        for (let i = 0; i < cylinderElementCount; i++) {
            const element = document.createElement('div');
            element.classList.add('cylinder-element');
            const width = random(50, 150);
            totalWidth += width + 5; // width + margin

            gsap.set(element, {
                width: width,
                height: random(elementHeight * 0.5, elementHeight * 1.5),
                backgroundColor: entranceColors[Math.floor(random(0, entranceColors.length))],
                display: 'inline-block',
                marginRight: '5px',
                opacity: random(0.4, 0.8),
                y: random(-elementHeight / 2, elementHeight / 2) // Random vertical offset
            });
            cylinderContent.appendChild(element);
        }

        // Set total width for seamless looping
        gsap.set(cylinderContent, { width: totalWidth * 2 }); // Make it wide enough to loop seamlessly
        // Clone elements for loop
        cylinderContent.innerHTML += cylinderContent.innerHTML;


        // Create the scrolling animation
        const cylinderTl = gsap.timeline({ repeat: -1, ease: "none" }); // Infinite loop, linear ease
        cylinderTl.to(cylinderContent, {
            x: `-=${totalWidth}`, // Move left by the original content width
            duration: cylinderSpeed
        });

        // Create subtle undulating animation for some elements
        const elementsToUndulate = gsap.utils.toArray('.cylinder-element');
        gsap.to(elementsToUndulate, {
            scale: (i, target) => (i % 3 === 0) ? random(0.9, 1.1) : 1, // Scale every 3rd element
            opacity: (i, target) => (i % 5 === 0) ? random(0.3, 0.9) : target.style.opacity, // Change opacity of every 5th
            duration: random(1.5, 3),
            repeat: -1,
            yoyo: true, // Makes it pulse back and forth
            stagger: {
                each: 0.2, // Stagger the start times
                from: "random"
            },
            ease: "sine.inOut"
        });

        entranceTimeline.add(cylinderTl, 0); // Add cylinder scroll to main timeline at the beginning
    }

    // --- Subtle Waterfall Effect (Simple Version) ---
    function createWaterfall() {
       const waterfallContainer = document.createElement('div');
       waterfallContainer.classList.add('waterfall-container');
       entranceScreen.insertBefore(waterfallContainer, entranceScreen.firstChild); // Add behind overlay

       gsap.set(waterfallContainer, {
           position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
           zIndex: 2, overflow: 'hidden', pointerEvents: 'none'
       });

       const columnCount = Math.floor(window.innerWidth / 50); // Adjust density

       for (let i = 0; i < columnCount; i++) {
           const column = document.createElement('div');
           column.classList.add('waterfall-column');
           waterfallContainer.appendChild(column);
           gsap.set(column, {
               position: 'absolute',
               left: `${random(0, 100)}%`,
               top: `${random(-50, 0)}%`, // Start off-screen top
               fontSize: `${random(8, 12)}px`,
               color: entranceColors[Math.floor(random(0, entranceColors.length))],
               opacity: random(0.1, 0.4),
               writingMode: 'vertical-rl', // Simple vertical text
               textOrientation: 'mixed',
               whiteSpace: 'nowrap'
           });
           column.textContent = "01".repeat(Math.floor(random(10, 30))); // Repeating binary string

           // Animate column falling
           gsap.to(column, {
               y: `${random(100, 150)}vh`, // Fall down screen
               duration: random(5, 15),
               repeat: -1,
               delay: random(0, 10), // Staggered start times
               ease: "none"
           });
       }
    }


    // --- Genome Canvas Animation ---
    let genomeParticles = [];
    function setupGenomeCanvas() {
        genomeCanvas.width = window.innerWidth;
        genomeCanvas.height = window.innerHeight; // Match parent initially
        genomeParticles = []; // Clear existing particles

        for (let i = 0; i < genomeCharCount; i++) {
            genomeParticles.push({
                x: random(0, genomeCanvas.width),
                y: random(0, genomeCanvas.height),
                char: genomeChars[Math.floor(random(0, genomeChars.length))],
                size: random(10, 16),
                color: mainColors[Math.floor(random(0, mainColors.length))],
                opacity: 0,
                targetOpacity: random(0.1, 0.7), // Target opacity to fade to
                fadeSpeed: random(0.005, 0.02)
            });
        }

        // Start animation loop if it's not already running
        if (!canvasAnimationId) {
            animateGenomeCanvas();
        }
    }

    function animateGenomeCanvas() {
        ctx.clearRect(0, 0, genomeCanvas.width, genomeCanvas.height); // Clear canvas

        genomeParticles.forEach(p => {
            // Fade in/out logic
            if (p.opacity < p.targetOpacity) {
                p.opacity += p.fadeSpeed;
                 if (p.opacity >= p.targetOpacity) { // Start fading out
                      p.opacity = p.targetOpacity;
                      p.targetOpacity = 0; // Target fade out
                 }
            } else if (p.opacity > 0) {
                 p.opacity -= p.fadeSpeed;
                 if (p.opacity <= 0) { // Reset when fully faded out
                     p.opacity = 0;
                     p.x = random(0, genomeCanvas.width);
                     p.y = random(0, genomeCanvas.height);
                     p.targetOpacity = random(0.1, 0.7); // Target fade in again
                     p.char = genomeChars[Math.floor(random(0, genomeChars.length))];
                     p.color = mainColors[Math.floor(random(0, mainColors.length))];
                 }
            }


            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px monospace`; // Monospace looks techy
            ctx.fillText(p.char, p.x, p.y);
        });

        ctx.globalAlpha = 1.0; // Reset global alpha
        canvasAnimationId = requestAnimationFrame(animateGenomeCanvas); // Loop
    }

    function stopGenomeCanvasAnimation() {
         if (canvasAnimationId) {
             cancelAnimationFrame(canvasAnimationId);
             canvasAnimationId = null;
         }
     }

    // Handle resize for canvas
    function onResize() {
        stopGenomeCanvasAnimation(); // Stop loop
        // Debounce resize event slightly
        setTimeout(() => {
            setupGenomeCanvas(); // Re-setup canvas for new size
        }, 250);
    }
    window.addEventListener('resize', onResize);


    // --- Transition Logic ---
    function transitionToMainContent() {
        console.log("Transitioning to main content...");

         // Prevent double clicks
         enterButton.disabled = true;
         companyNameElement.style.pointerEvents = 'none'; // Disable clicks on name too


        const transitionTl = gsap.timeline({
            onComplete: () => {
                // Cleanup entrance screen elements if needed, or just hide
                entranceScreen.style.display = 'none';
                 // Start main content animations
                 setupGenomeCanvas();
            }
        });

        // Animate entrance elements out
        transitionTl.to([companyNameElement, enterButton, cylinderMask, '.waterfall-container'], { // Select all relevant elements
            y: '+=50', // Move down
            opacity: 0,
            duration: 0.7, // Faster exit
            stagger: 0.1, // Slight stagger
            ease: "power2.in"
        });

         // Ensure main content is ready (display: flex) before scrolling
         gsap.set(mainContent, { display: 'flex'});

        // Scroll down to the main content section smoothly
        transitionTl.to(window, {
            duration: 1.0, // Duration of the scroll
            scrollTo: {
                y: mainContent, // Scroll to the top of the main content section
                offsetY: 0 // Optional offset if you have a sticky header
            },
            ease: "power2.inOut" // Smooth easing for scroll
        }, 0); // Start scroll at the beginning of the transition timeline


    }


    // --- Initialization Function ---
    function init() {
        entranceTimeline = gsap.timeline(); // Create main timeline

        // Setup entrance animations
        createParticleText(); // Will add itself to entranceTimeline
        createCylinder();    // Adds itself to entranceTimeline at time 0
        createWaterfall();   // Runs independently with GSAP tweens

        // Initially hide main content and button
        gsap.set(mainContent, { display: 'none', opacity: 1 }); // Ensure opacity is 1 for later scroll reveal
        gsap.set(enterButton, { display: 'none', opacity: 0 });

        // --- Event Listeners ---
        // Add click listeners AFTER animations are set up
        companyNameElement.addEventListener('click', transitionToMainContent);
        enterButton.addEventListener('click', transitionToMainContent);

         console.log("Initialization complete.");
    }


    // --- Start Everything ---
    init();

}); // End DOMContentLoaded