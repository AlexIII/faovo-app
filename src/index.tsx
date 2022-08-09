import './index.css';
import * as React from 'preact';
import App from './components/App';

const reactContainer = window.document.getElementById('app-container');
if(!reactContainer) throw new Error(`'app-container' not found in document`);
React.render(<App />, reactContainer);

if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(
            registration => console.log('ServiceWorker registration successful with scope: ', registration.scope),
            err => console.log('ServiceWorker registration failed: ', err)
        );
    });
}
