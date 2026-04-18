import Home from './pages/Home.js';
import List from './pages/List.js';
import LevelDetail from './pages/LevelDetail.js';
import FutureDemons from './pages/FutureDemons.js';
import FutureDemonDetail from './pages/FutureDemonDetail.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Submit from './pages/Submit.js';
import ModDashboard from './pages/ModDashboard.js';
import Guidelines from './pages/Guidelines.js';
import Contacts from './pages/Contacts.js';
import ApiDocs from './pages/ApiDocs.js';

export default [
    { path: '/',               component: Home },
    { path: '/demonlist',      component: List },
    { path: '/demonlist/:id',  component: LevelDetail },
    { path: '/future-demons', component: FutureDemons },
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
