/* Code for custom router */
export function renderPage(templateId: string) {
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

