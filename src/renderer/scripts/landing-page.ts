import compLogo from '../../assets/logo.png'
import { registerPage, renderPage } from './render-page';
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
    });

    document.getElementById('go-to-config')?.addEventListener('click', () => {
        renderPage('config-page');
    });
}


registerPage('landing-page', {
    init: initLandingPage
})