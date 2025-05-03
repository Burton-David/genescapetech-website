document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    console.log("GeneScape Website Initializing (Award Pass)...");

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
    const backgroundImages = document.querySelectorAll('.background-image'); // For parallax
    const body = document.body; // For toggling menu class

    // --- Configuration ---
    const companyNameText = "GeneScape Technologies";
    const particleCount = 70; // Slightly fewer
    const initialTitleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-title-initial').trim() || '#C9AB7C';
    const glitchColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#777']; // Palette for glitch

    let entranceTimeline;
    let titleSpans = null; // Store split title spans

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }
    const entranceColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#E6C38C', '#BB9671'];

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
        const tempContainer = document.createElement('div'); // Use temp container
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.position = 'absolute';
        tempContainer.style.fontFamily = getComputedStyle(companyNameElement).fontFamily;
        tempContainer.style.fontSize = getComputedStyle(companyNameElement).fontSize;
        tempContainer.style.fontWeight = getComputedStyle(companyNameElement).fontWeight;
        tempContainer.style.letterSpacing = getComputedStyle(companyNameElement).letterSpacing;
        document.body.appendChild(tempContainer); // Add to body for measurement

        companyNameText.split('').forEach((char) => {
            const letter = document.createElement('span');
            letter.textContent = char === ' ' ? '\u00A0' : char;
            letter.style.display = 'inline-block';
            tempContainer.appendChild(letter);
            targetLetters.push(letter);
        });

        // Calculate positions
        const letterPositions = targetLetters.map(letter => {
            const rect = letter.getBoundingClientRect();
            // Calculate position relative to where the final H1 will be (center screen approx)
            // This requires knowing the final H1's position, let's calculate relative to window center
            const h1Rect = companyNameElement.getBoundingClientRect(); // Get expected H1 pos
            return {
                x: rect.left - window.innerWidth/2 + rect.width/2,
                y: rect.top - window.innerHeight/2 + rect.height/2
            };
        });
        document.body.removeChild(tempContainer); // Clean up temp container

        // Animation
        const tl = gsap.timeline({ delay: 0.3, onComplete: onCompleteCallback });
        particles.forEach((particle, i) => {
            const targetIndex = i % companyNameText.length;
            const targetPos = letterPositions[targetIndex];
            tl.to(particle, {
                x: targetPos.x + random(-5, 5), y: targetPos.y + random(-5, 5),
                opacity: random(0.7, 1), duration: random(1.3, 2.3), ease: "power3.inOut",
            }, random(0, 0.35));

            tl.to(particle, {
                // Morph visually towards final state
                fontSize: getComputedStyle(companyNameElement).fontSize,
                fontWeight: getComputedStyle(companyNameElement).fontWeight,
                fontFamily: getComputedStyle(companyNameElement).fontFamily,
                letterSpacing: getComputedStyle(companyNameElement).letterSpacing,
                textContent: companyNameText[targetIndex],
                color: initialTitleColor,
                duration: 0.6, ease: "power1.inOut"
            }, "-=0.8");
        });

        // Final clean-up: Remove particles, set final text using spans
        tl.call(() => {
            companyNameElement.innerHTML = ''; // Clear particles
            titleSpans = splitTextIntoSpans(companyNameElement); // Create final spans and STORE them
            gsap.set(titleSpans, { color: initialTitleColor, opacity: 1 }); // Ensure final clean state
        }, [], ">-=0.1"); // Run slightly before timeline ends

        if (entranceTimeline) entranceTimeline.add(tl);
    }


    // --- Glitch Transition Logic ---
    function createGlitchTransition() {
        console.log("Starting glitch transition...");
        if (!titleSpans) { // Check if titleSpans were created
             console.error("Title spans not ready for glitch effect.");
             titleSpans = splitTextIntoSpans(companyNameElement); // Try splitting now
             if (!titleSpans) {
                  transitionToMainContent_Fallback(); // Use fallback if still fails
                  return;
             }
        }
        if (titleContainer) titleContainer.style.pointerEvents = 'none';
        if (backButton) backButton.style.pointerEvents = 'none';

        const glitchTl = gsap.timeline({
            onComplete: () => {
                entranceScreen.classList.add('hidden');
                mainContent.classList.add('visible');
                // No need to manage video play state
            }
        });

        // 1. Initial quick flash/distortion
        glitchTl.to(entranceScreen, { duration: 0.05, filter: 'brightness(1.2)', yoyo: true, repeat: 2 })
            .to(titleSpans, { // Use stored spans
                duration: 0.05, opacity: 0.8, x: () => random(-6, 6), y: () => random(-4, 4),
                filter: 'blur(0.5px)', stagger: { amount: 0.25, from: "random" }, yoyo: true, repeat: 1
            }, "<");

        // 2. More intense glitching
        glitchTl.to(titleSpans, {
                duration: 0.4, x: () => random(-20, 20), y: () => random(-12, 12),
                rotation: () => random(-8, 8),
                color: () => glitchColors[Math.floor(random(0, glitchColors.length))],
                opacity: () => random(0.4, 0.9), stagger: { amount: 0.45, from: "random" }
            }, "+=0.05");

        // 3. Final disintegration and Scroll Trigger
        glitchTl.to(titleSpans, {
                duration: 0.5, opacity: 0, y: () => random(50, 120), filter: 'blur(5px)',
                stagger: { amount: 0.4, from: "center" }, ease: "power1.in"
            }, "-=0.15")
             .to(window, { // Scroll starts as letters disintegrate
                 duration: 1.1, scrollTo: { y: 0 }, ease: "power2.inOut"
             }, "<");
    }

     // --- Back Button Transition ---
     function transitionToEntranceScreen() {
         console.log("Transitioning back to entrance...");
         if (backButton) backButton.style.pointerEvents = 'none';
         if (titleContainer) titleContainer.style.pointerEvents = 'none';
         closeMobileMenu(); // Close menu if open

         const backTl = gsap.timeline({
             onComplete: () => {
                 if (titleContainer) titleContainer.style.pointerEvents = 'auto';
             }
         });

         backTl.to(window, { duration: 0.8, scrollTo: { y: 0 }, ease: "power2.inOut" });

         backTl.call(() => {
             mainContent.classList.remove('visible');
             entranceScreen.classList.remove('hidden');
             // Reset title to clean state immediately
             gsap.set(titleSpans, { clearProps: "all", color: initialTitleColor, opacity: 1 });
         }, null, ">-0.4");
     }

     // Fallback transition
     function transitionToMainContent_Fallback() {
         console.log("Using fallback transition...");
         const fallbackTl = gsap.timeline({
             onComplete: () => {
                 entranceScreen.classList.add('hidden');
                 mainContent.classList.add('visible');
             }
         });
         fallbackTl.to(window, { duration: 1.0, scrollTo: { y: 0 }, ease: "power2.inOut" }, 0);
     }

    // --- Subtle Parallax Effect ---
    function setupParallax() {
        if (backgroundImages.length) {
            window.addEventListener('mousemove', (e) => {
                // Reduce effect intensity
                const moveX = (e.clientX / window.innerWidth - 0.5) * -20; // Max 10px move
                const moveY = (e.clientY / window.innerHeight - 0.5) * -20; // Max 10px move

                // Apply smooth tween using GSAP
                gsap.to(backgroundImages, {
                    duration: 1.8, // Slower, smoother transition
                    x: moveX,
                    y: moveY,
                    ease: 'power1.out' // Smooth easing
                });
            });
        }
    }

    // --- Mobile Menu Logic ---
    function openMobileMenu() {
        body.classList.add('mobile-menu-open');
        mobileMenuButton.querySelector('i').classList.remove('fa-bars');
        mobileMenuButton.querySelector('i').classList.add('fa-times');
        gsap.to(mobileMenu, { right: 0, duration: 0.4, ease: 'power2.out' });
        gsap.to(mobileMenuOverlay, { opacity: 1, visibility: 'visible', duration: 0.4 });
        mobileMenuOverlay.style.pointerEvents = 'auto'; // Enable overlay click
    }

    function closeMobileMenu() {
        body.classList.remove('mobile-menu-open');
        mobileMenuButton.querySelector('i').classList.remove('fa-times');
        mobileMenuButton.querySelector('i').classList.add('fa-bars');
        gsap.to(mobileMenu, { right: `-${mobileMenu.offsetWidth}px`, duration: 0.4, ease: 'power2.in' });
        gsap.to(mobileMenuOverlay, { opacity: 0, visibility: 'hidden', duration: 0.4 });
        mobileMenuOverlay.style.pointerEvents = 'none'; // Disable overlay click
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
        entranceTimeline = gsap.timeline();
        if(titleContainer) titleContainer.style.pointerEvents = 'none'; // Disable clicks initially

        createParticleText(() => { // Enable click after particles settle
             if (titleContainer) titleContainer.style.pointerEvents = 'auto';
             console.log("Particle text animation complete. Title clickable.");
        });

        setupParallax(); // Initialize parallax effect

        gsap.set(mainContent, { display: 'flex', opacity: 0, visibility: 'hidden' });
        gsap.set(backButton, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
        gsap.set(mobileMenuButton, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
        gsap.set(mobileMenuOverlay, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
        gsap.set(mobileMenu, { right: '-300px' }); // Ensure menu starts off-screen

        // --- Event Listeners ---
        if (titleContainer) titleContainer.addEventListener('click', createGlitchTransition);
        else console.error("Title container not found!");

        if (backButton) backButton.addEventListener('click', transitionToEntranceScreen);
        else console.error("Back button not found!");

        if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
        else console.error("Mobile menu button not found!");

        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
        if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu); // Close on overlay click

        // Close menu and scroll when clicking a nav link
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                closeMobileMenu(); // Close menu first
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    gsap.to(window, {
                        duration: 0.8,
                        // Calculate offset dynamically, considering potential fixed headers later
                        scrollTo: { y: targetSection, offsetY: 80 }, // Add some offset
                        ease: "power2.inOut",
                        delay: 0.1 // Slight delay after menu starts closing
                    });
                }
            });
        });

         console.log("Initialization complete.");
    }
    init();

}); // End DOMContentLoaded