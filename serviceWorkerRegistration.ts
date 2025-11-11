// serviceWorkerRegistration.ts
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Register the actual service-worker.js file.
        // Assuming service-worker.js is located at the root of the application.
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    } else {
        console.warn('Service Workers are not supported in this browser.');
    }
}

export function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.unregister();
            console.log('Service Worker unregistered.');
        });
    }
}