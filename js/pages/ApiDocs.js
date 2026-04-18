export default {
    data() {
        return {
            activeSection: this.$route.params.section || 'introduction',
            activeSubtab: this.$route.params.subtab || null,
            currentContent: '',
            loading: false,
            sidebarSections: [
                {
                    id: 'introduction',
                    title: 'Introduction',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
                    subtabs: []
                },
                {
                    id: 'auth',
                    title: 'Authentication',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
                    subtabs: [
                        { id: 'register', title: 'Register' },
                        { id: 'login', title: 'Login' },
                        { id: 'refresh', title: 'Token Refresh' },
                        { id: 'logout', title: 'Logout' }
                    ]
                },
                {
                    id: 'users',
                    title: 'Users',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
                    subtabs: [
                        { id: 'list', title: 'List Users' },
                        { id: 'get', title: 'Get User' },
                        { id: 'update', title: 'Update User' },
                        { id: 'delete', title: 'Delete User' }
                    ]
                },
                {
                    id: 'players',
                    title: 'Players',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>',
                    subtabs: [
                        { id: 'list', title: 'List Players' },
                        { id: 'rankings', title: 'Rankings' },
                        { id: 'stats', title: 'Statistics' }
                    ]
                },
                {
                    id: 'demons',
                    title: 'Demons',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
                    subtabs: [
                        { id: 'list', title: 'List Demons' },
                        { id: 'ranked', title: 'Ranked List' },
                        { id: 'detail', title: 'Demon Details' }
                    ]
                },
                {
                    id: 'records',
                    title: 'Records',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
                    subtabs: [
                        { id: 'submit', title: 'Submit Record' },
                        { id: 'verify', title: 'Verify Record' },
                        { id: 'delete', title: 'Delete Record' }
                    ]
                },
                {
                    id: 'leaderboards',
                    title: 'Leaderboards',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
                    subtabs: []
                },
                {
                    id: 'submissions',
                    title: 'Submissions',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
                    subtabs: [
                        { id: 'list', title: 'List Submissions' },
                        { id: 'review', title: 'Review Submission' }
                    ]
                },
                {
                    id: 'moderation',
                    title: 'Moderation',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
                    subtabs: [
                        { id: 'actions', title: 'Moderation Actions' }
                    ]
                },
                {
                    id: 'errors',
                    title: 'Errors',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
                    subtabs: []
                },
                {
                    id: 'rate-limits',
                    title: 'Rate Limits',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
                    subtabs: []
                },
                {
                    id: 'webhooks',
                    title: 'Webhooks (v2)',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
                    subtabs: []
                }
            ]
        };
    },
    watch: {
        '$route.params.section'(newVal) {
            this.activeSection = newVal || 'introduction';
            this.loadContent();
        },
        '$route.params.subtab'(newVal) {
            this.activeSubtab = newVal;
            this.loadContent();
        }
    },
    mounted() {
        this.loadContent();
    },
    methods: {
        async loadContent() {
            this.loading = true;
            try {
                const modulePath = this.getModulePath();
                const module = await import(modulePath);
                this.currentContent = module.render ? module.render() : module.default || '<p>Content not found</p>';
            } catch (error) {
                console.error('Failed to load content:', error);
                this.currentContent = `<div class="error-content">
                    <h2>⚠️ Content Load Error</h2>
                    <p>Failed to load documentation for: <code>${this.activeSection}${this.activeSubtab ? '/' + this.activeSubtab : ''}</code></p>
                    <p>Error: ${error.message}</p>
                </div>`;
            }
            this.loading = false;
        },
        getModulePath() {
            if (this.activeSubtab) {
                return `./api-docs/${this.activeSection}_${this.activeSubtab}.js`;
            }
            return `./api-docs/${this.activeSection}.js`;
        },
        navigateTo(section, subtab = null) {
            const sectionData = this.sidebarSections.find(s => s.id === section);
            // If section has subtabs and no subtab specified, go to first subtab
            if (sectionData && sectionData.subtabs.length > 0 && !subtab) {
                subtab = sectionData.subtabs[0].id;
            }
            const path = subtab ? `/api-docs/${section}/${subtab}` : `/api-docs/${section}`;
            this.$router.push(path);
        },
        isActive(section, subtab = null) {
            if (subtab) {
                return this.activeSection === section && this.activeSubtab === subtab;
            }
            return this.activeSection === section && !this.activeSubtab;
        }
    },
    template: `
        <main class="page-api-docs">
            <div class="docs-hero">
                <div class="docs-kicker">Developer Reference</div>
                <h1>PC Demonlist API</h1>
                <p class="subtitle">Complete API Reference for Geometry Dash Demonlist Data</p>
                <div class="version-badges">
                    <span class="badge v1">v1 Stable</span>
                    <span class="badge v2">v2 Latest</span>
                </div>
                <div class="docs-highlights">
                    <div class="docs-highlight">
                        <span class="docs-highlight__label">Coverage</span>
                        <strong>16 Public Endpoints</strong>
                    </div>
                    <div class="docs-highlight">
                        <span class="docs-highlight__label">Formats</span>
                        <strong>Requests, Responses, Errors</strong>
                    </div>
                    <div class="docs-highlight">
                        <span class="docs-highlight__label">Support</span>
                        <strong>v1 Stable + v2 Latest</strong>
                    </div>
                </div>
            </div>

            <div class="docs-container">
                <aside class="docs-sidebar">
                    <div class="sidebar-header">
                        <h3>Documentation</h3>
                        <p>Browse endpoint groups, request flows, and reference pages.</p>
                    </div>
                    <nav class="sidebar-nav">
                        <ul class="nav-tree">
                            <li v-for="section in sidebarSections" :key="section.id" class="nav-section">
                                <button 
                                    class="nav-section-title"
                                    :class="{ active: activeSection === section.id }"
                                    @click="navigateTo(section.id)"
                                >
                                    <span class="nav-icon" v-html="section.icon"></span>
                                    <span>{{ section.title }}</span>
                                </button>
                                <ul v-if="section.subtabs.length > 0" class="nav-subtabs">
                                    <li v-for="subtab in section.subtabs" :key="subtab.id">
                                        <button
                                            class="nav-subtab"
                                            :class="{ active: isActive(section.id, subtab.id) }"
                                            @click="navigateTo(section.id, subtab.id)"
                                        >
                                            {{ subtab.title }}
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <div class="docs-content">
                    <div class="docs-content-shell">
                        <div v-if="loading" class="loading-indicator">
                            <div class="spinner"></div>
                            <p>Loading documentation...</p>
                        </div>
                        <div v-else class="content-wrapper api-docs-rendered" v-html="currentContent"></div>
                    </div>
                </div>
            </div>
        </main>
    `
};
