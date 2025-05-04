document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    console.log("GeneScape Website Initializing...");

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
    const mainVideo = document.getElementById('mainVideo'); // Video in main section

    // --- Configuration ---
    const companyNameHTML = companyNameElement?.innerHTML || "GeneScape<span class='br-desktop-hide'><br></span>Technologies";
    const companyNameTextContent = "GeneScape Technologies";
    const initialTitleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-light-text').trim() || '#F5F5F5';
    const glitchColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#777'];

    let titleSpans = null; // Store character spans of the title

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }

    // Updated splitTextIntoSpans to handle potential HTML like <br>
    function splitTextIntoSpans(element) {
        if (!element) return null;
        const originalHTML = element.innerHTML; // Get potentially complex HTML
        element.innerHTML = ''; // Clear target element
        const charSpans = [];

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
                        charSpans.push(span);
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const clonedNode = node.cloneNode(false);
                element.appendChild(clonedNode);
                if (node.childNodes.length > 0) {
                    // If the original node had children (like the span containing <br>),
                    // we need to append the *original* children to the cloned node
                    // to preserve things like the <br> tag itself.
                     Array.from(node.childNodes).forEach(child => {
                         clonedNode.appendChild(child.cloneNode(true)); // Deep clone children
                     });
                     // We don't recurse further into these structural elements for splitting chars
                }
            }
        }
        Array.from(tempDiv.childNodes).forEach(child => processNode(child));
        return charSpans;
    }


    // --- Clean Title Entrance Animation ---
    function createTitleEntranceAnimation(onCompleteCallback) {
        titleSpans = splitTextIntoSpans(companyNameElement);
        if (!titleSpans) {
            console.error("Failed to split title for entrance animation.");
            companyNameElement.innerHTML = companyNameHTML; // Fallback
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
        tl.to(titleSpans, { opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: "power2.out" });
    }

    // --- Glitch Transition Logic ---
    function createGlitchTransition() {
        console.log("Glitch Transition START");
        if (titleContainer) titleContainer.style.pointerEvents = 'none';
        if (backButton) backButton.style.pointerEvents = 'none';

        const letters = titleSpans;
        if (!letters || letters.length === 0) {
            console.error("Glitch Error: titleSpans not available.");
            transitionToMainContent_Fallback(); return;
        }

        gsap.set(mainContent, { display: 'flex'}); // Ensure display is ready

        const glitchTl = gsap.timeline({
            onComplete: () => {
                console.log("Glitch Timeline COMPLETE");
                entranceScreen.classList.add('hidden');
                mainContent.classList.add('visible');
                body.classList.remove('no-scroll'); // Enable scrolling
                gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
                if (backButton) backButton.style.pointerEvents = 'auto';
                // Attempt to play main video
                if(mainVideo && mainVideo.paused) {
                    mainVideo.play().catch(e => console.warn("Main video autoplay failed:", e));
                }
            }
        });

        // Glitch steps
        glitchTl.to(entranceScreen, { duration: 0.05, filter: 'brightness(1.2)', yoyo: true, repeat: 2 })
            .to(letters, { duration: 0.05, opacity: 0.8, x: () => random(-6, 6), y: () => random(-4, 4), filter: 'blur(0.5px)', stagger: { amount: 0.25, from: "random" }, yoyo: true, repeat: 1 }, "<")
            .to(letters, { duration: 0.4, x: () => random(-20, 20), y: () => random(-12, 12), rotation: () => random(-8, 8), color: () => glitchColors[Math.floor(random(0, glitchColors.length))], opacity: () => random(0.4, 0.9), stagger: { amount: 0.45, from: "random" } }, "+=0.05")
            .to(letters, { duration: 0.5, opacity: 0, y: () => random(50, 120), filter: 'blur(5px)', stagger: { amount: 0.4, from: "center" }, ease: "power1.in" }, "-=0.15")
            // Scroll to the main content section itself (top of viewport)
            .to(window, { duration: 1.1, scrollTo: { y: mainContent }, ease: "power2.inOut" }, "<");
    }

     // --- Back Button Transition ---
     function transitionToEntranceScreen() {
         console.log("Transitioning back to entrance START");
         body.classList.add('no-scroll'); // Disable scrolling
         if (backButton) backButton.style.pointerEvents = 'none';
         if (titleContainer) titleContainer.style.pointerEvents = 'none';
         closeMobileMenu();
         if(mainVideo) mainVideo.pause(); // Pause video

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
             // Reset title by restoring original HTML, then re-splitting
             companyNameElement.innerHTML = companyNameHTML;
             titleSpans = splitTextIntoSpans(companyNameElement);
             if(titleSpans) gsap.set(titleSpans, { color: initialTitleColor, opacity: 1 });

         }, null, ">-0.4");
     }

     // Fallback transition
     function transitionToMainContent_Fallback() {
         console.warn("Using fallback transition!");
         const fallbackTl = gsap.timeline({
             onComplete: () => {
                 entranceScreen.classList.add('hidden');
                 mainContent.classList.add('visible');
                 gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
                 body.classList.remove('no-scroll');
                 if (backButton) backButton.style.pointerEvents = 'auto';
                 if(mainVideo && mainVideo.paused) mainVideo.play().catch(e => console.warn("Main video autoplay failed:", e));
             }
         });
         gsap.set(mainContent, { display: 'flex'});
         fallbackTl.to(window, { duration: 1.0, scrollTo: { y: mainContent }, ease: "power2.inOut" }, 0);
     }

    // --- Mobile Menu Logic ---
    function openMobileMenu() {
        body.classList.add('mobile-menu-open');
        mobileMenuButton.querySelector('i').classList.remove('fa-bars');
        mobileMenuButton.querySelector('i').classList.add('fa-times');
        gsap.to(mobileMenu, { right: 0, duration: 0.4, ease: 'power2.out' });
        gsap.to(mobileMenuOverlay, { autoAlpha: 1, duration: 0.4 });
        mobileMenuOverlay.style.pointerEvents = 'auto';
    }
    function closeMobileMenu() {
        if (!body.classList.contains('mobile-menu-open')) return;
        body.classList.remove('mobile-menu-open');
        mobileMenuButton.querySelector('i').classList.remove('fa-times');
        mobileMenuButton.querySelector('i').classList.add('fa-bars');
        gsap.to(mobileMenu, { right: `-${mobileMenu.offsetWidth}px`, duration: 0.4, ease: 'power2.in' });
        gsap.to(mobileMenuOverlay, { autoAlpha: 0, duration: 0.4 });
        mobileMenuOverlay.style.pointerEvents = 'none';
    }
    function toggleMobileMenu() {
        if (body.classList.contains('mobile-menu-open')) { closeMobileMenu(); }
        else { openMobileMenu(); }
    }

    // --- Initialization Function ---
    function init() {
        console.log("Initializing page...");
        body.classList.add('no-scroll'); // Start scroll locked
        if(titleContainer) titleContainer.style.pointerEvents = 'none';

        // Set initial visual states
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
                 console.log("Title clicks ENABLED."); // Simplified log
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

        // Mobile menu link clicks
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (body.classList.contains('mobile-menu-open')) {
                     closeMobileMenu();
                     gsap.delayedCall(0.2, () => {
                         if (targetSection) {
                             const headerHeight = document.querySelector('.main-header')?.offsetHeight || 70;
                             gsap.to(window, { duration: 0.8, scrollTo: { y: targetSection, offsetY: headerHeight + 20 }, ease: "power2.inOut"});
                         }
                     });
                } else {
                     if (targetSection) {
                          const headerHeight = document.querySelector('.main-header')?.offsetHeight || 70;
                          gsap.to(window, { duration: 0.8, scrollTo: { y: targetSection, offsetY: headerHeight + 20 }, ease: "power2.inOut"});
                     }
                }
            });
        });

         console.log("Initialization setup complete."); // Simplified log
    }
    init(); // Run initialization

}); // End DOMContentLoaded