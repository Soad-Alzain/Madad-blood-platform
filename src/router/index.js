import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import BloodManagement from '@/views/BloodManagement.vue'
import Users from '@/views/Users.vue'
import Login from '@/views/login.vue'
import Profile from '@/views/Profile.vue'
import BloodRequest from '@/components/BloodRequest.vue'
import DonateBlood from '@/components/Donate Blood.vue'
import MyDonationsView from '@/components/MyDonationsView.vue'
import Reports from '@/views/ReportsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    { path: '/blood-management', name: 'blood-management', component: BloodManagement },
    { path: '/users', name: 'users', component: Users },
    { path: '/my-donations', name: 'my-donations', component: BloodManagement }, // أو الصفحة المخصصة للتبرعات
    { path: '/reports', name: 'reports', component: Dashboard },
    { path: '/notifications', name: 'notifications', component: Dashboard },
    { path: '/profile', name: 'profile', component: Profile },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    {path:  '/request-blood', name:'request-blood',component:BloodRequest},
    {path:  '/donate-blood', name:'donate-blood',component:DonateBlood},
    {path:  '/donation-view', name:"donation-view",component:MyDonationsView},
    {path:  '/reports', name:'reports',component:Reports}

  ]
})

export default router