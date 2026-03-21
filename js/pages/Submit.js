/**
 * Submit.js – In-site Record Submission Page
 *
 * UI-only prototype. No backend is called.
 * To wire up to a real backend, search for:
 *   // BACKEND: connect to your API here
 *
 * Reads level data from the existing /data/_list.json + /data/{id}.json
 * to power the demon dropdown and player autocomplete.
 *
 * Intentionally does NOT touch List.js, Leaderboard.js, Roulette.js,
 * content.js, score.js, or any data files.
 */

import { store } from '../main.js';
import Spinner from '../components/Spinner.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Basic URL validation */
function isValidUrl(str) {
    try { new URL(str); return true; }
    catch { return false; }
}

/** Normalise a string for fuzzy matching */
function norm(s) { return s.toLowerCase().trim(); }

// ─── Component ──────────────────────────────────────────────────────────────

export default {
    components: { Spinner },

    template: `
        <main class="page-submit" :class="{ dark: store.dark }">
            <!-- Full-page loading while we read level data -->
            <div v-if="loading" style="display:flex;align-items:center;justify-content:center;height:100%;grid-column:1/-1;">
                <Spinner/>
            </div>

            <div v-else class="submit-wrapper">

                <!-- ── Page heading ───────────────────────── -->
                <div class="submit-heading">
                    <h1>Submit a Record</h1>
                    <p>
                        Submit your completion or progress on a demon from the
                        <strong>Top 150</strong>. All submissions are reviewed by list staff
                        before appearing on the site. Make sure to read the
                        requirements carefully.
                    </p>
                </div>

                <!-- ── Status banner ─────────────────────── -->
                <div v-if="banner" :class="['submit-banner', banner.type]" style="margin-bottom:0.5rem;">
                    {{ banner.msg }}
                </div>

                <!-- ── Main form card ────────────────────── -->
                <div class="submit-card">
                    <div class="submit-card__header">
                        <h2>Record Details</h2>
                    </div>
                    <form class="submit-card__body" @submit.prevent="handleSubmit" novalidate>

                        <!-- 1 ── Demon ─────────────────────────────── -->
                        <div class="submit-field">
                            <label for="field-demon">Demon <span class="required">*</span></label>
                            <div class="submit-dropdown" :class="{ 'is-open': demonOpen }">
                                <!-- Trigger button -->
                                <button
                                    type="button"
                                    class="dropdown-trigger"
                                    :class="{ 'is-error': errors.demon }"
                                    @click="toggleDemonDropdown"
                                    @keydown.escape="demonOpen = false"
                                    id="field-demon"
                                    :aria-expanded="demonOpen"
                                >
                                    <span>{{ selectedDemon ? '#' + selectedDemon.rank + ' – ' + selectedDemon.name : 'Select a demon…' }}</span>
                                    <svg class="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                                    </svg>
                                </button>

                                <!-- Dropdown panel -->
                                <div v-if="demonOpen" class="dropdown-panel" v-click-outside="() => demonOpen = false">
                                    <div class="dropdown-search">
                                        <input
                                            type="text"
                                            v-model="demonSearch"
                                            placeholder="Search demons…"
                                            ref="demonSearchInput"
                                            @keydown.escape="demonOpen = false"
                                            id="demon-search-input"
                                        />
                                    </div>
                                    <div class="dropdown-list">
                                        <div
                                            v-if="filteredDemons.length === 0"
                                            class="dropdown-empty"
                                        >No demons match "{{ demonSearch }}"</div>
                                        <div
                                            v-for="demon in filteredDemons"
                                            :key="demon.rank"
                                            class="dropdown-item"
                                            @click="pickDemon(demon)"
                                            :class="{ 'is-focused': selectedDemon && selectedDemon.rank === demon.rank }"
                                        >
                                            <span class="item-rank">#{{ demon.rank }}</span>
                                            <span>{{ demon.name }}</span>
                                            <span class="item-req">≥{{ demon.percentToQualify }}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p v-if="errors.demon" class="field-error">{{ errors.demon }}</p>
                            <p class="field-hint">Only Top 150 main-list demons are accepted. Legacy demons are excluded.</p>
                        </div>

                        <hr class="submit-divider"/>

                        <!-- 2 ── Holder ────────────────────────────── -->
                        <div class="submit-field">
                            <label for="field-holder">Holder <span class="required">*</span></label>
                            <div class="submit-autocomplete">
                                <input
                                    type="text"
                                    id="field-holder"
                                    v-model="form.holder"
                                    placeholder="Your in-game name"
                                    autocomplete="off"
                                    :class="{ 'is-error': errors.holder, 'is-valid': form.holder && !errors.holder }"
                                    @input="onHolderInput"
                                    @focus="holderFocus = true"
                                    @blur="onHolderBlur"
                                    @keydown.escape="holderFocus = false"
                                />
                                <!-- Suggestions panel -->
                                <div
                                    v-if="holderFocus && holderSuggestions.length > 0"
                                    class="autocomplete-panel"
                                >
                                    <div
                                        v-for="name in holderSuggestions"
                                        :key="name"
                                        class="autocomplete-item"
                                        @mousedown.prevent="pickHolder(name)"
                                    >{{ name }}</div>
                                    <!-- Always show "new player" hint if exact match isn't found -->
                                    <div
                                        v-if="!exactHolderMatch"
                                        class="autocomplete-new"
                                        @mousedown.prevent="holderFocus = false"
                                    >
                                        New player: <strong>{{ form.holder }}</strong>
                                    </div>
                                </div>
                            </div>
                            <p v-if="errors.holder" class="field-error">{{ errors.holder }}</p>
                            <p class="field-hint">
                                Start typing to see existing player suggestions.
                                If this is your first submission, just type your name.
                            </p>
                        </div>

                        <hr class="submit-divider"/>

                        <!-- 3 ── Progress ─────────────────────────── -->
                        <div class="submit-field">
                            <label for="field-progress">Progress <span class="required">*</span></label>
                            <div class="progress-row">
                                <input
                                    type="number"
                                    id="field-progress"
                                    v-model.number="form.progress"
                                    :min="progressMin"
                                    max="100"
                                    placeholder="%"
                                    :class="{ 'is-error': errors.progress, 'is-valid': progressValid }"
                                    @input="errors.progress = ''"
                                />
                                <div class="progress-meter" aria-hidden="true">
                                    <div class="progress-meter-fill" :style="{ width: progressBarWidth }"></div>
                                </div>
                                <span style="font-size:0.9rem;font-weight:700;color:var(--color-primary);white-space:nowrap;">
                                    {{ form.progress || 0 }} %
                                </span>
                            </div>
                            <p v-if="errors.progress" class="field-error">{{ errors.progress }}</p>
                            <p class="field-hint" v-if="selectedDemon">
                                Minimum required for
                                <strong>{{ selectedDemon.name }}</strong>:
                                <strong style="color:var(--color-primary)">{{ progressMin }}%</strong>.
                                Enter 100 for a full completion.
                            </p>
                            <p class="field-hint" v-else>Select a demon first to see the minimum percent.</p>
                        </div>

                        <hr class="submit-divider"/>

                        <!-- 4 ── Video ─────────────────────────────── -->
                        <div class="submit-field">
                            <label for="field-video">Proof Video <span class="required">*</span></label>
                            <input
                                type="url"
                                id="field-video"
                                v-model="form.video"
                                placeholder="https://youtu.be/…"
                                :class="{ 'is-error': errors.video, 'is-valid': form.video && !errors.video }"
                                @input="validateVideo"
                            />
                            <p v-if="errors.video" class="field-error">{{ errors.video }}</p>
                            <p class="field-hint">
                                Must be a publicly accessible video of the run.
                                YouTube links are preferred; Twitch clips and
                                other platforms are also accepted.
                            </p>
                        </div>

                        <hr class="submit-divider"/>

                        <!-- 5 ── Raw footage ──────────────────────── -->
                        <div class="submit-field">
                            <label for="field-raw">Raw Footage <span class="required">*</span></label>
                            <input
                                type="url"
                                id="field-raw"
                                v-model="form.raw"
                                placeholder="https://drive.google.com/…"
                                :class="{ 'is-error': errors.raw, 'is-valid': form.raw && !errors.raw }"
                                @input="validateRaw"
                            />
                            <p v-if="errors.raw" class="field-error">{{ errors.raw }}</p>
                            <p class="field-hint">
                                Unedited, untrimmed footage of the run
                                (e.g. Google Drive, Dropbox).
                                <strong>This is kept strictly confidential</strong>
                                and is only viewed by list staff to verify authenticity.
                                It will never be shared publicly.
                            </p>
                        </div>

                        <hr class="submit-divider"/>

                        <!-- 6 ── Notes ────────────────────────────── -->
                        <div class="submit-field">
                            <label for="field-notes">Notes or Comments</label>
                            <textarea
                                id="field-notes"
                                v-model="form.notes"
                                placeholder="Any additional context for the moderators… (optional)"
                                rows="4"
                            ></textarea>
                            <p class="field-hint">
                                Optional. Use this to flag anything unusual about
                                the run, mention a modified level ID, or leave
                                a message for staff.
                            </p>
                        </div>

                        <hr class="submit-divider"/>

                        <!-- Submit row -->
                        <div class="submit-actions">
                            <button type="submit" class="btn" :disabled="submitting" id="btn-submit-record">
                                {{ submitting ? 'Submitting…' : 'Submit Record' }}
                            </button>
                            <p class="submit-note">
                                By submitting you confirm that this record meets
                                all guidelines. False submissions may result in a ban.
                            </p>
                        </div>

                    </form>
                </div>

                <!-- ── Right sidebar ──────────────────────── -->
                <aside class="submit-sidebar">

                    <!-- Requirements -->
                    <div class="submit-info-card">
                        <div class="submit-info-card__header">
                            <h3>Requirements</h3>
                        </div>
                        <div class="submit-info-card__body">
                            <ul>
                                <li>No hacks (FPS bypass up to <strong>360fps</strong> is allowed)</li>
                                <li>Record must be on the <strong>listed level ID</strong></li>
                                <li>Video must include <strong>source audio or clicks</strong></li>
                                <li>A previous attempt and <strong>death animation</strong> must be visible before the completion (first attempt exempt)</li>
                                <li>Player must <strong>hit the end-wall</strong></li>
                                <li>No secret routes or easy modes</li>
                                <li>Legacy demons do <strong>not accept</strong> new records</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Review time -->
                    <div class="submit-info-card">
                        <div class="submit-info-card__header">
                            <h3>Review Process</h3>
                        </div>
                        <div class="submit-info-card__body">
                            Submissions are reviewed manually by list staff.
                            Typical review time is <strong>1–5 days</strong>.
                            You will not receive a notification unless your record
                            is rejected.
                        </div>
                    </div>

                    <!-- Raw footage note -->
                    <div class="submit-info-card">
                        <div class="submit-info-card__header">
                            <h3>About Raw Footage</h3>
                        </div>
                        <div class="submit-info-card__body">
                            Raw footage is <strong>never published</strong>.
                            It is used solely by staff to confirm authenticity.
                            Store it somewhere accessible for at least
                            <strong>30 days</strong> after submitting.
                        </div>
                    </div>

                    <!-- Contact -->
                    <div class="submit-info-card">
                        <div class="submit-info-card__header">
                            <h3>Questions?</h3>
                        </div>
                        <div class="submit-info-card__body">
                            Join our
                            <a href="https://discord.gg/geometrydash" target="_blank"
                               style="color:var(--color-primary);font-weight:700;">Discord server</a>
                            and ask in the #submissions channel.
                            Do <strong>not</strong> DM staff directly about a pending submission.
                        </div>
                    </div>

                </aside>
            </div>
        </main>
    `,

    data: () => ({
        store,

        // ── Loading state ────────────────────────────────
        loading: true,

        // ── Demon dropdown data ──────────────────────────
        // Top-150 demons loaded from _list.json + each level's JSON
        demons: [],           // [{ rank, name, percentToQualify, path }]
        demonOpen: false,
        demonSearch: '',
        selectedDemon: null,

        // ── Player autocomplete ──────────────────────────
        // Collected from all records across all demons
        allPlayers: [],       // unique player name strings
        holderFocus: false,

        // ── Form fields ──────────────────────────────────
        form: {
            holder:   '',
            progress: '',
            video:    '',
            raw:      '',
            notes:    '',
        },

        // ── Validation errors ────────────────────────────
        errors: {
            demon:    '',
            holder:   '',
            progress: '',
            video:    '',
            raw:      '',
        },

        // ── UI state ─────────────────────────────────────
        submitting: false,
        banner: null,         // { type: 'success'|'error', msg: '' }
    }),

    computed: {
        /** Filtered demon list for the search box */
        filteredDemons() {
            if (!this.demonSearch) return this.demons;
            const q = norm(this.demonSearch);
            return this.demons.filter(d =>
                norm(d.name).includes(q) || String(d.rank).includes(q)
            );
        },

        /** Player suggestions – up to 6 fuzzy matches */
        holderSuggestions() {
            if (!this.form.holder || this.form.holder.length < 1) return [];
            const q = norm(this.form.holder);
            return this.allPlayers
                .filter(p => norm(p).includes(q))
                .slice(0, 6);
        },

        /** Whether typed name exactly matches a known player */
        exactHolderMatch() {
            return this.allPlayers.some(p => norm(p) === norm(this.form.holder));
        },

        /** Minimum progress based on selected demon */
        progressMin() {
            return this.selectedDemon ? this.selectedDemon.percentToQualify : 1;
        },

        /** Progress bar fill width */
        progressBarWidth() {
            const v = Number(this.form.progress);
            if (!v || v < 0) return '0%';
            const fraction = Math.min(100, Math.max(0, (v - this.progressMin) / (100 - this.progressMin) * 100));
            return fraction + '%';
        },

        /** True if progress is in a valid range */
        progressValid() {
            const v = Number(this.form.progress);
            return this.form.progress !== '' && v >= this.progressMin && v <= 100;
        },
    },

    async mounted() {
        // ── Fetch top-150 data ──────────────────────────────────────────────
        // Re-uses the same data files as List.js; does not modify them.
        try {
            const listRes  = await fetch('/data/_list.json');
            const listJson = await listRes.json();

            // Only take the first 150 (indices 0-149 = main list, exclude legacy)
            const top150 = listJson.slice(0, 150);

            const playerSet = new Set();

            const results = await Promise.allSettled(
                top150.map(async (path, i) => {
                    const lvlRes  = await fetch(`/data/${path}.json`);
                    const lvl     = await lvlRes.json();

                    // Collect player names for autocomplete
                    if (lvl.verifier) playerSet.add(lvl.verifier);
                    (lvl.records || []).forEach(r => { if (r.user) playerSet.add(r.user); });

                    return {
                        rank:             i + 1,
                        name:             lvl.name,
                        percentToQualify: lvl.percentToQualify ?? 100,
                        path,
                    };
                })
            );

            this.demons = results
                .filter(r => r.status === 'fulfilled')
                .map(r => r.value);

            // Sort by rank (should already be ordered, but be safe)
            this.demons.sort((a, b) => a.rank - b.rank);

            this.allPlayers = [...playerSet].sort((a, b) => a.localeCompare(b));
        } catch (e) {
            console.error('[Submit] Failed to load level data:', e);
            this.banner = { type: 'error', msg: 'Could not load demon list. Please refresh and try again.' };
        }

        this.loading = false;
    },

    methods: {
        // ── Demon dropdown ──────────────────────────────────────────────────
        toggleDemonDropdown() {
            this.demonOpen = !this.demonOpen;
            if (this.demonOpen) {
                this.demonSearch = '';
                this.$nextTick(() => this.$refs.demonSearchInput?.focus());
            }
        },

        pickDemon(demon) {
            this.selectedDemon = demon;
            this.demonOpen     = false;
            this.errors.demon  = '';

            // Reset progress if it's now out of range
            if (this.form.progress !== '' &&
                Number(this.form.progress) < demon.percentToQualify) {
                this.form.progress = '';
            }
        },

        // ── Holder autocomplete ─────────────────────────────────────────────
        onHolderInput() {
            this.errors.holder = '';
        },

        onHolderBlur() {
            // Small delay so mousedown on suggestion fires first
            setTimeout(() => { this.holderFocus = false; }, 150);
        },

        pickHolder(name) {
            this.form.holder  = name;
            this.holderFocus  = false;
            this.errors.holder = '';
        },

        // ── Field validators ────────────────────────────────────────────────
        validateVideo() {
            const v = this.form.video.trim();
            if (!v) { this.errors.video = ''; return; }
            this.errors.video = isValidUrl(v) ? '' : 'Please enter a valid URL (e.g. https://youtu.be/…)';
        },

        validateRaw() {
            const v = this.form.raw.trim();
            if (!v) { this.errors.raw = ''; return; }
            this.errors.raw = isValidUrl(v) ? '' : 'Please enter a valid URL (e.g. a Google Drive share link)';
        },

        // ── Full-form validation ────────────────────────────────────────────
        validate() {
            let ok = true;

            if (!this.selectedDemon) {
                this.errors.demon = 'Please select a demon.';
                ok = false;
            }

            if (!this.form.holder.trim()) {
                this.errors.holder = 'Please enter the player name.';
                ok = false;
            }

            const prog = Number(this.form.progress);
            if (this.form.progress === '' || isNaN(prog)) {
                this.errors.progress = 'Please enter a percentage.';
                ok = false;
            } else if (prog < this.progressMin) {
                this.errors.progress = `Minimum progress for this demon is ${this.progressMin}%.`;
                ok = false;
            } else if (prog > 100) {
                this.errors.progress = 'Progress cannot exceed 100%.';
                ok = false;
            }

            const video = this.form.video.trim();
            if (!video) {
                this.errors.video = 'A proof video link is required.';
                ok = false;
            } else if (!isValidUrl(video)) {
                this.errors.video = 'Please enter a valid URL.';
                ok = false;
            }

            const raw = this.form.raw.trim();
            if (!raw) {
                this.errors.raw = 'A raw footage link is required.';
                ok = false;
            } else if (!isValidUrl(raw)) {
                this.errors.raw = 'Please enter a valid URL.';
                ok = false;
            }

            return ok;
        },

        // ── Submit handler ──────────────────────────────────────────────────
        async handleSubmit() {
            this.banner = null;
            if (!this.validate()) {
                this.banner = { type: 'error', msg: 'Please fix the highlighted fields before submitting.' };
                return;
            }

            this.submitting = true;

            // ── BACKEND: connect to your API here ──────────────────────────
            // Replace this block with a real fetch() call, e.g.:
            //
            //   const res = await fetch('/api/submit', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //       demon:    this.selectedDemon.path,
            //       holder:   this.form.holder.trim(),
            //       progress: Number(this.form.progress),
            //       video:    this.form.video.trim(),
            //       raw:      this.form.raw.trim(),
            //       notes:    this.form.notes.trim(),
            //     }),
            //   });
            //   if (!res.ok) throw new Error(await res.text());
            //
            // ── end BACKEND block ──────────────────────────────────────────

            // Simulated 800ms "processing" delay for UI prototype
            await new Promise(r => setTimeout(r, 800));

            this.submitting = false;
            this.banner = {
                type: 'success',
                msg: `✓ Record submitted! "${this.selectedDemon.name}" – ${this.form.progress}% by ${this.form.holder}. Staff will review it shortly.`,
            };

            // Reset form
            this.selectedDemon = null;
            this.form = { holder: '', progress: '', video: '', raw: '', notes: '' };
            this.errors = { demon: '', holder: '', progress: '', video: '', raw: '' };
        },
    },
};
