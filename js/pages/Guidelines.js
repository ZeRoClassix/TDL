export default {
    template: `
        <main class="page-guidelines">
            <div class="guidelines-hero">
                <div class="guidelines-kicker">Official Policy Reference</div>
                <h1>Guidelines</h1>
                <p class="subtitle">Everything you need to know about the PCDemonlist</p>
                <div class="guidelines-highlights">
                    <div class="guidelines-highlight">
                        <span class="highlight-label">Coverage</span>
                        <strong>Top 150 Standards</strong>
                    </div>
                    <div class="guidelines-highlight">
                        <span class="highlight-label">Review</span>
                        <strong>Manual Staff Verification</strong>
                    </div>
                    <div class="guidelines-highlight">
                        <span class="highlight-label">Focus</span>
                        <strong>Submission, Records, Points</strong>
                    </div>
                </div>
            </div>

            <div class="guidelines-grid">
                <!-- Section 1: General Rules -->
                <div class="guideline-card">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </div>
                    <h2>General Rules</h2>
                    <div class="card-content">
                        <div class="rule-item">
                            <span class="rule-number">01</span>
                            <p>Records must be achieved on the listed version of the level</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">02</span>
                            <p>All records require video proof with visible end screen</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">03</span>
                            <p>No speed hacks, noclip, or any form of cheating</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">04</span>
                            <p>Records must be submitted within 2 weeks of completion</p>
                        </div>
                    </div>
                </div>

                <!-- Section 2: Submission Guidelines -->
                <div class="guideline-card">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <h2>Submission Guidelines</h2>
                    <div class="card-content">
                        <div class="rule-item">
                            <span class="rule-number">01</span>
                            <p>Use the official submission form on this website</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">02</span>
                            <p>YouTube videos are preferred, but other platforms are accepted</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">03</span>
                            <p>Raw footage is required for top 10 placements</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">04</span>
                            <p>Mobile records must show hand cam or device frame</p>
                        </div>
                    </div>
                </div>

                <!-- Section 3: Qualification -->
                <div class="guideline-card">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>
                    <h2>Qualification</h2>
                    <div class="card-content">
                        <div class="rule-item">
                            <span class="rule-number">01</span>
                            <p>Main List (1-75): specific % completion required</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">02</span>
                            <p>Extended List (76-150): specific % completion required</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">03</span>
                            <p>Legacy List: specific % to qualify</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">04</span>
                            <p>Click sync must be clearly audible in the video</p>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Points System -->
                <div class="guideline-card">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M2 12h20"/>
                        </svg>
                    </div>
                    <h2>Points System</h2>
                    <div class="card-content">
                        <div class="rule-item">
                            <span class="rule-number">01</span>
                            <p>Points are awarded based on level difficulty and placement</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">02</span>
                            <p>Verifiers receive full points for 100% completion</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">03</span>
                            <p>100% records grant more points than partial completions</p>
                        </div>
                        <div class="rule-item">
                            <span class="rule-number">04</span>
                            <p>Leaderboard updates automatically with new submissions</p>
                        </div>
                    </div>
                </div>

                <!-- Section 5: Contact -->
                <div class="guideline-card wide">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </div>
                    <h2>Contact & Support</h2>
                    <div class="card-content contact-grid">
                        <div class="contact-item">
                            <strong>List Questions</strong>
                            <p>Contact kaoas, binary, or casamio for list-related inquiries</p>
                        </div>
                        <div class="contact-item">
                            <strong>Record Issues</strong>
                            <p>Contact znassPCD, pyantCARRY for rejected record questions</p>
                        </div>
                        <div class="contact-item">
                            <strong>Technical Support</strong>
                            <p>Contact xasit or verOPP for website-related issues</p>
                        </div>
                        <div class="contact-item">
                            <strong>Discord</strong>
                            <p>Join our Discord server for fastest responses</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `
};
