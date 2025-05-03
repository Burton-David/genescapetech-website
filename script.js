document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    console.log("GeneScape Website Initializing (New Entrance Animation)...");

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
    const initialTitleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-title-initial').trim() || '#C9AB7C';
    const glitchColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#777'];

    let titleSpans = null; // Store split title spans

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }

    function splitTextIntoSpans(element) {
        if (!element) return null;
        // Set text content first before splitting
        element.textContent = companyNameText;
        const text = element.textContent.trim();
        element.innerHTML = '';
        const spans = [];
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block'; // Crucial for transforms
            span.style.position = 'relative';
            span.style.minWidth = (char === ' ') ? '0.25em' : 'auto';
            element.appendChild(span);
            spans.push(span);
        });
        return spans;
    }

    // --- NEW: Clean Title Entrance Animation ---
    function createTitleEntranceAnimation(onCompleteCallback) {
        console.log("-> Starting createTitleEntranceAnimation...");
        // 1. Split text into spans immediately
        titleSpans = splitTextIntoSpans(companyNameElement);
        if (!titleSpans) {
            console.error("!!! Failed to split title for entrance animation.");
            companyNameElement.textContent = companyNameText; // Fallback to plain text
            if (typeof onCompleteCallback === 'function') onCompleteCallback();
            return;
        }
        console.log("   Title split into spans.");

        // 2. Set initial state (invisible and slightly offset)
        gsap.set(titleSpans, {
            opacity: 0,
            y: 30, // Start slightly below final position
            // rotationX: -45, // Optional 3D effect
            // x: () => random(-10, 10) // Optional slight horizontal variance
        });

        // 3. Create GSAP timeline to animate them in
        const tl = gsap.timeline({
            delay: 0.5, // Overall delay before animation starts
            onComplete: () => {
                console.log("<- Title entrance animation complete.");
                if (typeof onCompleteCallback === 'function') {
                    console.log("   Executing onCompleteCallback (enabling click).");
                    onCompleteCallback(); // Execute the callback passed from init
                }
            }
        });

        // Animate each letter
        tl.to(titleSpans, {
            opacity: 1,
            y: 0, // Move to final vertical position
            // rotationX: 0,
            // x: 0,
            duration: 0.8, // Duration of individual letter animation
            stagger: 0.04, // Delay between each letter starting
            ease: "power2.out" // Smooth easing
        });

        console.log("   Title entrance timeline created.");
    }

    // --- REMOVED Particle Animation ---

    // --- Glitch Transition Logic ---
    function createGlitchTransition() {
        // ... (Glitch function remains largely the same, but relies on titleSpans being set) ...
        console.log(">>> Glitch Transition START");
        if (titleContainer) titleContainer.style.pointerEvents = 'none';
        if (backButton) backButton.style.pointerEvents = 'none';

        const letters = titleSpans; // Use the globally stored spans

        if (!letters || letters.length === 0) {
            console.error("!!! Glitch Error: titleSpans not available when transition called.");
            transitionToMainContent_Fallback(); return;
        }
        console.log(`    Glitch: Acquired ${letters.length} title spans.`);

        const glitchTl = gsap.timeline({
            onComplete: () => {
                console.log(">>> Glitch Timeline COMPLETE");
                entranceScreen.classList.add('hidden');
                mainContent.classList.add('visible'); // Add visible class
                 gsap.set(mainContent, { opacity: 1, visibility: 'visible' }); // Ensure final state
                console.log("    Main content should now be visible.");
                if (backButton) backButton.style.pointerEvents = 'auto';
            },
            onStart: () => { console.log("    Glitch Timeline playing..."); }
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
             .to(window, {
                 duration: 1.1, scrollTo: { y: 0 }, ease: "power2.inOut",
                 onStart: () => console.log("    Glitch: Scroll animation starting."),
                 onComplete: () => console.log("    Glitch: Scroll animation complete.")
             }, "<");

        console.log("    Glitch: Timeline setup complete.");
    }

     // --- Back Button Transition ---
     function transitionToEntranceScreen() {
        // ... (Back transition remains the same, but relies on titleSpans) ...
         console.log(">>> Transitioning back to entrance START");
         if (backButton) backButton.style.pointerEvents = 'none';
         if (titleContainer) titleContainer.style.pointerEvents = 'none';
         closeMobileMenu();

         const backTl = gsap.timeline({
             onComplete: () => {
                 console.log(">>> Transition back to entrance COMPLETE");
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
             // Reset title to clean state immediately using stored spans
             console.log("    BackTransition: Resetting title spans.");
             if (titleSpans) {
                 gsap.set(titleSpans, { clearProps: "all", color: initialTitleColor, opacity: 1 });
             } else { // Should not happen if init worked, but fallback
                 companyNameElement.textContent = companyNameText; // Just set text
                 gsap.set(companyNameElement, { color: initialTitleColor, opacity: 1 });
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
                 gsap.set(mainContent, { opacity: 1, visibility: 'visible' }); // Ensure final state
                 if (backButton) backButton.style.pointerEvents = 'auto';
             }
         });
         fallbackTl.to(window, { duration: 1.0, scrollTo: { y: 0 }, ease: "power2.inOut" }, 0);
     }

    // --- Mobile Menu Logic ---
    // ... (Mobile menu functions remain the same) ...
    function openMobileMenu() { console.log("Opening mobile menu"); body.classList.add('mobile-menu-open'); mobileMenuButton.querySelector('i').classList.remove('fa-bars'); mobileMenuButton.querySelector('i').classList.add('fa-times'); gsap.to(mobileMenu, { right: 0, duration: 0.4, ease: 'power2.out' }); gsap.to(mobileMenuOverlay, { autoAlpha: 1, duration: 0.4 }); mobileMenuOverlay.style.pointerEvents = 'auto'; }
    function closeMobileMenu() { if (!body.classList.contains('mobile-menu-open')) return; console.log("Closing mobile menu"); body.classList.remove('mobile-menu-open'); mobileMenuButton.querySelector('i').classList.remove('fa-times'); mobileMenuButton.querySelector('i').classList.add('fa-bars'); gsap.to(mobileMenu, { right: `-${mobileMenu.offsetWidth}px`, duration: 0.4, ease: 'power2.in' }); gsap.to(mobileMenuOverlay, { autoAlpha: 0, duration: 0.4 }); mobileMenuOverlay.style.pointerEvents = 'none'; }
    function toggleMobileMenu() { if (body.classList.contains('mobile-menu-open')) { closeMobileMenu(); } else { openMobileMenu(); } }


    // --- Initialization Function ---
    function init() {
        console.log("-> Initializing page...");
        // entranceTimeline = gsap.timeline(); // Not strictly needed now

        // Disable click initially
        if(titleContainer) titleContainer.style.pointerEvents = 'none';
        console.log("   Title container clicks disabled initially.");

        // Set initial visual states CORRECTLY
        // Entrance screen should be visible
        gsap.set(entranceScreen, { opacity: 1, visibility: 'visible' });
        // Main content should be display:flex (for layout calc) but visually hidden
        gsap.set(mainContent, { display: 'flex', opacity: 0, visibility: 'hidden' });
        // Nav buttons hidden
        gsap.set(backButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuOverlay, { autoAlpha: 0, pointerEvents: 'none' });
        if (mobileMenu) gsap.set(mobileMenu, { right: '-300px' });


        // Run the NEW entrance animation. Enable clicks on completion.
        createTitleEntranceAnimation(() => {
             if (titleContainer) {
                 titleContainer.style.pointerEvents = 'auto'; // Enable click
                 console.log("<- Title entrance animation complete. Title container clicks ENABLED.");

                 // Attach the click listener HERE
                 if (!titleContainer.hasClickListener) {
                     console.log("   Attaching click listener to title container.");
                     titleContainer.addEventListener('click', createGlitchTransition);
                     titleContainer.hasClickListener = true;
                 }
             } else {
                 console.error("!!! Title container not found when trying to enable clicks!");
             }
        });


        // --- Event Listeners (Non-conditional ones) ---
        if (backButton) backButton.addEventListener('click', transitionToEntranceScreen);
        else console.error("Back button not found!");

        if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
        else console.error("Mobile menu button not found!");

        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
        else console.error("Close menu button not found!");

        if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        else console.error("Mobile menu overlay not found!");

        // Mobile menu link clicks
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (body.classList.contains('mobile-menu-open')) {
                     closeMobileMenu();
                     gsap.delayedCall(0.2, () => {
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