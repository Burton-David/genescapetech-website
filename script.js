// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    console.log("GeneScape Website Initializing...");

    const entranceScreen = document.getElementById('entrance-screen');
    const mainContent = document.getElementById('main-content');
    const companyName = document.getElementById('company-name');
    const enterButton = document.getElementById('enter-button');

    // --- Placeholder for Entrance Animation Setup ---
    function setupEntranceAnimation() {
        console.log("Setting up entrance animations...");
        // 1. TODO: Particle text animation for companyName
        // Temporary: Just show the name
        companyName.textContent = "GeneScape Technologies";

        // 2. TODO: Cylinder rotation animation
        // 3. TODO: Waterfall animation (conditional)

        // 4. Show enter button (maybe after text animation)
        // Temporary: Show after a delay
        setTimeout(() => {
            if (enterButton) { // Ensure button exists
                 enterButton.style.display = 'inline-block';
                 // Add hover effect listener if needed beyond CSS
                 companyName.style.cursor = 'pointer'; // Indicate name is clickable
                 companyName.addEventListener('mouseover', () => enterButton.style.display = 'inline-block');
                 // Maybe hide button again on mouseout? Decide UX
            }
        }, 1500); // Simulate delay for text animation
    }

    // --- Placeholder for Main Content Animation Setup ---
    function setupMainContentAnimation() {
        console.log("Setting up main content animations...");
        // 1. TODO: Canvas genome sequence animation
    }

    // --- Transition Logic ---
    function transitionToMainContent() {
        console.log("Transitioning to main content...");

        // 1. TODO: Animate entrance screen elements out (GSAP recommended)
        // Temporary: Just hide the entrance screen abruptly
        if (entranceScreen) {
            entranceScreen.style.display = 'none';
        }


        // 2. Show main content section
        if (mainContent) {
            mainContent.style.display = 'flex'; // Show it (use 'flex' as defined in CSS)

            // 3. Trigger scroll to the main content (optional, if it wasn't immediate)
            // window.scrollTo({ top: mainContent.offsetTop, behavior: 'smooth' });

            // 4. Initialize animations for the main content section
            setupMainContentAnimation();
        }
    }

    // --- Event Listeners ---
    // Trigger transition when company name or button is clicked
     if (companyName) {
         companyName.addEventListener('click', transitionToMainContent);
     }
    if (enterButton) {
        enterButton.addEventListener('click', transitionToMainContent);
    }


    // --- Initialization ---
    setupEntranceAnimation();

}); // End DOMContentLoaded