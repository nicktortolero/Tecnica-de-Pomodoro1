// service-worker.js
const CACHE_NAME = 'pomodoro-pro-cache-v2'; // Increment cache version to trigger update
const urlsToCache = [
    '/',
    '/index.html',
    // Compiled JS versions of TSX files (assuming a build step or browser interpretation)
    '/index.js',
    '/App.js',
    '/types.js',
    '/constants.js',
    '/serviceWorkerRegistration.js',
    '/services/geminiService.js',
    '/components/Button.js',
    '/components/ModeButton.js',
    '/components/TimerDisplay.js',
    '/components/TimerControls.js',
    '/components/TaskInput.js',
    '/components/TaskList.js',
    '/components/AchievementBadge.js',
    '/components/BackgroundModeIndicator.js',
    '/components/Modals/StatsModal.js',
    '/components/Modals/SettingsModal.js',
    '/components/Modals/ThemeModal.js',
    '/components/Modals/GeminiModal.js',
    '/service-worker.js', // The service worker itself
    '/manifest.json', // PWA manifest
    // Placeholder icons for PWA manifest. In a real app, you'd create these and place them under /icons.
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // CDN assets - CRITICAL for offline functionality if not bundled
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://aistudiocdn.com/@google/genai@^1.29.0',
    'https://aistudiocdn.com/react-dom@^19.2.0/',
    'https://aistudiocdn.com/react@^19.2.0/',
    'https://aistudiocdn.com/react@^19.2.0',
    'https://aistudiocdn.com/recharts@^3.4.1',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    // Ensure placeholder icon for notifications is also cached if used
    'https://picsum.photos/64/64'
];

let timerInterval = null;
let currentState = null; // Stores { time: remainingSeconds, mode: 'pomodoro' }
let endTime = null;

self.addEventListener('install', event => {
    self.skipWaiting();
    console.log('Service Worker instalado. Saltando la espera.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierta. Añadiendo URLs a cache...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Todas las URLs cacheadas con éxito.');
            })
            .catch(error => {
                console.error('Fallo al cachear URLs:', error);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando caché antigua', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
    console.log('Service Worker activado y clientes reclamados.');
});

self.addEventListener('fetch', event => {
    // Only cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log('Sirviendo desde caché:', event.request.url);
                return response;
            }

            console.log('No en caché, intentando red:', event.request.url);
            return fetch(event.request).then(
                networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.url.startsWith(self.location.origin)) {
                        // Don't cache opaque responses (e.g., cross-origin requests without CORS headers)
                        // but return them directly.
                        if (networkResponse && networkResponse.type === 'opaque') {
                            console.log('Opaque response, no cache:', event.request.url);
                        }
                        return networkResponse;
                    }
                    
                    // Clone the response for caching
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                            console.log('Cacheado nuevo recurso:', event.request.url);
                        });
                    return networkResponse;
                }
            ).catch(error => {
                console.error('Service Worker: Fallo en la red para', event.request.url, error);
                // Fallback for navigation requests
                if (event.request.mode === 'navigate') {
                    // Try to serve a cached index.html if network fails for the main document
                    return caches.match('/index.html').then(cachedIndex => {
                        if (cachedIndex) return cachedIndex;
                        // If index.html is not cached, return a generic offline response
                        return new Response('<h1>Offline</h1><p>No tienes conexión a internet.</p>', { 
                            headers: { 'Content-Type': 'text/html' } 
                        });
                    });
                }
                // For other requests, return a simple offline response
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable', headers: new Headers({ 'Content-Type': 'text/plain' }) });
            });
        })
    );
});


self.addEventListener('message', event => {
    const message = event.data;
    console.log('SW received message:', message.type);

    if (message.type === 'TIMER_START') {
        startBackgroundTimer(message.time, message.mode, message.endTime);
    }
    else if (message.type === 'TIMER_PAUSE') {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            console.log('Background timer paused.');
        }
    }
    else if (message.type === 'TIMER_RESET') {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        currentState = null;
        endTime = null;
        console.log('Background timer reset.');
    }
    else if (message.type === 'MODE_CHANGE') {
        if (currentState) {
            currentState.mode = message.mode;
            console.log('Background timer mode changed to:', message.mode);
        }
    }
});

function startBackgroundTimer(initialTime, mode, calculatedEndTime) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    console.log('Starting background timer...');

    currentState = {
        time: initialTime,
        mode: mode
    };

    endTime = calculatedEndTime;

    timerInterval = setInterval(() => {
        // Calculate remaining time based on predicted end time to avoid drift
        const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
        currentState.time = remaining;

        // Send update to all clients
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'TIMER_UPDATE',
                    time: currentState.time,
                    mode: currentState.mode
                });
            });
        });

        if (remaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            console.log('Background timer ended.');

            // Notify timer end
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'TIMER_END'
                    });
                });
            });

            // Show notification
            showNotification();

            // Reset current state after completion
            currentState = null;
            endTime = null;
        }
    }, 1000); // Check every second
}

function showNotification() {
    if (!currentState) return;

    let title, body;
    let iconUrl = '/icons/icon-192x192.png'; // Use PWA icon

    switch(currentState.mode) {
        case 'pomodoro':
            title = '¡Pomodoro completado!';
            body = 'Toma un descanso corto';
            break;
        case 'shortBreak':
            title = '¡Descanso corto terminado!';
            body = 'Hora de volver a trabajar';
            break;
        case 'longBreak':
            title = '¡Descanso largo terminado!';
            body = 'Prepárate para otra sesión';
            break;
        case 'deepFocus':
            title = '¡Sesión de enfoque profundo completada!';
            body = 'Excelente trabajo';
            break;
        default:
            title = '¡Temporizador completado!';
            body = 'Tu sesión ha terminado.';
    }

    self.registration.showNotification(title, {
        body: body,
        icon: iconUrl,
        vibrate: [200, 100, 200]
    });
}