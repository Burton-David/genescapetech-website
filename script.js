document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    console.log("GeneScape Website Initializing (Fixing Init Logic)...");

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
    const body = document.body;

    // --- Configuration ---
    const companyNameText = "GeneScape Technologies";
    const particleCount = 70;
    const initialTitleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-title-initial').trim() || '#C9AB7C';
    const glitchColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#777'];

    let entranceTimeline; // Keep this if other entrance animations are added later
    let titleSpans = null; // Store split title spans

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }
    const entranceColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#E6C38C', '#BB9671'];

    function splitTextIntoSpans(element) {
        // ... (splitTextIntoSpans function remains the same) ...
        if (!element) return null;
        const text = element.textContent.trim();
        element.innerHTML = '';
        const spans = [];
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.position = 'relative';
            span.style.minWidth = (char === ' ') ? '0.25em' : 'auto';
            element.appendChild(span);
            spans.push(span);
        });
        return spans;
    }

    // --- Particle Text Animation ---
    function createParticleText(onCompleteCallback) { // Pass the callback
        console.log("-> Starting createParticleText...");
        companyNameElement.innerHTML = '';
        const particles = [];
        // ... (particle creation loop remains the same) ...
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

        // ... (hidden target letter creation/measurement remains the same) ...
        const targetLetters = [];
        const tempContainer = document.createElement('div');
        tempContainer.style.visibility = 'hidden'; tempContainer.style.position = 'absolute';
        const finalStyle = getComputedStyle(companyNameElement);
        tempContainer.style.fontFamily = finalStyle.fontFamily; tempContainer.style.fontSize = finalStyle.fontSize;
        tempContainer.style.fontWeight = finalStyle.fontWeight; tempContainer.style.letterSpacing = finalStyle.letterSpacing;
        document.body.appendChild(tempContainer);
        companyNameText.split('').forEach((char) => {
            const letter = document.createElement('span');
            letter.textContent = char === ' ' ? '\u00A0' : char;
            letter.style.display = 'inline-block';
            tempContainer.appendChild(letter);
            targetLetters.push(letter);
        });
        const letterPositions = targetLetters.map(letter => {
            const rect = letter.getBoundingClientRect();
            return {
                x: rect.left - window.innerWidth/2 + rect.width/2,
                y: rect.top - window.innerHeight/2 + rect.height/2
            };
        });
        document.body.removeChild(tempContainer);


        // Animation Timeline
        // **IMPORTANT**: Define the timeline *outside* the requestAnimationFrame
        const tl = gsap.timeline({
            delay: 0.3,
            onComplete: () => { // Use GSAP's onComplete for reliability
                console.log("   Particle Timeline onComplete triggered.");
                companyNameElement.innerHTML = ''; // Clear particles
                titleSpans = splitTextIntoSpans(companyNameElement); // Create final spans and store reference
                if (titleSpans) {
                    gsap.set(titleSpans, { color: initialTitleColor, opacity: 1 }); // Ensure final clean state
                    console.log("   Final title spans created and styled.");
                    if (typeof onCompleteCallback === 'function') {
                        console.log("   Executing onCompleteCallback.");
                        onCompleteCallback(); // Execute the callback passed from init
                    }
                } else {
                    console.error("!!! Failed to create final title spans in particle animation onComplete.");
                }
            }
        });

        // Animate particles (inside or outside requestAnimationFrame doesn't matter much here)
        particles.forEach((particle, i) => {
            const targetIndex = i % companyNameText.length;
            const targetPos = letterPositions[targetIndex];
            tl.to(particle, {
                x: targetPos.x + random(-5, 5), y: targetPos.y + random(-5, 5),
                opacity: random(0.7, 1), duration: random(1.3, 2.3), ease: "power3.inOut",
            }, random(0, 0.35));

            tl.to(particle, {
                fontSize: finalStyle.fontSize, fontWeight: finalStyle.fontWeight,
                fontFamily: finalStyle.fontFamily, letterSpacing: finalStyle.letterSpacing,
                textContent: companyNameText[targetIndex], color: initialTitleColor,
                duration: 0.6, ease: "power1.inOut"
            }, "-=0.8");
        });

        // No final .call() needed here, handled by onComplete

        console.log("-> Particle animation timeline created.");
        // Assign to entranceTimeline if needed for global control, otherwise let it run
        // entranceTimeline = tl;
    }


    // --- Glitch Transition Logic (with Debug Logging) ---
    function createGlitchTransition() {
        console.log(">>> Glitch Transition START");
        if (titleContainer) titleContainer.style.pointerEvents = 'none';
        if (backButton) backButton.style.pointerEvents = 'none';

        // Use the stored titleSpans; it should exist now if called correctly
        const letters = titleSpans;

        if (!letters || letters.length === 0) {
            console.error("!!! Glitch Error: titleSpans not available when transition called.");
            transitionToMainContent_Fallback(); return;
        }
        console.log(`    Glitch: Acquired ${letters.length} title spans.`);

        const glitchTl = gsap.timeline({
            onComplete: () => {
                console.log(">>> Glitch Timeline COMPLETE");
                console.log("    Adding .hidden to #entrance-screen");
                entranceScreen.classList.add('hidden');
                console.log("    Adding .visible to #main-content");
                mainContent.classList.add('visible');
                console.log("    Main content should now be visible.");
                if (backButton) backButton.style.pointerEvents = 'auto'; // Enable back button
            },
            onStart: () => { console.log("    Glitch Timeline playing..."); }
        });

        // ... (Glitch animation steps 1, 2, 3, 4 remain the same) ...
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
                 onStart: () => console.log("    Glitch: Scroll animation starting."),
                 onComplete: () => console.log("    Glitch: Scroll animation complete.")
             }, "<");

        console.log("    Glitch: Timeline setup complete.");
    }

     // --- Back Button Transition ---
     function transitionToEntranceScreen() {
         console.log(">>> Transitioning back to entrance START");
         if (backButton) backButton.style.pointerEvents = 'none';
         if (titleContainer) titleContainer.style.pointerEvents = 'none';
         closeMobileMenu();

         const backTl = gsap.timeline({
             onComplete: () => {
                 console.log(">>> Transition back to entrance COMPLETE");
                 // Re-enable title click only after animation is fully done
                 if (titleContainer) titleContainer.style.pointerEvents = 'auto';
             }
         });

         console.log("    BackTransition: Scrolling to top...");
         backTl.to(window, { duration: 0.8, scrollTo: { y: 0 }, ease: "power2.inOut",
             onComplete: () => console.log("    BackTransition: Scroll complete.")
         });

         backTl.call(() => {
             console.log("    BackTransition: Hiding main content, showing entrance.");
             mainContent.classList.remove('visible');
             entranceScreen.classList.remove('hidden');
             // Reset title to clean state immediately
             console.log("    BackTransition: Resetting title spans.");
             if (titleSpans) {
                 gsap.set(titleSpans, { clearProps: "all", color: initialTitleColor, opacity: 1 });
             } else { // Fallback
                 companyNameElement.innerHTML = '';
                 titleSpans = splitTextIntoSpans(companyNameElement);
                 if(titleSpans) gsap.set(titleSpans, { color: initialTitleColor, opacity: 1 });
             }
         }, null, ">-0.4");
     }

     // Fallback transition
     function transitionToMainContent_Fallback() {
         // ... (Fallback remains the same) ...
          console.warn("!!! Using fallback transition to main content!");
         const fallbackTl = gsap.timeline({
             onComplete: () => {
                 console.log("    Fallback Transition COMPLETE");
                 entranceScreen.classList.add('hidden');
                 mainContent.classList.add('visible');
                  if (backButton) backButton.style.pointerEvents = 'auto';
             }
         });
         fallbackTl.to(window, { duration: 1.0, scrollTo: { y: 0 }, ease: "power2.inOut" }, 0);
     }

    // --- Mobile Menu Logic ---
    // ... (openMobileMenu, closeMobileMenu, toggleMobileMenu remain the same) ...
     function openMobileMenu() {
        console.log("Opening mobile menu");
        body.classList.add('mobile-menu-open');
        mobileMenuButton.querySelector('i').classList.remove('fa-bars');
        mobileMenuButton.querySelector('i').classList.add('fa-times');
        gsap.to(mobileMenu, { right: 0, duration: 0.4, ease: 'power2.out' });
        gsap.to(mobileMenuOverlay, { autoAlpha: 1, duration: 0.4 });
        mobileMenuOverlay.style.pointerEvents = 'auto';
    }

    function closeMobileMenu() {
        if (!body.classList.contains('mobile-menu-open')) return;
        console.log("Closing mobile menu");
        body.classList.remove('mobile-menu-open');
        mobileMenuButton.querySelector('i').classList.remove('fa-times');
        mobileMenuButton.querySelector('i').classList.add('fa-bars');
        gsap.to(mobileMenu, { right: `-${mobileMenu.offsetWidth}px`, duration: 0.4, ease: 'power2.in' });
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
        console.log("-> Initializing page...");
        // entranceTimeline = gsap.timeline(); // Only needed if coordinating multiple entrance animations

        // Disable click initially
        if(titleContainer) titleContainer.style.pointerEvents = 'none';
        console.log("   Title container clicks disabled initially.");

        // Run particle animation. The onComplete callback will enable clicks.
        createParticleText(() => {
             // This code runs ONLY after particle animation completes
             if (titleContainer) {
                 titleContainer.style.pointerEvents = 'auto'; // Enable click
                 console.log("<- Particle text animation complete. Title container clicks ENABLED.");

                 // **Attach the click listener HERE**
                 if (!titleContainer.hasClickListener) { // Prevent adding multiple listeners
                     console.log("   Attaching click listener to title container.");
                     titleContainer.addEventListener('click', createGlitchTransition);
                     titleContainer.hasClickListener = true; // Mark as attached
                 }
             } else {
                 console.error("!!! Title container not found when trying to enable clicks!");
             }
        });

        // Set initial visual states
        gsap.set(mainContent, { display: 'flex', opacity: 0, visibility: 'hidden' });
        gsap.set(backButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuOverlay, { autoAlpha: 0, pointerEvents: 'none' });
        if (mobileMenu) gsap.set(mobileMenu, { right: '-300px' });

        // --- Event Listeners (Non-conditional ones) ---
        if (backButton) {
            backButton.addEventListener('click', transitionToEntranceScreen);
        } else { console.error("Back button not found!"); }

        if (mobileMenuButton) {
             mobileMenuButton.addEventListener('click', toggleMobileMenu);
        } else { console.error("Mobile menu button not found!"); }

        if (closeMenuBtn) {
             closeMenuBtn.addEventListener('click', closeMobileMenu);
        } else { console.error("Close menu button not found!"); }

        if (mobileMenuOverlay) {
             mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        } else { console.error("Mobile menu overlay not found!"); }

        // Mobile menu link clicks
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (body.classList.contains('mobile-menu-open')) {
                     closeMobileMenu();
                     gsap.delayedCall(0.2, () => { // Scroll after menu starts closing
                         if (targetSection) gsap.to(window, { duration: 0.8, scrollTo: { y: targetSection, offsetY: 80 }, ease: "power2.inOut"});
                     });
                } else {
                     if (targetSection) gsap.to(window, { duration: 0.8, scrollTo: { y: targetSection, offsetY: 80 }, ease: "power2.inOut"});
                }
            });
        });

         console.log("-> Initialization setup complete.");
    }
    init(); // Run initialization

}); // End DOMContentLoaded