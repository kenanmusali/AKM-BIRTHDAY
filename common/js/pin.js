// Immediately hide everything
document.write('<style id="pinHideStyle">*{display:none !important;}</style>');

(function requestPIN() {
    const correctPIN = "053626";
    const storageKey = "pinExpiration";
    const validDuration = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    // Check if we have a valid unexpired PIN in storage
    const checkExistingPIN = () => {
        const expiration = localStorage.getItem(storageKey);
        if (expiration && Date.now() < parseInt(expiration)) {
            const styleTag = document.getElementById("pinHideStyle");
            if (styleTag) styleTag.remove();
            setTimeout(() => {
                alert("Your access will expire soon. The PIN will be requested again shortly.");
            }, validDuration - 60000); // Warn 1 minute before expiration
            return true;
        }
        return false;
    };

    const tryPIN = () => {
        // First check if we already have a valid PIN
        if (checkExistingPIN()) return;

        const userPIN = prompt("Enter PIN:");

        if (userPIN === null) {
            alert("Cancelled. You must enter the PIN to continue.");
            tryPIN();
        } else if (userPIN === correctPIN) {
            // Set expiration time (current time + 4 hours)
            const expirationTime = Date.now() + validDuration;
            localStorage.setItem(storageKey, expirationTime.toString());
            
            alert("Access granted! This access will expire in 4 hours.");
            const styleTag = document.getElementById("pinHideStyle");
            if (styleTag) styleTag.remove();
            
            // Set timeout to warn before expiration
            setTimeout(() => {
                alert("Your access will expire soon. The PIN will be requested again shortly.");
            }, validDuration - 60000); // Warn 1 minute before expiration
            
            // Set timeout to actually expire
            setTimeout(() => {
                localStorage.removeItem(storageKey);
                location.reload(); // This will trigger the PIN prompt again
            }, validDuration);
        } else {
            alert("Incorrect PIN. Ask admin to enter it.");
            tryPIN();
        }
    };

    // Check for existing valid PIN on page load
    if (!checkExistingPIN()) {
        tryPIN();
    }
})();