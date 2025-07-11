import { initLandingPage } from "./scripts/landing-page";
import './index.css';
/* Code for custom router */
function renderPage(templateId: string) {
    const container = document.getElementById('main-container')!;
    const template = document.getElementById(templateId) as HTMLTemplateElement;

    if (!template) {
        console.error(`Template with id '${templateId}' not found.`);
        return;
    }

    const clone = template.content.cloneNode(true);
    container.innerHTML = '';
    container.appendChild(clone);
}

/* Once dom is loaded render landing page and initialize/bind the event listeners */
document.addEventListener('DOMContentLoaded', () => {
    renderPage('landing-page');
    initLandingPage();
});



/* Util Functions */
// const handleWaybillPrint = async (data: QR, stru) => {

// }