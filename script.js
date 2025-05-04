document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    console.log("GeneScape Website Initializing..."); // Simplified log

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

    // --- Configuration ---
    const companyNameHTML = companyNameElement?.innerHTML || "GeneScape Technologies"; // Get initial HTML or fallback
    const companyNameTextContent = companyNameElement?.textContent.replace(/\s+/g, ' ').trim() || "GeneScape Technologies";
    const initialTitleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-light-text').trim() || '#F5F5F5';
    const glitchColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#777'];

    let titleSpans = null; // Store only character spans

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }

    // ** UPDATED splitTextIntoSpans to handle HTML **
    function splitTextIntoSpans(element) {
        if (!element) return null;
        const originalHTML = element.innerHTML; // Keep original structure with <br> etc.
        element.innerHTML = ''; // Clear target element
        const charSpans = []; // Array to store only the character spans

        // Use a temporary element to parse the original HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;

        // Recursive function to process nodes
        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                // If it's a text node, wrap each character in a span
                if (node.nodeValue.trim().length > 0) {
                    node.nodeValue.split('').forEach(char => {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.style.display = 'inline-block';
                        span.style.position = 'relative';
                         // Add space width check back if needed, but inline-block usually handles it
                        span.style.minWidth = (char === ' ') ? '0.25em' : 'auto';
                        element.appendChild(span); // Append char span to the actual element
                        charSpans.push(span); // Store reference to the char span
                    });
                } else {
                     // Keep whitespace nodes if necessary for layout? Or ignore?
                     // Let's ignore pure whitespace nodes for simplicity now.
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // If it's an element node (like <br> or the span containing it), clone it and process its children
                const clonedNode = node.cloneNode(false); // Clone the tag itself (e.g., <span class="br-desktop-hide">)
                element.appendChild(clonedNode); // Append the cloned tag to the actual element
                // If the cloned node should contain children (like the <br>), add them
                if (node.childNodes.length > 0) {
                     for (let child of node.childNodes) {
                         // Important: Append children to the *cloned* node, not the main element again
                         clonedNode.appendChild(child.cloneNode(true)); // Clone children deeply for tags like <br>
                     }
                }
                 // We don't add container elements like the span containing <br> to charSpans
            }
        }

        // Start processing from the children of the temporary element
        // Note: We iterate through childNodes of tempDiv as innerHTML might wrap content
        Array.from(tempDiv.childNodes).forEach(child => processNode(child));

        return charSpans; // Return only the array of character spans
    }


    // --- Clean Title Entrance Animation ---
    function createTitleEntranceAnimation(onCompleteCallback) {
        titleSpans = splitTextIntoSpans(companyNameElement); // Now correctly handles HTML
        if (!titleSpans) {
            console.error("Failed to split title for entrance animation.");
            companyNameElement.innerHTML = companyNameHTML; // Fallback
            if (typeof onCompleteCallback === 'function') onCompleteCallback();
            return;
        }
        gsap.set(titleSpans, { opacity: 0, y: 30 }); // Set initial state only on char spans

        const tl = gsap.timeline({
            delay: 0.5,
            onComplete: () => {
                // Set final state on char spans
                gsap.set(titleSpans, { color: initialTitleColor, opacity: 1, y: 0, clearProps: "filter, rotation, x" });
                if (typeof onCompleteCallback === 'function') onCompleteCallback();
            }
        });
        // Animate only the character spans
        tl.to(titleSpans, { opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: "power2.out" });
    }


    // --- Glitch Transition Logic ---
    function createGlitchTransition() {
        console.log("Glitch Transition START");
        if (titleContainer) titleContainer.style.pointerEvents = 'none';
        if (backButton) backButton.style.pointerEvents = 'none';

        const letters = titleSpans; // Use stored character spans
        if (!letters || letters.length === 0) {
            console.error("Glitch Error: titleSpans not available.");
            transitionToMainContent_Fallback(); return;
        }

        gsap.set(mainContent, { display: 'flex'});

        const glitchTl = gsap.timeline({
            onComplete: () => {
                console.log("Glitch Timeline COMPLETE");
                entranceScreen.classList.add('hidden');
                mainContent.classList.add('visible');
                body.classList.remove('no-scroll');
                gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
                if (backButton) backButton.style.pointerEvents = 'auto';
            }
        });

        // Glitch animations target only the character spans ('letters')
        glitchTl.to(entranceScreen, { duration: 0.05, filter: 'brightness(1.2)', yoyo: true, repeat: 2 })
            .to(letters, { duration: 0.05, opacity: 0.8, x: () => random(-6, 6), y: () => random(-4, 4), filter: 'blur(0.5px)', stagger: { amount: 0.25, from: "random" }, yoyo: true, repeat: 1 }, "<")
            .to(letters, { duration: 0.4, x: () => random(-20, 20), y: () => random(-12, 12), rotation: () => random(-8, 8), color: () => glitchColors[Math.floor(random(0, glitchColors.length))], opacity: () => random(0.4, 0.9), stagger: { amount: 0.45, from: "random" } }, "+=0.05")
            .to(letters, { duration: 0.5, opacity: 0, y: () => random(50, 120), filter: 'blur(5px)', stagger: { amount: 0.4, from: "center" }, ease: "power1.in" }, "-=0.15")
            .to(window, { duration: 1.1, scrollTo: { y: 0 }, ease: "power2.inOut" }, "<");
    }

     // --- Back Button Transition ---
     function transitionToEntranceScreen() {
         console.log("Transitioning back to entrance START");
         body.classList.add('no-scroll');
         if (backButton) backButton.style.pointerEvents = 'none';
         if (titleContainer) titleContainer.style.pointerEvents = 'none';
         closeMobileMenu();

         const backTl = gsap.timeline({
             onComplete: () => {
                 console.log("Transition back to entrance COMPLETE");
                 if (titleContainer) titleContainer.style.pointerEvents = 'auto';
             }
         });

         backTl.to(window, { duration: 0.8, scrollTo: { y: 0 }, ease: "power2.inOut" });

         backTl.call(() => {
             mainContent.classList.remove('visible');
             entranceScreen.classList.remove('hidden');
             // Reset title by restoring original HTML, then re-splitting for state
             companyNameElement.innerHTML = companyNameHTML;
             titleSpans = splitTextIntoSpans(companyNameElement); // Re-split
             if(titleSpans) gsap.set(titleSpans, { color: initialTitleColor, opacity: 1 }); // Ensure clean visual state

         }, null, ">-0.4");
     }

     // Fallback transition
     function transitionToMainContent_Fallback() { /* ... (remains same) ... */ }

    // --- Mobile Menu Logic ---
    function openMobileMenu() { /* ... (remains same) ... */ }
    function closeMobileMenu() { /* ... (remains same) ... */ }
    function toggleMobileMenu() { /* ... (remains same) ... */ }

    // --- Initialization Function ---
    function init() {
        console.log("Initializing page...");
        body.classList.add('no-scroll');
        if(titleContainer) titleContainer.style.pointerEvents = 'none';

        // Set initial states
        gsap.set(entranceScreen, { opacity: 1, visibility: 'visible' });
        gsap.set(mainContent, { display: 'flex', opacity: 0, visibility: 'hidden' });
        gsap.set(backButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuButton, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(mobileMenuOverlay, { autoAlpha: 0, pointerEvents: 'none' });
        if (mobileMenu) gsap.set(mobileMenu, { right: '-300px' });

        // Set aria-label correctly initially
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
        mobileMenuLinks.forEach(link => { link.addEventListener('click', function(e) { /* ... scroll logic ... */ }); });

         console.log("Initialization setup complete.");
    }
    init();

}); // End DOMContentLoaded