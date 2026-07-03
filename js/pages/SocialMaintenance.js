export default {
    template: `
        <main class="page-social-maintenance-wrapper" style="display: block; overflow-y: auto; height: 100%;">
            <div class="page-social-maintenance">
                <div class="maintenance-container">
                    <div class="glow-bg"></div>
                    <div class="maintenance-content">
                        <div class="icon-container">
                            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="maintenance-icon">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </div>
                        <h1 class="maintenance-title">Social Tab Under Maintenance</h1>
                        <div class="maintenance-divider"></div>
                        <p class="maintenance-text">
                            This part of the site is currently undergoing major updates and maintenance. We are working hard to bring you a better, faster, and more engaging social experience.
                        </p>
                        <p class="maintenance-subtext">
                            The Social tab will return soon with new features, improved performance, and a completely refreshed interface. Thank you for your patience while our developers work their magic!
                        </p>
                        
                        <div class="maintenance-actions">
                            <router-link to="/" class="btn-prominent-blue" style="display:inline-flex; align-items:center; gap:8px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                Return Home
                            </router-link>
                            <router-link to="/demonlist" class="btn btn-secondary" style="display:inline-flex; align-items:center; gap:8px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                View Demonlist
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `,
    mounted() {
        // Add specific styles for this page
        if (!document.getElementById('social-maintenance-style')) {
            const style = document.createElement('style');
            style.id = 'social-maintenance-style';
            style.innerHTML = `
                .page-social-maintenance {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: calc(100vh - 120px);
                    padding: 2rem;
                }
                .maintenance-container {
                    position: relative;
                    max-width: 700px;
                    width: 100%;
                    background: rgba(13, 17, 28, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 4rem 3rem;
                    text-align: center;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }
                .glow-bg {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at top, rgba(56, 114, 255, 0.15) 0%, transparent 60%);
                    pointer-events: none;
                    z-index: 0;
                }
                .maintenance-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .icon-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 110px;
                    height: 110px;
                    border-radius: 50%;
                    background: rgba(56, 114, 255, 0.08);
                    border: 1px solid rgba(56, 114, 255, 0.2);
                    margin-bottom: 2rem;
                    box-shadow: 0 0 40px rgba(56, 114, 255, 0.2);
                    color: var(--color-primary-light);
                    animation: pulseGlow 3s infinite alternate;
                }
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 20px rgba(56, 114, 255, 0.2); }
                    100% { box-shadow: 0 0 50px rgba(56, 114, 255, 0.5); }
                }
                .maintenance-icon {
                    animation: slowRotate 20s linear infinite;
                }
                @keyframes slowRotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .maintenance-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, #fff 0%, #a0b2d6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.5px;
                }
                .maintenance-divider {
                    width: 60px;
                    height: 4px;
                    background: var(--color-primary);
                    border-radius: 2px;
                    margin: 1.5rem auto;
                    box-shadow: 0 0 10px var(--color-primary-light);
                }
                .maintenance-text {
                    font-size: 1.15rem;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.6;
                    margin-bottom: 1rem;
                    max-width: 550px;
                }
                .maintenance-subtext {
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.6);
                    line-height: 1.6;
                    margin-bottom: 2.5rem;
                    max-width: 500px;
                }
                .maintenance-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                body.theme-light .maintenance-container {
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
                }
                body.theme-light .maintenance-title {
                    background: linear-gradient(135deg, #111 0%, #555 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                body.theme-light .maintenance-text {
                    color: #333;
                }
                body.theme-light .maintenance-subtext {
                    color: #666;
                }
                
                @media (max-width: 600px) {
                    .maintenance-title { font-size: 2rem; }
                    .maintenance-actions { flex-direction: column; width: 100%; }
                    .maintenance-actions > a { width: 100%; justify-content: center; }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

