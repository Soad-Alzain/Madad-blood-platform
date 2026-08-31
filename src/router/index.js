import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import BloodManagement from '@/views/BloodManagement.vue'
import Users from '@/views/Users.vue'
import Login from '@/views/login.vue'
import Profile from '@/views/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/blood-management', name: 'blood-management', component: BloodManagement },
    { path: '/users', name: 'users', component: Users },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    {path:'/Profile',name:'Profile',component:Profile}

  ]
})

export default router