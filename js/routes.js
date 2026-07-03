import Home from './pages/Home.js';
import List from './pages/List.js';
import LevelDetail from './pages/LevelDetail.js';
import FutureDemons from './pages/FutureDemons.js';
import FutureDemonDetail from './pages/FutureDemonDetail.js';
import FutureDemonWatch from './pages/FutureDemonWatch.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Submit from './pages/Submit.js';
import ModDashboard from './pages/ModDashboard.js';
import Guidelines from './pages/Guidelines.js';
import Contacts from './pages/Contacts.js';
import ApiDocs from './pages/ApiDocs.js';
import Social from './pages/Social.js';
import SocialWatch from './pages/SocialWatch.js';
import SocialProfile from './pages/SocialProfile.js';
import SocialMaintenance from './pages/SocialMaintenance.js';

export default [
    { path: '/',               component: Home },
    { path: '/social',         component: SocialMaintenance },
    { path: '/social/watch/:id', component: SocialMaintenance },
    { path: '/social/player/:slug', component: SocialMaintenance },
    { path: '/demonlist',      component: List },
    { path: '/demonlist/:id',  component: LevelDetail },
    { path: '/future-demons', component: FutureDemons },
    { path: '/future-demons/watch/:id', component: FutureDemonWatch },
    { path: '/future-demons/:id', component: FutureDemonDetail },
    { path: '/leaderboard',    component: Leaderboard },
    { path: '/guidelines',     component: Guidelines },
    { path: '/contacts',       component: Contacts },
    { path: '/api-docs',                    component: ApiDocs },
    { path: '/api-docs/:section',           component: ApiDocs },
    { path: '/api-docs/:section/:subtab', component: ApiDocs },
    { path: '/submit',         component: Submit },
    { path: '/roulette',       component: Roulette },
    { path: '/mod',            component: ModDashboard },
];
