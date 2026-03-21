import { store } from '../main.js';

export default {
    template: `
        <main class="page-mod" :class="{ dark: store.dark }">
            <div class="mod-wrapper">
                
                <!-- Access Denied -->
                <div v-if="!store.user || store.user.role !== 'moderator'" class="auth-error" style="text-align:center; padding: 5rem 0;">
                    <h2 style="font-size: 2rem; color: #dc3545; margin-bottom: 1rem;">Access Denied</h2>
                    <p>You must be logged in as a moderator to view this dashboard.</p>
                </div>

                <!-- Mod Dashboard -->
                <div v-else class="mod-dashboard">
                    <header class="mod-header">
                        <h1>Moderator Dashboard</h1>
                        <p style="color:var(--text-muted)">Welcome back, <strong>{{ store.user.username }}</strong></p>
                    </header>

                    <!-- Tips Panel -->
                    <section v-if="showTips" class="mod-tips">
                        <div class="mod-tips__header">
                            <h2>🛡️ Moderator Guidance</h2>
                            <button @click="dismissTips" class="btn-close" aria-label="Close tips" title="Dismiss">✕</button>
                        </div>
                        <ul class="mod-tips__list">
                            <li><strong>Approve</strong> only if the video/proof satisfies all list requirements.</li>
                            <li><strong>Reject</strong> submissions with invalid progress, broken links, or disallowed hacks.</li>
                            <li>Use the dropdown filter to view <strong>All Pending</strong> submissions or just those <strong>Assigned to Me</strong>.</li>
                            <li>Hover over the Approve/Reject buttons to see tooltips explaining these actions.</li>
                        </ul>
                    </section>

                    <!-- Controls: Filter -->
                    <div class="mod-controls">
                        <h3>Submissions Queue</h3>
                        <div class="mod-filter">
                            <label for="filter-select" style="margin-right: 0.5rem; font-weight:600;">Filter:</label>
                            <select id="filter-select" v-model="filter">
                                <option value="all">All Pending</option>
                                <option value="assigned">Assigned to Me</option>
                            </select>
                        </div>
                    </div>

                    <!-- Queue List -->
                    <div class="mod-queue">
                        <div v-if="filteredRecords.length === 0" style="padding: 2rem; text-align:center; background:var(--bg-content); border-radius:var(--radius-md);">
                            <p>No submissions found.</p>
                        </div>

                        <div v-for="record in filteredRecords" :key="record.id" class="mod-queue-item">
                            <div class="mod-item-details">
                                <div class="mod-item-title">
                                    <strong>#{{ record.demonRank }} {{ record.demon }}</strong> 
                                    <span style="opacity:0.8">by</span> {{ record.player }} 
                                    <span style="color:var(--color-primary); font-weight:800; margin-left: 0.5rem;">{{ record.progress }}%</span>
                                </div>
                                <div class="mod-item-meta">
                                    <span class="mod-badge" :class="record.status">{{ record.status }}</span>
                                    <span>Date: {{ record.date }}</span>
                                    <span>
                                        Proof: <a :href="record.video" target="_blank" style="color:var(--color-primary)">Watch Video</a>
                                    </span>
                                    <span v-if="record.assignedTo">
                                        Assignee: <strong>{{ record.assignedTo }}</strong>
                                    </span>
                                </div>
                            </div>
                            
                            <div class="mod-item-actions">
                                <button 
                                    class="btn-action btn-approve" 
                                    data-tooltip="Mark as verified and add to the list"
                                    @click="approve(record)"
                                    :disabled="record.status !== 'pending'"
                                    :style="{ opacity: record.status !== 'pending' ? 0.5 : 1, cursor: record.status !== 'pending' ? 'not-allowed' : 'pointer' }"
                                >
                                    Approve
                                </button>
                                <button 
                                    class="btn-action btn-reject" 
                                    data-tooltip="Reject submission (invalid proof)"
                                    @click="reject(record)"
                                    :disabled="record.status !== 'pending'"
                                    :style="{ opacity: record.status !== 'pending' ? 0.5 : 1, cursor: record.status !== 'pending' ? 'not-allowed' : 'pointer' }"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- BACKEND CONNECTION NOTE -->
                    <!-- 
                    To connect to a backend: 
                    1. In mounted(), fetch records from GET /api/submissions 
                    2. In approve(record), POST /api/submissions/:id/approve 
                    3. In reject(record), POST /api/submissions/:id/reject 
                    -->
                </div>
            </div>
        </main>
    `,

    data() {
        return {
            store,
            showTips: localStorage.getItem('hideModTips') !== 'true',
            filter: 'all',
            // Mock submissions data
            records: [
                { id: 101, player: 'TopPlayerX', demon: 'Bloodbath', demonRank: 15, progress: 100, video: 'https://youtube.com', date: '2024-05-12', status: 'pending', assignedTo: null },
                { id: 102, player: 'NoobMaster', demon: 'Sonic Wave', demonRank: 8, progress: 54, video: 'https://youtube.com', date: '2024-05-14', status: 'pending', assignedTo: 'ModTest' },
                { id: 103, player: 'ProDasher', demon: 'Yatagarasu', demonRank: 12, progress: 100, video: 'https://youtube.com', date: '2024-05-15', status: 'pending', assignedTo: 'ModTest' }
            ]
        };
    },

    computed: {
        filteredRecords() {
            if (this.filter === 'assigned') {
                return this.records.filter(r => r.assignedTo === this.store.user?.username);
            }
            return this.records;
        }
    },

    methods: {
        dismissTips() {
            this.showTips = false;
            localStorage.setItem('hideModTips', 'true');
        },
        approve(record) {
            record.status = 'verified';
            // Here you would also call an API to approve the record
            // e.g. await fetch('/api/approve/' + record.id, { method: 'POST' });
        },
        reject(record) {
            record.status = 'rejected';
            // Here you would also call an API to reject the record
            // e.g. await fetch('/api/reject/' + record.id, { method: 'POST' });
        }
    }
};
