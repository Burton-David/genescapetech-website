document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollToPlugin, TextPlugin);
    console.log("GeneScape Website Initializing (Hyperion Pass)...");

    // --- Selectors ---
    const entranceScreen = document.getElementById('entrance-screen');
    const mainContent = document.getElementById('main-content');
    const titleContainer = document.getElementById('title-container');
    const companyNameElement = document.getElementById('company-name');
    const backButton = document.getElementById('back-button');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    // --- Configuration ---
    const companyNameText = "GeneScape Technologies";
    const particleCount = 80;
    const initialTitleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-title-initial').trim() || '#C9AB7C';

    let entranceTimeline;

    // --- Utility Functions ---
    function random(min, max) { return Math.random() * (max - min) + min; }
    const entranceColors = ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#E6C38C', '#BB9671'];

    function splitTextIntoSpans(selector) {
        const element = document.querySelector(selector);
        if (!element) return null;
        const text = element.textContent.trim();
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
    function createParticleText(onCompleteCallback) {
        companyNameElement.innerHTML = ''; // Clear name initially
        const particles = [];

        // Create particles off-screen or randomly positioned
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.classList.add('particle');
            // Use random characters initially, maybe from name or abstract symbols
            particle.textContent = companyNameText[Math.floor(random(0, companyNameText.length))]; // Or symbols like '*', '#', etc.
            companyNameElement.appendChild(particle); // Add to H1 to inherit styles later

            gsap.set(particle, {
                position: 'absolute', top: '50%', left: '50%', xPercent: -50, yPercent: -50,
                color: entranceColors[Math.floor(random(0, entranceColors.length))],
                fontSize: `${random(10, 20)}px`,
                x: random(-window.innerWidth * 0.7, window.innerWidth * 0.7), // Wider initial spread
                y: random(-window.innerHeight * 0.7, window.innerHeight * 0.7),
                opacity: 0,
                zIndex: 5 // Keep particles behind final text potentially
            });
            particles.push(particle);
        }

        // Create hidden target letters purely for position calculation
        const targetLetters = [];
        companyNameText.split('').forEach((char) => {
            const letter = document.createElement('span');
            letter.textContent = char === ' ' ? '\u00A0' : char;
            letter.style.position = 'relative'; letter.style.display = 'inline-block';
            letter.style.visibility = 'hidden'; // Keep hidden
            // Apply final font style for accurate measurement
            letter.style.fontFamily = getComputedStyle(companyNameElement).fontFamily;
            letter.style.fontSize = getComputedStyle(companyNameElement).fontSize;
            letter.style.fontWeight = getComputedStyle(companyNameElement).fontWeight;
            letter.style.letterSpacing = getComputedStyle(companyNameElement).letterSpacing;
             letter.style.color = 'transparent';
            companyNameElement.appendChild(letter);
            targetLetters.push(letter);
        });


        // Calculate positions after rendering
        requestAnimationFrame(() => {
            const letterPositions = targetLetters.map(letter => {
                 const rect = letter.getBoundingClientRect();
                 const parentRect = companyNameElement.getBoundingClientRect();
                 // Calculate position relative to the parent's center for absolute positioning
                 return {
                     x: rect.left - parentRect.left + rect.width / 2 - companyNameElement.offsetWidth / 2,
                     y: rect.top - parentRect.top + rect.height / 2 - companyNameElement.offsetHeight / 2
                 };
            });
             // Remove calculation helpers immediately
            targetLetters.forEach(letter => letter.remove());

            // Start animation timeline
            const tl = gsap.timeline({
                delay: 0.2,
                onComplete: onCompleteCallback // Callback when animation finishes
            });

            particles.forEach((particle, i) => {
                const targetIndex = i % companyNameText.length;
                const targetPos = letterPositions[targetIndex];

                // Animate particles towards their target positions
                tl.to(particle, {
                    x: targetPos.x + random(-8, 8),
                    y: targetPos.y + random(-8, 8),
                    opacity: random(0.6, 1),
                    duration: random(1.2, 2.2),
                    ease: "power3.inOut",
                }, random(0, 0.3)); // Stagger start times

                // Morph particles into the final letters
                // This tween starts overlapping the movement tween
                tl.to(particle, {
                    fontSize: getComputedStyle(companyNameElement).fontSize, // Ensure final size match
                    fontWeight: getComputedStyle(companyNameElement).fontWeight,
                    fontFamily: getComputedStyle(companyNameElement).fontFamily,
                    letterSpacing: getComputedStyle(companyNameElement).letterSpacing,
                    textContent: companyNameText[targetIndex], // Set correct character
                    color: initialTitleColor, // Set final clean text color
                    // Maybe fade out particles that aren't part of the final text?
                    // Or just let them form the letters
                    duration: 0.5,
                    ease: "power1.inOut"
                }, "-=0.7"); // Overlap significantly
            });

             // Optional: Add a final step to ensure all particles form the exact text
             tl.call(() => {
                 companyNameElement.innerHTML = ''; // Clear particles
                 splitTextIntoSpans('#company-name'); // Recreate text with final spans cleanly
                 gsap.set('#company-name span', { color: initialTitleColor, opacity: 1 }); // Ensure final state
             }, [], ">"); // Run after all particle animations


            entranceTimeline.add(tl); // Add to main entrance timeline if needed
        });
    }

    // --- REMOVED Canvas Animation Code ---

    // --- Glitch Transition Logic ---
    function createGlitchTransition() {
        console.log("Starting glitch transition...");
        if (titleContainer) titleContainer.style.pointerEvents = 'none'; // Disable click during transition
        if (backButton) backButton.style.pointerEvents = 'none'; // Disable back button too

        const letters = splitTextIntoSpans('#company-name'); // Ensure text is split
        if (!letters) { transitionToMainContent_Fallback(); return; }

        const glitchTl = gsap.timeline({
            onComplete: () => {
                // Hide entrance screen via class for CSS transition
                entranceScreen.classList.add('hidden');
                // Show main content via class for CSS transition
                mainContent.classList.add('visible');

                 // Re-enable title click *if* we intend to allow glitching again without reload
                 // if (titleContainer) titleContainer.style.pointerEvents = 'auto';
            }
        });

        // 1. Initial quick flash/distortion
        glitchTl.to(entranceScreen, { // Flash effect on screen
                duration: 0.04, yoyo: true, repeat: 2,
                filter: 'brightness(1.3) contrast(1.1)' // Subtle flash
            })
            .to(letters, { // Scramble letters
                duration: 0.04, opacity: 0.7, x: () => random(-5, 5), y: () => random(-3, 3),
                filter: 'blur(0.5px)', stagger: { amount: 0.2, from: "random" }, yoyo: true, repeat: 1
            }, "<");

        // 2. More intense glitching
        glitchTl.to(letters, {
                duration: 0.35, x: () => random(-25, 25), y: () => random(-15, 15),
                rotation: () => random(-10, 10),
                color: () => ['#D91F1C', '#C9AB7C', '#FFFFFF', '#1D1D1D', '#A0A0A0'][Math.floor(random(0, 5))],
                opacity: () => random(0.3, 0.9), stagger: { amount: 0.4, from: "random" }
            }, "+=0.05");

        // 3. Final disintegration (letters fade/fall) AND Scroll Trigger
        glitchTl.to(letters, {
                duration: 0.45, opacity: 0, y: () => random(40, 100), filter: 'blur(4px)',
                stagger: { amount: 0.35, from: "center" }, ease: "power1.in"
            }, "-=0.15")
             // Instead of fading screen with GSAP, let CSS handle it via class removal later
             // Start scroll while letters are disintegrating
             .to(window, {
                 duration: 1.1,
                 scrollTo: { y: 0 }, // Scroll to top of #main-content (which starts at y=0)
                 ease: "power2.inOut"
             }, "<+=0.1"); // Start scroll slightly after letters start fading

    }

     // --- Back Button Transition ---
     function transitionToEntranceScreen() {
         console.log("Transitioning back to entrance...");
         if (backButton) backButton.style.pointerEvents = 'none'; // Disable during transition
         if (titleContainer) titleContainer.style.pointerEvents = 'none'; // Disable title click too

         const backTl = gsap.timeline({
             onComplete: () => {
                 // Re-enable title click after returning
                 if (titleContainer) titleContainer.style.pointerEvents = 'auto';
                 // Ensure main video is paused? (Optional)
                 // if(mainVideo) mainVideo.pause();
             }
         });

         // 1. Scroll window back to top smoothly
         backTl.to(window, {
             duration: 0.8,
             scrollTo: { y: 0 },
             ease: "power2.inOut"
         });

         // 2. Fade out main content (using class) and fade in entrance screen
         backTl.call(() => {
             mainContent.classList.remove('visible');
             entranceScreen.classList.remove('hidden');
             // Re-run particle text animation for re-entry? Or just ensure title is visible?
             // Let's just ensure the title is visible and clean.
             gsap.set('#company-name span', {clearProps: "all"}); // Clear any glitch props
             companyNameElement.innerHTML = ''; // Clear spans
             splitTextIntoSpans('#company-name'); // Recreate clean text
             gsap.set('#company-name span', { color: initialTitleColor, opacity: 1 });

             // No video elements to manage anymore

         }, null, ">-0.4"); // Start fade slightly before scroll finishes

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
         // Just use the class-based fade + scroll
         fallbackTl.to(window, { duration: 1.0, scrollTo: { y: 0 }, ease: "power2.inOut" }, 0);
     }


    // --- Initialization Function ---
    function init() {
        entranceTimeline = gsap.timeline();
        if(titleContainer) titleContainer.style.pointerEvents = 'none'; // Disable clicks initially

        // Run particle animation, enable clicks on completion
        createParticleText(() => {
             if (titleContainer) titleContainer.style.pointerEvents = 'auto';
             console.log("Particle text animation complete. Title clickable.");
        });

        // Add subtle parallax effect to background images
        const backgroundImages = document.querySelectorAll('.background-image');
        if (backgroundImages.length) {
            window.addEventListener('mousemove', (e) => {
                const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
                backgroundImages.forEach(img => {
                    gsap.to(img, {
                        duration: 1.5,
                        x: moveX,
                        y: moveY,
                        ease: 'power1.out'
                    });
                });
            });
        }

        // Ensure main content and navigation buttons are hidden initially
        gsap.set(mainContent, { display: 'flex', opacity: 0, visibility: 'hidden' }); // Set display flex but keep hidden
        gsap.set(backButton, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
        gsap.set(mobileMenuButton, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });


        // --- Event Listeners ---
        if (titleContainer) {
             titleContainer.addEventListener('click', createGlitchTransition);
        } else { console.error("Title container not found!"); }

        if (backButton) {
            backButton.addEventListener('click', transitionToEntranceScreen);
        } else { console.error("Back button not found!"); }
        
        // Mobile menu functionality
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', toggleMobileMenu);
        } else { console.error("Mobile menu button not found!"); }
        
        // Function to handle mobile menu toggle
        function toggleMobileMenu() {
            console.log("Mobile menu clicked");
            const mainContentArea = document.querySelector('.main-content-area');
            
            if (mainContentArea) {
                mainContentArea.classList.toggle('mobile-menu-open');
                
                // Toggle icon between bars and X
                const icon = mobileMenuButton.querySelector('i');
                if (icon) {
                    if (icon.classList.contains('fa-bars')) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-times');
                    } else {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        }
        
        // Add click handlers for mobile menu links
        const mobileMenuLinks = document.querySelectorAll('.mobile-nav-links a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get the target section id from the href
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Close the mobile menu
                    const mainContentArea = document.querySelector('.main-content-area');
                    if (mainContentArea && mainContentArea.classList.contains('mobile-menu-open')) {
                        mainContentArea.classList.remove('mobile-menu-open');
                        
                        // Reset menu button icon
                        const icon = mobileMenuButton.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                        }
                    }
                    
                    // Scroll to the section
                    gsap.to(window, {
                        duration: 0.8,
                        scrollTo: { y: targetSection, offsetY: 70 },
                        ease: "power2.inOut"
                    });
                }
            });
        });

        // Resize listener (removed canvas logic)
        // window.addEventListener('resize', onResize); // Keep if needed for other resize logic

         console.log("Initialization complete.");
    }
    init();

}); // End DOMContentLoaded