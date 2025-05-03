document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    console.log("GeneScape Website Initializing (Debug Logging Added)..."); // Updated log message

    // --- Selectors ---
    const entranceScreen = document.getElementById('entrance-screen');
    const mainContent = document.getElementById('main-content');
    const titleContainer = document.getElementById('title-container');
    const companyNameElement = document.getElementById('company-name');
    const backButton = document.getElementById('back-button');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenuBtn = document.querySelector('.close-menu-button');
    const mobileMenuLinks = document.querySelectorAll('.mobile-nav-links a');
    // const backgroundImages = document.querySelectorAll('.background-image'); // Selector kept if needed later, but effect removed
    const body = document.body;

    // --- Configuration ---
    const companyNameText = "GeneScape Technologies";
    const particleCount = 70;
    // Get initial title color from CSS variable or fallback
    const initialTitleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-title-initial').trim() || '#C9AB7C';
    // Define colors for the glitch effect based on the palette
    const glitchColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#777']; // Red, Gold, White, Dark, Grey

    let entranceTimeline;
    let titleSpans = null; // Store split title spans

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }
    const entranceColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#E6C38C', '#BB9671']; // Colors for particles

    function splitTextIntoSpans(element) {
        if (!element) return null;
        const text = element.textContent.trim();
        element.innerHTML = '';
        const spans = [];
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.position = 'relative';
            span.style.minWidth = (char === ' ') ? '0.25em' : 'auto'; // Ensure space has width
            element.appendChild(span);
            spans.push(span);
        });
        return spans;
    }

    // --- Particle Text Animation ---
    function createParticleText(onCompleteCallback) {
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
                fontSize: `${random(10, 20)}px`,
                x: random(-window.innerWidth * 0.7, window.innerWidth * 0.7),
                y: random(-window.innerHeight * 0.7, window.innerHeight * 0.7),
                opacity: 0, zIndex: 5
            });
            particles.push(particle);
        }

        // Create hidden target letters for positioning
        const targetLetters = [];
        const tempContainer = document.createElement('div');
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.position = 'absolute';
        // Apply relevant styles for measurement
        const finalStyle = getComputedStyle(companyNameElement);
        tempContainer.style.fontFamily = finalStyle.fontFamily;
        tempContainer.style.fontSize = finalStyle.fontSize;
        tempContainer.style.fontWeight = finalStyle.fontWeight;
        tempContainer.style.letterSpacing = finalStyle.letterSpacing;
        document.body.appendChild(tempContainer);

        companyNameText.split('').forEach((char) => {
            const letter = document.createElement('span');
            letter.textContent = char === ' ' ? '\u00A0' : char;
            letter.style.display = 'inline-block'; // Needed for getBoundingClientRect
            tempContainer.appendChild(letter);
            targetLetters.push(letter);
        });

        // Calculate positions
        const letterPositions = targetLetters.map(letter => {
            const rect = letter.getBoundingClientRect();
            // Calculate position relative to window center (approximates final centered H1)
            return {
                x: rect.left - window.innerWidth/2 + rect.width/2,
                y: rect.top - window.innerHeight/2 + rect.height/2
            };
        });
        document.body.removeChild(tempContainer); // Clean up

        // Animation Timeline
        const tl = gsap.timeline({ delay: 0.3, onComplete: onCompleteCallback });
        particles.forEach((particle, i) => {
            const targetIndex = i % companyNameText.length;
            const targetPos = letterPositions[targetIndex];
            tl.to(particle, {
                x: targetPos.x + random(-5, 5), y: targetPos.y + random(-5, 5), // Move to target with variance
                opacity: random(0.7, 1), duration: random(1.3, 2.3), ease: "power3.inOut",
            }, random(0, 0.35)); // Stagger start

            tl.to(particle, { // Morph into final letter appearance
                fontSize: finalStyle.fontSize,
                fontWeight: finalStyle.fontWeight,
                fontFamily: finalStyle.fontFamily,
                letterSpacing: finalStyle.letterSpacing,
                textContent: companyNameText[targetIndex],
                color: initialTitleColor,
                duration: 0.6, ease: "power1.inOut"
            }, "-=0.8"); // Overlap significantly
        });

        // Final clean-up step
        tl.call(() => {
            companyNameElement.innerHTML = ''; // Clear particles
            titleSpans = splitTextIntoSpans(companyNameElement); // Create final spans and store reference
            gsap.set(titleSpans, { color: initialTitleColor, opacity: 1 }); // Ensure final state
            console.log("Particle text finalized into spans.");
        }, [], ">-=0.1");

        if (entranceTimeline) entranceTimeline.add(tl);
        else entranceTimeline = tl; // Initialize if it doesn't exist
    }


    // --- Glitch Transition Logic (with Debug Logging) ---
    function createGlitchTransition() {
        console.log(">>> Glitch Transition START"); // Log Start
        if (titleContainer) titleContainer.style.pointerEvents = 'none';
        if (backButton) backButton.style.pointerEvents = 'none';

        // Use the stored titleSpans if available, otherwise try splitting again
        const letters = titleSpans || splitTextIntoSpans(companyNameElement);

        if (!letters || letters.length === 0) { // Check if letters array is valid
            console.error("!!! Glitch Error: Could not get title spans for glitch effect.");
            transitionToMainContent_Fallback(); return;
        }
        console.log(`    Glitch: Acquired ${letters.length} title spans.`);

        const glitchTl = gsap.timeline({
            onComplete: () => {
                console.log(">>> Glitch Timeline COMPLETE"); // Log Completion
                console.log("    Adding .hidden to #entrance-screen");
                entranceScreen.classList.add('hidden');
                console.log("    Adding .visible to #main-content");
                mainContent.classList.add('visible');
                console.log("    Main content should now be visible.");
                // Enable back button after transition
                if (backButton) backButton.style.pointerEvents = 'auto';
                // Keep title container disabled unless explicitly needed again
                // if (titleContainer) titleContainer.style.pointerEvents = 'auto';
            },
            onStart: () => { // Log when timeline actually starts playing
                 console.log("    Glitch Timeline playing...");
            }
        });

        // 1. Initial quick flash/distortion
        console.log("    Glitch: Setting up step 1 (flash/scramble)");
        glitchTl.to(entranceScreen, { duration: 0.05, filter: 'brightness(1.2)', yoyo: true, repeat: 2 })
            .to(letters, {
                duration: 0.05, opacity: 0.8, x: () => random(-6, 6), y: () => random(-4, 4),
                filter: 'blur(0.5px)', stagger: { amount: 0.25, from: "random" }, yoyo: true, repeat: 1
            }, "<");

        // 2. More intense glitching
        console.log("    Glitch: Setting up step 2 (intense glitch)");
        glitchTl.to(letters, {
                duration: 0.4, x: () => random(-20, 20), y: () => random(-12, 12),
                rotation: () => random(-8, 8),
                color: () => glitchColors[Math.floor(random(0, glitchColors.length))],
                opacity: () => random(0.4, 0.9), stagger: { amount: 0.45, from: "random" }
            }, "+=0.05");

        // 3. Final disintegration and Scroll Trigger
        console.log("    Glitch: Setting up step 3 (disintegration/scroll)");
        glitchTl.to(letters, {
                duration: 0.5, opacity: 0, y: () => random(50, 120), filter: 'blur(5px)',
                stagger: { amount: 0.4, from: "center" }, ease: "power1.in"
            }, "-=0.15")
             .to(window, { // Scroll starts as letters disintegrate
                 duration: 1.1,
                 scrollTo: { y: 0 }, // Scroll to top of page
                 ease: "power2.inOut",
                 onStart: () => console.log("    Glitch: Scroll animation starting."), // Log scroll start
                 onComplete: () => console.log("    Glitch: Scroll animation complete.") // Log scroll end
             }, "<"); // Start scroll earlier relative to letter fade

        console.log("    Glitch: Timeline setup complete.");
    }

     // --- Back Button Transition ---
     function transitionToEntranceScreen() {
         console.log(">>> Transitioning back to entrance START");
         if (backButton) backButton.style.pointerEvents = 'none';
         if (titleContainer) titleContainer.style.pointerEvents = 'none';
         closeMobileMenu(); // Close menu if open

         const backTl = gsap.timeline({
             onComplete: () => {
                 console.log(">>> Transition back to entrance COMPLETE");
                 if (titleContainer) titleContainer.style.pointerEvents = 'auto'; // Re-enable title click
             }
         });

         // 1. Scroll window back to top smoothly
         console.log("    BackTransition: Scrolling to top...");
         backTl.to(window, {
             duration: 0.8,
             scrollTo: { y: 0 },
             ease: "power2.inOut",
             onComplete: () => console.log("    BackTransition: Scroll complete.")
         });

         // 2. Fade out main content (using class) and fade in entrance screen
         backTl.call(() => {
             console.log("    BackTransition: Hiding main content, showing entrance.");
             mainContent.classList.remove('visible');
             entranceScreen.classList.remove('hidden');
             // Reset title to clean state immediately
             console.log("    BackTransition: Resetting title spans.");
             if (titleSpans) { // Ensure spans exist before trying to reset
                 gsap.set(titleSpans, { clearProps: "all", color: initialTitleColor, opacity: 1 });
             } else { // Fallback if spans somehow got lost
                 companyNameElement.innerHTML = '';
                 titleSpans = splitTextIntoSpans(companyNameElement);
                 if(titleSpans) gsap.set(titleSpans, { color: initialTitleColor, opacity: 1 });
             }
         }, null, ">-0.4"); // Start fade slightly before scroll finishes
     }

     // Fallback transition
     function transitionToMainContent_Fallback() {
         console.warn("!!! Using fallback transition to main content!"); // Use warn level
         const fallbackTl = gsap.timeline({
             onComplete: () => {
                 console.log("    Fallback Transition COMPLETE");
                 entranceScreen.classList.add('hidden');
                 mainContent.classList.add('visible');
                  if (backButton) backButton.style.pointerEvents = 'auto'; // Enable back button
             }
         });
         // Just use the class-based fade + scroll
         fallbackTl.to(window, { duration: 1.0, scrollTo: { y: 0 }, ease: "power2.inOut" }, 0);
     }

    // --- REMOVED Parallax Effect Code ---

    // --- Mobile Menu Logic ---
    function openMobileMenu() {
        console.log("Opening mobile menu");
        body.classList.add('mobile-menu-open');
        mobileMenuButton.querySelector('i').classList.remove('fa-bars');
        mobileMenuButton.querySelector('i').classList.add('fa-times');
        // Animate menu slide-in
        gsap.to(mobileMenu, { right: 0, duration: 0.4, ease: 'power2.out' });
        // Animate overlay fade-in
        gsap.to(mobileMenuOverlay, { autoAlpha: 1, duration: 0.4 }); // Use autoAlpha for visibility+opacity
        mobileMenuOverlay.style.pointerEvents = 'auto';
    }

    function closeMobileMenu() {
        if (!body.classList.contains('mobile-menu-open')) return; // Don't run if already closed
        console.log("Closing mobile menu");
        body.classList.remove('mobile-menu-open');
        mobileMenuButton.querySelector('i').classList.remove('fa-times');
        mobileMenuButton.querySelector('i').classList.add('fa-bars');
        // Animate menu slide-out
        gsap.to(mobileMenu, { right: `-${mobileMenu.offsetWidth}px`, duration: 0.4, ease: 'power2.in' });
         // Animate overlay fade-out
        gsap.to(mobileMenuOverlay, { autoAlpha: 0, duration: 0.4 });
        mobileMenuOverlay.style.pointerEvents = 'none';
    }

    function toggleMobileMenu() {
        if (body.classList.contains('mobile-menu-open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    // --- Initialization Function ---
    function init() {
        console.log("Initializing page...");
        entranceTimeline = gsap.timeline();
        if(titleContainer) titleContainer.style.pointerEvents = 'none'; // Disable clicks initially

        // Run particle animation, enable clicks on completion
        createParticleText(() => {
             if (titleContainer) titleContainer.style.pointerEvents = 'auto';
             console.log("Particle text animation complete. Title clickable.");
        });

        // REMOVED setupParallax();

        // Ensure correct initial states visually
        gsap.set(mainContent, { display: 'flex', opacity: 0, visibility: 'hidden' });
        gsap.set(backButton, { autoAlpha: 0, pointerEvents: 'none' }); // Use autoAlpha
        gsap.set(mobileMenuButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuOverlay, { autoAlpha: 0, pointerEvents: 'none' });
        if (mobileMenu) gsap.set(mobileMenu, { right: '-300px' }); // Ensure menu starts off-screen

        // --- Event Listeners ---
        if (titleContainer) titleContainer.addEventListener('click', createGlitchTransition);
        else console.error("Title container not found!");

        if (backButton) backButton.addEventListener('click', transitionToEntranceScreen);
        else console.error("Back button not found!");

        if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
        else console.error("Mobile menu button not found!");

        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
        else console.error("Close menu button not found!");

        if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        else console.error("Mobile menu overlay not found!");

        // Close menu and scroll when clicking a nav link
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                // Close menu *before* scrolling
                if (body.classList.contains('mobile-menu-open')) {
                     closeMobileMenu();
                     // Add slight delay to scroll after menu starts closing
                     gsap.delayedCall(0.2, () => {
                         if (targetSection) {
                             gsap.to(window, { duration: 0.8, scrollTo: { y: targetSection, offsetY: 80 }, ease: "power2.inOut"});
                         }
                     });
                } else {
                     // If menu is already closed, just scroll
                     if (targetSection) {
                          gsap.to(window, { duration: 0.8, scrollTo: { y: targetSection, offsetY: 80 }, ease: "power2.inOut"});
                     }
                }
            });
        });

         console.log("Initialization complete.");
    }
    init();

}); // End DOMContentLoaded