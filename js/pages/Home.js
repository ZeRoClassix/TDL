export default {
    name: 'Home',
    data() {
        return {
            stats: {
                users: 0,
                records: 0,
                levels: 0
            },
            targetStats: {
                users: 435000,
                records: 100000,
                levels: 1700
            }
        };
    },
    mounted() {
        this.animateCounters();
    },
    methods: {
        animateCounters() {
            const duration = 1500; // 1.5 seconds
            const frameRate = 240;
            const totalFrames = (duration / 1000) * frameRate;
            let frame = 0;

            const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

            const animate = () => {
                frame++;
                const progress = Math.min(frame / totalFrames, 1);
                const easedProgress = easeOutQuart(progress);

                this.stats.users = Math.round(this.targetStats.users * easedProgress);
                this.stats.records = Math.round(this.targetStats.records * easedProgress);
                this.stats.levels = Math.round(this.targetStats.levels * easedProgress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        },
        formatNumber(num) {
            return num.toLocaleString() + '+';
        }
    },
    template: `
        <main class="page-home" style="display: block; overflow-y: auto; height: 100%;">
            <div class="home-container">
                <!-- HERO SECTION -->
                <section class="hero-section">
                    <h1 class="hero-title">GD DEMONLIST</h1>
                    <p class="hero-tagline">The most complete and trusted ranking of the hardest Geometry Dash demons, maintained by a dedicated community.</p>
                    
                    <div class="hero-stats">
                        <div class="stat-box">
                            <h3 class="stat-number">{{ formatNumber(stats.users) }}</h3>
                            <p class="stat-label">USERS</p>
                        </div>
                        <div class="stat-box">
                            <h3 class="stat-number">{{ formatNumber(stats.records) }}</h3>
                            <p class="stat-label">RECORDS</p>
                        </div>
                        <div class="stat-box">
                            <h3 class="stat-number">{{ formatNumber(stats.levels) }}</h3>
                            <p class="stat-label">LEVELS</p>
                        </div>
                    </div>

                    <div class="hero-actions">
                        <router-link to="/demonlist" class="btn btn-primary">Explore the List &rarr;</router-link>
                        <router-link to="/submit" class="btn btn-secondary">
                            Submit a record 
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 6px; display: inline-block;">
                                <path d="M4 4h16v4L16 11v6l-4 4-4-4v-6L4 8V4z" />
                            </svg>
                        </router-link>
                        <button class="btn btn-secondary btn-disabled" data-tooltip="Coming in the future">Create List +</button>
                    </div>

                    <div class="hero-social-buttons">
                        <a href="#" class="btn-social">
                            <img src="assets/discord.svg" width="16" height="16" style="margin-right: 6px;"> Discord
                        </a>
                        <a href="#" class="btn-social">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg> YouTube
                        </a>
                        <a href="#" class="btn-social">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg> X
                        </a>
                    </div>
                </section>

                <!-- MIDDLE CONTENT: RECENT CHANGES & WHY -->
                <section class="home-middle">
                    <div class="home-col-left">
                        <div class="card recent-changes-card">
                            <div class="card-header">
                                <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Recent Changes</h3>
                            </div>
                            <div class="card-body">
                                <div class="changes-date-group">
                                    <div class="changes-date-label">24TH APRIL</div>
                                    <div class="change-item">
                                        <span class="change-icon icon-add" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="M5 12h14"/>
                                            </svg>
                                        </span>
                                        <strong>Dualist</strong> <span class="change-detail">placed at #92, between Terminal Rampancy and The Golden</span>
                                    </div>
                                </div>
                                <div class="changes-date-group">
                                    <div class="changes-date-label">19TH APRIL</div>
                                    <div class="change-item">
                                        <span class="change-icon icon-add" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="M5 12h14"/>
                                            </svg>
                                        </span>
                                        <strong>zorin</strong> <span class="change-detail">placed at #29, between CHIL and Sakupen Circles</span>
                                    </div>
                                    <div class="change-item">
                                        <span class="change-icon icon-add" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="M5 12h14"/>
                                            </svg>
                                        </span>
                                        <strong>NOMAD</strong> <span class="change-detail">placed at #38, between Silentlocked and poocubed</span>
                                    </div>
                                    <div class="change-item">
                                        <span class="change-icon icon-add" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="M5 12h14"/>
                                            </svg>
                                        </span>
                                        <strong>Diabolic ClubStep</strong> <span class="change-detail">placed at #80, between BEELINE and Sonic Wave Infinity</span>
                                    </div>
                                    <div class="change-item">
                                        <span class="change-icon icon-add" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="M5 12h14"/>
                                            </svg>
                                        </span>
                                        <strong>TrakineS</strong> <span class="change-detail">placed at #71, between ORDINARY and Loops of Fury</span>
                                    </div>
                                </div>
                                <div class="changes-date-group">
                                    <div class="changes-date-label">18TH APRIL</div>
                                    <div class="change-item">
                                        <span class="change-icon icon-down" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="m18 13-6 6-6-6"/>
                                            </svg>
                                        </span>
                                        <strong>ORDINARY</strong> <span class="change-detail">moved from #68 to #70, between Climax and TrakineS</span>
                                    </div>
                                    <div class="change-item">
                                        <span class="change-icon icon-down" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="m18 13-6 6-6-6"/>
                                            </svg>
                                        </span>
                                        <strong>The Golden</strong> <span class="change-detail">moved from #90 to #92, between Terminal Rampancy and Oblivion</span>
                                    </div>
                                    <div class="change-item">
                                        <span class="change-icon icon-down" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="m18 13-6 6-6-6"/>
                                            </svg>
                                        </span>
                                        <strong>UNKNOWN</strong> <span class="change-detail">moved from #95 to #98, between Levigo and ATOMIC CANNON Mk III</span>
                                    </div>
                                    <div class="change-item">
                                        <span class="change-icon icon-down" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="m18 13-6 6-6-6"/>
                                            </svg>
                                        </span>
                                        <strong>Henken</strong> <span class="change-detail">moved from #110 to #114, between Starlit Stroll and Trueffet</span>
                                    </div>
                                    <div class="change-item">
                                        <span class="change-icon icon-down" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="m18 13-6 6-6-6"/>
                                            </svg>
                                        </span>
                                        <strong>Trueffet</strong> <span class="change-detail">moved from #112 to #115, between Henken and Kenos</span>
                                    </div>
                                    <div class="change-item">
                                        <span class="change-icon icon-down" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 5v14"/>
                                                <path d="m18 13-6 6-6-6"/>
                                            </svg>
                                        </span>
                                        <strong>Kenos</strong> <span class="change-detail">moved from #114 to #116, between Trueffet and Fragile</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="home-col-right">
                        <div class="card why-card">
                            <div class="card-header">
                                <h3>Why PCDemonlist?</h3>
                            </div>
                            <div class="card-body">
                                <div class="why-item">
                                    <div class="why-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M12 3l7 3v5c0 4.5-2.9 7.6-7 10-4.1-2.4-7-5.5-7-10V6l7-3z"/>
                                            <path d="M9.5 12.5l1.7 1.7 3.8-4.2"/>
                                        </svg>
                                    </div>
                                    <div class="why-text">
                                        <h4>What Is PCDemonlist?</h4>
                                        <p>PCDemonlist is the official competitive demonlist platform for Geometry Dash, built to rank the hardest extreme demons and document the records achieved on them with consistency and credibility. It brings together list placements, player progress, submissions, and policy information in one professional standard designed for accuracy, transparency, and long-term archival value.</p>
                                    </div>
                                </div>
                                <div class="why-item">
                                    <div class="why-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M4 20h16"/>
                                            <path d="M7 16V9"/>
                                            <path d="M12 16V5"/>
                                            <path d="M17 16v-3"/>
                                        </svg>
                                    </div>
                                    <div class="why-text">
                                        <h4>Ranking Without Limits</h4>
                                        <p>PCDemonlist highlights every rateworthy extreme demon that deserves competitive recognition, not just the most obvious picks. That wider coverage gives emerging levels real visibility while keeping the rankings current, ambitious, and representative of the scene as a whole.</p>
                                    </div>
                                </div>
                                <div class="why-item">
                                    <div class="why-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M3 20h18"/>
                                            <path d="M6 16l4-5 3 2 5-7"/>
                                            <path d="M18 6v3h-3"/>
                                        </svg>
                                    </div>
                                    <div class="why-text">
                                        <h4>Leaderboards</h4>
                                        <p>Players can measure their performance against competitors around the world through a leaderboard that rewards meaningful accomplishments. Country representation, point totals, and completion history are presented in a way that makes competitive progress easy to follow.</p>
                                    </div>
                                </div>
                                <div class="why-item">
                                    <div class="why-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M12 4l7 3.5-7 3.5-7-3.5L12 4z"/>
                                            <path d="M5 12l7 3.5 7-3.5"/>
                                            <path d="M5 16l7 4 7-4"/>
                                        </svg>
                                    </div>
                                    <div class="why-text">
                                        <h4>Reflection Of The Competitive Scene</h4>
                                        <p>Our points structure is built to value the quality and significance of an achievement instead of rewarding quantity alone. The result is a ranking system that better reflects real competitive impact across the hardest parts of Geometry Dash.</p>
                                    </div>
                                </div>
                                <div class="why-item">
                                    <div class="why-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M6 3h9a3 3 0 0 1 3 3v15l-4-2-4 2-4-2-4 2V6a3 3 0 0 1 3-3h1"/>
                                            <path d="M8 7h6"/>
                                            <path d="M8 11h8"/>
                                            <path d="M8 15h5"/>
                                        </svg>
                                    </div>
                                    <div class="why-text">
                                        <h4>Detailed Documentation</h4>
                                        <p>PCDemonlist is backed by clear guidelines covering submissions, placements, and content policy. That documentation makes standards easier to understand for players, moderators, creators, and anyone following the evolution of the list.</p>
                                    </div>
                                </div>
                                <div class="why-item">
                                    <div class="why-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M4 6h16"/>
                                            <path d="M7 12h10"/>
                                            <path d="M10 18h4"/>
                                        </svg>
                                    </div>
                                    <div class="why-text">
                                        <h4>Level Filters</h4>
                                        <p>Smart filters make it easier to search for specific types of demons, compare sections of the list, and discover levels that match a player's interests or goals. The browsing experience stays practical without losing depth.</p>
                                    </div>
                                </div>
                                <div class="why-item">
                                    <div class="why-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="8"/>
                                            <path d="M12 8v4l2.5 2.5"/>
                                        </svg>
                                    </div>
                                    <div class="why-text">
                                        <h4>Time Machine</h4>
                                        <p>Historic snapshots allow players to revisit earlier versions of the list and follow how placements changed over time. It adds context to modern rankings and preserves an important part of Geometry Dash history.</p>
                                    </div>
                                </div>
                                <div class="why-item">
                                    <div class="why-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="9"/>
                                            <path d="M3 12h18"/>
                                            <path d="M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9z"/>
                                        </svg>
                                    </div>
                                    <div class="why-text">
                                        <h4>Multilingual Accessibility</h4>
                                        <p>By supporting multiple languages, PCDemonlist can serve a broader competitive audience and make its standards easier to access across regions. That helps more players engage with the list confidently and accurately.</p>
                                    </div>
                                </div>
                                <div class="why-item">
                                    <div class="why-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.5"/>
                                            <path d="M16 3.5a4 4 0 0 1 0 7"/>
                                        </svg>
                                    </div>
                                    <div class="why-text">
                                        <h4>Community Driven</h4>
                                        <p>Every record, review, and placement is supported by people who actively care about keeping the list fair and trustworthy. That community-driven model keeps PCDemonlist responsive to the scene while maintaining a high standard of review.</p>
                                    </div>
                                </div>
                                
                                <div class="why-cta-container">
                                    <p>Ready to dive in?</p>
                                    <router-link to="/demonlist" class="btn btn-secondary">View the Demon List &rarr;</router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SITE UPDATES -->
                <section class="home-bottom">
                    <div class="card updates-card">
                        <div class="card-header">
                            <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg> Site Updates</h3>
                        </div>
                        <div class="card-body">
                            <div class="update-item">
                                <div class="update-date">2026-04-18</div>
                                <div class="update-content">
                                    <h4>New Site Redesign</h4>
                                    <ul>
                                        <li>Full visual redesign across the site with a more modern interface, improved hierarchy, and a cleaner dark presentation.</li>
                                        <li>New home page experience featuring animated statistics, refined branding, improved feature sections, and a more polished content layout.</li>
                                        <li>Complete player ranking overhaul with a modern profile dashboard, improved readability, and integrated future demon progress cards.</li>
                                        <li>Future Demons pages enhanced with better presentation, clearer record cards, and status styling for buffed and nerfed progress entries.</li>
                                        <li>Demonlist, Guidelines, and Contacts pages redesigned for stronger readability, cleaner navigation, and a more consistent visual language.</li>
                                        <li>Footer, changelog, and informational sections refined with updated spacing, cleaner iconography, and a more professional presentation throughout.</li>
                                        <li>Background artwork and visual atmosphere added to major pages including Home, Demonlist, and Leaderboard.</li>
                                        <li>Player flag rendering and multiple interface details were corrected to improve consistency across the site.</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="update-item">
                                <div class="update-date">2026-04-17</div>
                                <div class="update-content">
                                    <h4>Landing Page & Improvements</h4>
                                    <ul>
                                        <li>Introduced the new landing page with a clearer feature overview, live changelog coverage, and a stronger first-time browsing experience.</li>
                                        <li>Position History support was expanded so historical placement tracking works beyond the top 150 and covers the full list more reliably.</li>
                                        <li>Compact list browsing improved with detailed level information on hover and better context while scanning the list.</li>
                                        <li>Level verifiers are now shown directly in the list, making verification context easier to identify at a glance.</li>
                                        <li>Registration flow updated so Guidelines confirmation is required during account creation.</li>
                                        <li>Rejected records no longer appear on other players' profiles, improving accuracy and reducing clutter.</li>
                                        <li>Added the Privacy Policy page alongside a broader set of quality-of-life and interface refinements.</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="update-item">
                                <div class="update-date">2026-04-16</div>
                                <div class="update-content">
                                    <h4>API Documentation</h4>
                                    <ul>
                                        <li>Published full documentation for 16 public API endpoints covering players, demons, leaderboards, records, and statistics.</li>
                                        <li>Added structured example requests, response previews, and endpoint-specific reference content for easier integration.</li>
                                        <li>Documentation layout organized into modular sections with clearer navigation and improved readability.</li>
                                        <li>Available in three languages: English, Russian, and Spanish.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
            </div>
        </main>
    `
};



