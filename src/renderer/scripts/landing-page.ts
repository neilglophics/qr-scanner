import compLogo from '../../assets/logo.png'
import { initConfigurationPage } from './configuration-page';
import { initQrPage } from './qr-page';
// import { initQrPage } from './qr-page';
/* Use this code to initialize/bind the landing page listeners */
export const initLandingPage = () => {
    const logo = document.createElement('img') as HTMLImageElement;
    logo.src = compLogo;
    logo.alt = 'Logo';
    logo.style.width = '55px';
    document.getElementById('logo-header')?.prepend(logo);

    document.getElementById('go-to-qr')?.addEventListener('click', () => {
        renderPage('qr-page');
        initQrPage();
    });

    document.getElementById('go-to-config')?.addEventListener('click', () => {
        renderPage('config-page');
        initConfigurationPage();
    });
}


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

