document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    console.log("GeneScape Website Initializing (Final Polish)...");

    // --- Selectors ---
    const body = document.body; // Select body for scroll lock
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

    // --- Configuration ---
    const companyNameText = "GeneScape Technologies";
    // ** CORRECTED initial title color variable **
    const initialTitleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-light-text').trim() || '#F5F5F5';
    const glitchColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#777'];

    let titleSpans = null;

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }

    function splitTextIntoSpans(element) {
        if (!element) return null;
        element.textContent = companyNameText;
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

    // --- Clean Title Entrance Animation ---
    function createTitleEntranceAnimation(onCompleteCallback) {
        console.log("-> Starting createTitleEntranceAnimation...");
        titleSpans = splitTextIntoSpans(companyNameElement);
        if (!titleSpans) {
            console.error("!!! Failed to split title for entrance animation.");
            companyNameElement.textContent = companyNameText;
            if (typeof onCompleteCallback === 'function') onCompleteCallback();
            return;
        }
        console.log("   Title split into spans.");

        gsap.set(titleSpans, { opacity: 0, y: 30 });

        const tl = gsap.timeline({
            delay: 0.5,
            onComplete: () => {
                console.log("<- Title entrance animation complete.");
                gsap.set(titleSpans, { color: initialTitleColor, opacity: 1, y: 0, clearProps: "filter, rotation, x" });
                if (typeof onCompleteCallback === 'function') {
                    console.log("   Executing onCompleteCallback (enabling click).");
                    onCompleteCallback();
                }
            }
        });

        tl.to(titleSpans, {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: "power2.out"
        });
        console.log("   Title entrance timeline created.");
    }


    // --- Glitch Transition Logic ---
    function createGlitchTransition() {
        console.log(">>> Glitch Transition START");
        if (titleContainer) titleContainer.style.pointerEvents = 'none';
        if (backButton) backButton.style.pointerEvents = 'none';

        const letters = titleSpans;
        if (!letters || letters.length === 0) {
            console.error("!!! Glitch Error: titleSpans not available when transition called.");
            transitionToMainContent_Fallback(); return;
        }
        console.log(`    Glitch: Acquired ${letters.length} title spans.`);

        // ** Ensure main content is display:flex BEFORE timeline starts **
        gsap.set(mainContent, { display: 'flex'});
        console.log("    Glitch: Set main-content display to flex.");

        const glitchTl = gsap.timeline({
            onComplete: () => {
                console.log(">>> Glitch Timeline COMPLETE");
                entranceScreen.classList.add('hidden');
                mainContent.classList.add('visible');
                body.classList.remove('no-scroll'); // ** Enable scrolling **
                console.log("    Body scroll enabled.");
                gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
                console.log("    Main content should now be visible.");
                if (backButton) backButton.style.pointerEvents = 'auto';
            },
            onStart: () => { console.log("    Glitch Timeline playing..."); }
        });

        // ... (Glitch steps 1, 2, 3, 4 remain the same) ...
        // 1. Initial flash/scramble
        glitchTl.to(entranceScreen, { duration: 0.05, filter: 'brightness(1.2)', yoyo: true, repeat: 2 })
            .to(letters, { duration: 0.05, opacity: 0.8, x: () => random(-6, 6), y: () => random(-4, 4), filter: 'blur(0.5px)', stagger: { amount: 0.25, from: "random" }, yoyo: true, repeat: 1 }, "<");
        // 2. Intense glitch
        glitchTl.to(letters, { duration: 0.4, x: () => random(-20, 20), y: () => random(-12, 12), rotation: () => random(-8, 8), color: () => glitchColors[Math.floor(random(0, glitchColors.length))], opacity: () => random(0.4, 0.9), stagger: { amount: 0.45, from: "random" } }, "+=0.05");
        // 3. Disintegration & Scroll
        glitchTl.to(letters, { duration: 0.5, opacity: 0, y: () => random(50, 120), filter: 'blur(5px)', stagger: { amount: 0.4, from: "center" }, ease: "power1.in" }, "-=0.15")
             .to(window, { duration: 1.1, scrollTo: { y: 0 }, ease: "power2.inOut", onStart: () => console.log("    Glitch: Scroll animation starting."), onComplete: () => console.log("    Glitch: Scroll animation complete.") }, "<");

        console.log("    Glitch: Timeline setup complete.");
    }

     // --- Back Button Transition ---
     function transitionToEntranceScreen() {
         console.log(">>> Transitioning back to entrance START");
         body.classList.add('no-scroll'); // ** Disable scrolling **
         console.log("    Body scroll disabled.");
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
             console.log("    BackTransition: Resetting title spans.");
             if (titleSpans) {
                 // ** Ensure reset uses CORRECT light color **
                 gsap.set(titleSpans, { clearProps: "all", color: initialTitleColor, opacity: 1 });
             } else {
                 companyNameElement.textContent = companyNameText;
                 gsap.set(companyNameElement, { color: initialTitleColor, opacity: 1 });
             }
         }, null, ">-0.4");
     }

     // Fallback transition
     function transitionToMainContent_Fallback() {
         console.warn("!!! Using fallback transition to main content!");
         const fallbackTl = gsap.timeline({
             onComplete: () => {
                 console.log("    Fallback Transition COMPLETE");
                 entranceScreen.classList.add('hidden');
                 mainContent.classList.add('visible');
                 gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
                 body.classList.remove('no-scroll'); // ** Enable scrolling **
                 if (backButton) backButton.style.pointerEvents = 'auto';
             }
         });
         gsap.set(mainContent, { display: 'flex'}); // Ensure display before scroll
         fallbackTl.to(window, { duration: 1.0, scrollTo: { y: 0 }, ease: "power2.inOut" }, 0);
     }

    // --- Mobile Menu Logic ---
    // ... (Mobile menu functions remain the same) ...
    function openMobileMenu() { /* ... */ }
    function closeMobileMenu() { /* ... */ }
    function toggleMobileMenu() { /* ... */ }

    // --- Initialization Function ---
    function init() {
        console.log("-> Initializing page...");
        body.classList.add('no-scroll'); // ** Start with scroll disabled **
        if(titleContainer) titleContainer.style.pointerEvents = 'none';
        console.log("   Title container clicks disabled initially.");

        // Set initial visual states
        gsap.set(entranceScreen, { opacity: 1, visibility: 'visible' });
        gsap.set(mainContent, { display: 'flex', opacity: 0, visibility: 'hidden' });
        gsap.set(backButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuOverlay, { autoAlpha: 0, pointerEvents: 'none' });
        if (mobileMenu) gsap.set(mobileMenu, { right: '-300px' });

        createTitleEntranceAnimation(() => { // Enable click after animation
             if (titleContainer) {
                 titleContainer.style.pointerEvents = 'auto';
                 console.log("<- Title entrance animation complete. Title container clicks ENABLED.");
                 if (!titleContainer.hasClickListener) {
                     console.log("   Attaching click listener to title container.");
                     titleContainer.addEventListener('click', createGlitchTransition);
                     titleContainer.hasClickListener = true;
                 }
             } else { console.error("!!! Title container not found when trying to enable clicks!"); }
        });

        // --- Event Listeners ---
        if (backButton) backButton.addEventListener('click', transitionToEntranceScreen);
        else console.error("Back button not found!");
        if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
        else console.error("Mobile menu button not found!");
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
        else console.error("Close menu button not found!");
        if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        else console.error("Mobile menu overlay not found!");
        mobileMenuLinks.forEach(link => { link.addEventListener('click', function(e) { /* ... scroll logic ... */ }); });

         console.log("-> Initialization setup complete.");
    }
    init();

}); // End DOMContentLoaded