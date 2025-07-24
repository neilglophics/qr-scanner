type PageLifecycle = {
    init?: () => void;
    cleanup?: () => void;
};

const pageRegistry = new Map<string, PageLifecycle>();

let currentPageId: string | null = null;

export function registerPage(templateId: string, lifecycle: PageLifecycle) {
    pageRegistry.set(templateId, lifecycle);
}

/* Code for custom router */
export function renderPage(templateId: string) {
    const container = document.getElementById('main-container')!;
    const template = document.getElementById(templateId) as HTMLTemplateElement;

    if (!template) {
        console.error(`Template with id '${templateId}' not found.`);
        return;
    }

    // Cleanup previous page
    if (currentPageId && pageRegistry.has(currentPageId)) {
        pageRegistry.get(currentPageId)?.cleanup?.();
    }

    // Render new page
    container.innerHTML = '';
    container.appendChild(template.content.cloneNode(true));

    // Init new page
    if (pageRegistry.has(templateId)) {
        pageRegistry.get(templateId)?.init?.();
    }

    currentPageId = templateId;
}

