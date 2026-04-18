import { fetchEditors } from '../content.js';
import Spinner from '../components/Spinner.js';

export default {
    data: () => ({
        store: window.store || {},
        editors: [],
        loading: true,
        error: null,
        roleIconMap: {
            owner: 'crown',
            admin: 'user-gear',
            helper: 'user-shield',
            dev: 'code',
            trial: 'user-lock',
        },
        roleLabels: {
            owner: 'List Owner',
            admin: 'List Admin',
            helper: 'List Helper',
            trial: 'List Trial Helper',
            dev: 'Developer'
        }
    }),
    components: { Spinner },
    template: `
        <main v-if="loading" class="spinner-container">
            <Spinner></Spinner>
        </main>
        <main v-else-if="error" class="page-contacts">
            <div class="error-message">
                <p>{{ error }}</p>
            </div>
        </main>
        <main v-else-if="editors && editors.length > 0" class="page-contacts">
            <div class="contacts-hero">
                <div class="contacts-kicker">Official Team Directory</div>
                <h1>Contacts</h1>
                <p class="subtitle">Meet the staff behind the PCDemonlist, from list management and record support to development and technical operations.</p>
                <div class="contacts-highlights">
                    <div class="contacts-highlight">
                        <span class="contacts-highlight__label">Team Members</span>
                        <strong>{{ editors.length }}</strong>
                    </div>
                    <div class="contacts-highlight">
                        <span class="contacts-highlight__label">Management</span>
                        <strong>{{ management.length }} Active Staff</strong>
                    </div>
                    <div class="contacts-highlight">
                        <span class="contacts-highlight__label">Support</span>
                        <strong>{{ support.length + developers.length }} Review & Tech Contacts</strong>
                    </div>
                </div>
            </div>

            <div class="contacts-overview">
                <div class="overview-card">
                    <div class="overview-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <div>
                        <h3>Best Way To Reach Us</h3>
                        <p>For general help, record questions, or review clarification, use the official Discord and contact the appropriate staff group below.</p>
                    </div>
                </div>
                <div class="overview-card">
                    <div class="overview-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </div>
                    <div>
                        <h3>Response Standards</h3>
                        <p>Staff review is handled manually, so please allow time for record checks, documentation help, and technical support to be reviewed properly.</p>
                    </div>
                </div>
            </div>

            <div class="contacts-grid">
                <div class="contact-section" v-if="management.length > 0">
                    <div class="section-header">
                        <div class="section-heading">
                            <div class="section-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <div>
                                <h2>Management</h2>
                                <p class="section-desc">Leadership, list decisions, placements, and overall project direction.</p>
                            </div>
                        </div>
                        <span class="section-count">{{ management.length }} members</span>
                    </div>
                    <div class="editors-grid">
                        <div v-for="editor in management" :key="editor.name" class="editor-card">
                            <div class="editor-avatar">
                                <img :src="'assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role">
                            </div>
                            <div class="editor-info">
                                <a v-if="editor.link" :href="editor.link" target="_blank" class="editor-name">{{ editor.name }}</a>
                                <span v-else class="editor-name">{{ editor.name }}</span>
                                <span class="editor-role">{{ roleLabels[editor.role] }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="contact-section" v-if="support.length > 0">
                    <div class="section-header">
                        <div class="section-heading">
                            <div class="section-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 16v-4"/>
                                    <path d="M12 8h.01"/>
                                </svg>
                            </div>
                            <div>
                                <h2>Record Support</h2>
                                <p class="section-desc">Contact this team for submission questions, rejected record clarification, and review guidance.</p>
                            </div>
                        </div>
                        <span class="section-count">{{ support.length }} members</span>
                    </div>
                    <div class="editors-grid">
                        <div v-for="editor in support" :key="editor.name" class="editor-card">
                            <div class="editor-avatar">
                                <img :src="'assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role">
                            </div>
                            <div class="editor-info">
                                <a v-if="editor.link" :href="editor.link" target="_blank" class="editor-name">{{ editor.name }}</a>
                                <span v-else class="editor-name">{{ editor.name }}</span>
                                <span class="editor-role">{{ roleLabels[editor.role] }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="contact-section wide" v-if="developers.length > 0">
                    <div class="section-header">
                        <div class="section-heading">
                            <div class="section-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="16 18 22 12 16 6"/>
                                    <polyline points="8 6 2 12 8 18"/>
                                </svg>
                            </div>
                            <div>
                                <h2>Development Team</h2>
                                <p class="section-desc">Website maintenance, technical improvements, backend support, and interface updates.</p>
                            </div>
                        </div>
                        <span class="section-count">{{ developers.length }} members</span>
                    </div>
                    <div class="editors-grid">
                        <div v-for="editor in developers" :key="editor.name" class="editor-card">
                            <div class="editor-avatar">
                                <img :src="'assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role">
                            </div>
                            <div class="editor-info">
                                <a v-if="editor.link" :href="editor.link" target="_blank" class="editor-name">{{ editor.name }}</a>
                                <span v-else class="editor-name">{{ editor.name }}</span>
                                <span class="editor-role">{{ roleLabels[editor.role] }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="discord-cta">
                <div class="cta-icon">
                    <img src="assets/discord.svg" width="48" height="48" alt="Discord">
                </div>
                <div class="cta-content">
                    <h3>Join our Discord</h3>
                    <p>Fastest way to get in touch with the team, ask questions, and stay updated with the community.</p>
                    <a href="https://discord.gg/geometrydash" target="_blank" class="btn btn-primary">Join Server</a>
                </div>
            </div>
        </main>
        <main v-else class="page-contacts">
            <div class="contacts-hero">
                <div class="contacts-kicker">Official Team Directory</div>
                <h1>Contacts</h1>
                <p class="subtitle">No team members found</p>
            </div>
        </main>
    `,
    computed: {
        management() {
            if (!this.editors || !Array.isArray(this.editors)) return [];
            return this.editors.filter(e => e && (e.role === 'owner' || e.role === 'admin'));
        },
        support() {
            if (!this.editors || !Array.isArray(this.editors)) return [];
            return this.editors.filter(e => e && (e.role === 'helper' || e.role === 'trial'));
        },
        developers() {
            if (!this.editors || !Array.isArray(this.editors)) return [];
            return this.editors.filter(e => e && e.role === 'dev');
        }
    },
    async mounted() {
        try {
            const result = await fetchEditors();
            this.editors = Array.isArray(result) ? result : [];
            console.log('Loaded editors:', this.editors);
        } catch (err) {
            console.error('Failed to load editors:', err);
            this.error = 'Failed to load team members';
            this.editors = [];
        } finally {
            this.loading = false;
        }
    }
};
