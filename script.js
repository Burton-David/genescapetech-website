document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    // console.log("GeneScape Website Initializing..."); // Removed log

    // --- Selectors ---
    const body = document.body;
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
    const mainHeader = document.querySelector('.main-header'); // Selector for header height

    // --- Configuration ---
    // Use the HTML structure directly where needed, text content for fallbacks/labels
    const companyNameHTML = "GeneScape<span class='br-desktop-hide'><br></span>Technologies";
    const companyNameTextContent = "GeneScape Technologies";
    const initialTitleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-light-text').trim() || '#F5F5F5';
    const glitchColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#BB9671', '#777']; // Added tan

    let titleSpans = null;

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }

    // ** Corrected splitTextIntoSpans to handle existing HTML **
    function splitTextIntoSpans(element) {
        if (!element) return null;
        const originalHTML = element.innerHTML; // Get current HTML (might contain the <br>)
        element.innerHTML = ''; // Clear element
        const spans = [];

        // Use a temporary element to parse the original HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;

        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.nodeValue.trim().length > 0) {
                    node.nodeValue.split('').forEach(char => {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.style.display = 'inline-block';
                        span.style.position = 'relative';
                        span.style.minWidth = (char === ' ') ? '0.25em' : 'auto';
                        element.appendChild(span);
                        spans.push(span);
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Clone the element (like <br> or the span containing it) and append
                const clonedNode = node.cloneNode(true); // Clone with children if any
                element.appendChild(clonedNode);
                 // If the cloned node is the one hiding the BR, we don't need to recurse
                 // If it was a different wrapper, we might need to:
                 // for (let child of node.childNodes) { processNode(child); }
            }
        }

        // Process the nodes from the temporary container
        Array.from(tempDiv.childNodes).forEach(processNode);

        // Filter out non-character spans if necessary (like the br wrapper)
        // This assumes character spans are direct children OR we adjust logic
        // For simplicity, let's assume the direct children that aren't the BR wrapper are the char spans
        // Or better: return only spans with single character content?
        return Array.from(element.childNodes).filter(node => node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN' && node.textContent.length === 1);
    }


    // --- Clean Title Entrance Animation ---
    function createTitleEntranceAnimation(onCompleteCallback) {
        titleSpans = splitTextIntoSpans(companyNameElement);
        if (!titleSpans || titleSpans.length === 0) { // Check length too
            console.error("Failed to split title for entrance animation.");
            companyNameElement.innerHTML = companyNameHTML; // Fallback to raw HTML
            if (typeof onCompleteCallback === 'function') onCompleteCallback();
            return;
        }

        gsap.set(titleSpans, { opacity: 0, y: 30 });

        const tl = gsap.timeline({
            delay: 0.5,
            onComplete: () => {
                gsap.set(titleSpans, { color: initialTitleColor, opacity: 1, y: 0, clearProps: "filter, rotation, x" });
                if (typeof onCompleteCallback === 'function') onCompleteCallback();
            }
        });

        tl.to(titleSpans, {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: "power2.out"
        });
    }

    // --- Glitch Transition Logic ---
    function createGlitchTransition() {
        // console.log("Glitch Transition START"); // Keep logs minimal
        if (titleContainer) titleContainer.style.pointerEvents = 'none';
        if (backButton) backButton.style.pointerEvents = 'none';

        const letters = titleSpans;
        if (!letters || letters.length === 0) {
            console.error("Glitch Error: titleSpans not available.");
            transitionToMainContent_Fallback(); return;
        }

        gsap.set(mainContent, { display: 'flex'});

        const glitchTl = gsap.timeline({
            onComplete: () => {
                // console.log("Glitch Timeline COMPLETE"); // Keep logs minimal
                entranceScreen.classList.add('hidden');
                mainContent.classList.add('visible');
                body.classList.remove('no-scroll');
                gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
                if (backButton) backButton.style.pointerEvents = 'auto';
            }
        });

        // Glitch steps
        glitchTl.to(entranceScreen, { duration: 0.05, filter: 'brightness(1.2)', yoyo: true, repeat: 2 })
            .to(letters, { duration: 0.05, opacity: 0.8, x: () => random(-6, 6), y: () => random(-4, 4), filter: 'blur(0.5px)', stagger: { amount: 0.25, from: "random" }, yoyo: true, repeat: 1 }, "<")
            .to(letters, { duration: 0.4, x: () => random(-20, 20), y: () => random(-12, 12), rotation: () => random(-8, 8), color: () => glitchColors[Math.floor(random(0, glitchColors.length))], opacity: () => random(0.4, 0.9), stagger: { amount: 0.45, from: "random" } }, "+=0.05")
            .to(letters, { duration: 0.45, opacity: 0, y: () => random(50, 120), filter: 'blur(5px)', stagger: { amount: 0.35, from: "center" }, ease: "power2.in" }, "-=0.15") // Refined ease
            .to(window, { duration: 1.1, scrollTo: { y: 0 }, ease: "sine.inOut" }, "<"); // Refined ease
    }

     // --- Back Button Transition ---
     function transitionToEntranceScreen() {
         // console.log("Transitioning back to entrance START"); // Keep logs minimal
         body.classList.add('no-scroll');
         if (backButton) backButton.style.pointerEvents = 'none';
         if (titleContainer) titleContainer.style.pointerEvents = 'none';
         closeMobileMenu();

         const backTl = gsap.timeline({
             onComplete: () => {
                 // console.log("Transition back to entrance COMPLETE"); // Keep logs minimal
                 if (titleContainer) titleContainer.style.pointerEvents = 'auto';
             }
         });

         backTl.to(window, { duration: 0.8, scrollTo: { y: 0 }, ease: "power2.inOut" });

         backTl.call(() => {
             mainContent.classList.remove('visible');
             entranceScreen.classList.remove('hidden');
             // Reset title using the original HTML structure
             companyNameElement.innerHTML = companyNameHTML;
             titleSpans = splitTextIntoSpans(companyNameElement); // Re-split for future use
             if(titleSpans) gsap.set(titleSpans, { color: initialTitleColor, opacity: 1 });

         }, null, ">-0.4");
     }

     // Fallback transition
     function transitionToMainContent_Fallback() { /* ... (remains same) ... */ }

    // --- Mobile Menu Logic ---
    function openMobileMenu() { body.classList.add('mobile-menu-open'); mobileMenuButton.querySelector('i').classList.remove('fa-bars'); mobileMenuButton.querySelector('i').classList.add('fa-times'); gsap.to(mobileMenu, { right: 0, duration: 0.4, ease: 'power2.out' }); gsap.to(mobileMenuOverlay, { autoAlpha: 1, duration: 0.4 }); mobileMenuOverlay.style.pointerEvents = 'auto'; }
    function closeMobileMenu() { if (!body.classList.contains('mobile-menu-open')) return; body.classList.remove('mobile-menu-open'); mobileMenuButton.querySelector('i').classList.remove('fa-times'); mobileMenuButton.querySelector('i').classList.add('fa-bars'); gsap.to(mobileMenu, { right: `-${mobileMenu.offsetWidth}px`, duration: 0.4, ease: 'power2.in' }); gsap.to(mobileMenuOverlay, { autoAlpha: 0, duration: 0.4 }); mobileMenuOverlay.style.pointerEvents = 'none'; }
    function toggleMobileMenu() { if (body.classList.contains('mobile-menu-open')) { closeMobileMenu(); } else { openMobileMenu(); } }

    // --- Initialization Function ---
    function init() {
        body.classList.add('no-scroll');
        if(titleContainer) titleContainer.style.pointerEvents = 'none';

        // Set initial states
        gsap.set(entranceScreen, { opacity: 1, visibility: 'visible' });
        gsap.set(mainContent, { display: 'flex', opacity: 0, visibility: 'hidden' });
        gsap.set(backButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuOverlay, { autoAlpha: 0, pointerEvents: 'none' });
        if (mobileMenu) gsap.set(mobileMenu, { right: '-300px' });

        // Set aria-label correctly
        if(companyNameElement) companyNameElement.setAttribute('aria-label', companyNameTextContent);

        // Run entrance animation, enable clicks on completion
        createTitleEntranceAnimation(() => {
             if (titleContainer) {
                 titleContainer.style.pointerEvents = 'auto';
                 if (!titleContainer.hasClickListener) {
                     titleContainer.addEventListener('click', createGlitchTransition);
                     titleContainer.hasClickListener = true;
                 }
             } else { console.error("Title container not found!"); }
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

        // Mobile menu link clicks with dynamic offset
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                const headerHeight = mainHeader?.offsetHeight || 70; // Get current header height or default
                const scrollOffset = headerHeight + 20; // Add buffer

                if (body.classList.contains('mobile-menu-open')) {
                     closeMobileMenu();
                     gsap.delayedCall(0.2, () => { // Scroll after menu starts closing
                         if (targetSection) gsap.to(window, { duration: 0.8, scrollTo: { y: targetSection, offsetY: scrollOffset }, ease: "power2.inOut"});
                     });
                } else {
                     if (targetSection) gsap.to(window, { duration: 0.8, scrollTo: { y: targetSection, offsetY: scrollOffset }, ease: "power2.inOut"});
                }
            });
        });

         console.log("Initialization complete."); // Keep final log
    }
    init();

}); // End DOMContentLoaded