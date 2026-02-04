export const CONFIGS = {
    // Use the browser's hostname so the UI (served to the host) calls the
    // host-mapped `poke-server` service. Default to port 80 for HTTP.
    hostIP: window.location.hostname,
    apiVersion: 'v1',
    apiPort: (location.protocol === 'https:' ? '443' : '80')
}