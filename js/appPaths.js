const APP_ROOT_URL = new URL('../', import.meta.url);

export function resolveAppUrl(path = '') {
    const raw = String(path || '').trim();
    if (!raw) return APP_ROOT_URL.toString();

    if (
        /^(?:[a-z]+:)?\/\//i.test(raw)
        || raw.startsWith('data:')
        || raw.startsWith('blob:')
    ) {
        return raw;
    }

    return new URL(raw.replace(/^\/+/, ''), APP_ROOT_URL).toString();
}
