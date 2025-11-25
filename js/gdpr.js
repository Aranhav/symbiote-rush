// GDPR Consent Module

export function checkGDPRConsent() {
    const consent = localStorage.getItem('symbioteGDPR');
    if (consent === 'accepted') return true;
    if (consent === 'declined') return false;

    // If no choice made yet, show banner
    const banner = document.getElementById('gdpr-banner');
    if (banner) {
        banner.style.display = 'block';

        document.getElementById('gdpr-accept').addEventListener('click', () => {
            localStorage.setItem('symbioteGDPR', 'accepted');
            banner.style.display = 'none';
        });

        document.getElementById('gdpr-decline').addEventListener('click', () => {
            localStorage.setItem('symbioteGDPR', 'declined');
            banner.style.display = 'none';
        });
    }

    return false; // Default to false until accepted
}

export function canSaveScore() {
    return localStorage.getItem('symbioteGDPR') === 'accepted';
}
