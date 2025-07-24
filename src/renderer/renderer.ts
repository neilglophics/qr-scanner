import './scripts/landing-page';
import './scripts/qr-page';
import './scripts/configuration-page';
import './index.css';
import { renderPage } from "./scripts/render-page";

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    renderPage('landing-page');
});