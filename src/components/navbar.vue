<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  userRole: {
    type: String,
    default: 'guest'
  },
  userData: {
    type: Object,
    default: () => ({ name: ' ', subtitle: 'guest@madad.com' })
  }
})

defineEmits(['toggle-sidebar'])
const router = useRouter()

const activeDropdown = ref<string | null>(null)

const toggleDropdown = (menu: string, event: Event) => {
  event.stopPropagation()
  activeDropdown.value = activeDropdown.value === menu ? null : menu
}

const closeDropdowns = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.dropdown-container')) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const navLinks = computed(() => {
  switch (props.userRole) {
    case 'admin':
      return [
        { name: 'Home', path: '/', icon: 'fa-solid fa-house' },
        { name: 'Blood Management', path: '/blood-management', icon: 'fa-solid fa-boxes-stacked' },
        { 
          hasDropdown: true, 
          name: 'Users', 
          key: 'users', 
          icon: 'fa-solid fa-users-gear',
          children: [
            { name: 'Hospitals', path: '/users?tab=hospitals', icon: 'fa-solid fa-hospital' },
            { name: 'Donors', path: '/users?tab=donors', icon: 'fa-solid fa-user-group' },
            { name: 'Add Hospital', path: '/users?action=add-hospital', icon: 'fa-solid fa-hospital-user' },
            { name: 'Add Donor', path: '/users?action=add-donor', icon: 'fa-solid fa-user-plus' }
          ] 
        },
        { name: 'Notifications', path: '/notifications', icon: 'fa-solid fa-bell' },
        { name: 'Profile', path: '/profile', icon: 'fa-solid fa-user' }
      ]
    case 'hospital':
      return [
        { name: 'Home', path: '/', icon: 'fa-solid fa-house' },
        { 
          hasDropdown: true, 
          name: 'Blood Management', 
          key: 'hospital_mgmt', 
          icon: 'fa-solid fa-file-medical',
          children: [
            { name: 'My Blood Requests', path: '/blood-management?tab=requests', icon: 'fa-solid fa-list-check' },
            { name: 'Create Blood Request', path: '/request-blood', icon: 'fa-solid fa-hand-holding-medical' }
          ]
        },
        { name: 'Notifications', path: '/notifications', icon: 'fa-solid fa-bell' },
        { name: 'Profile', path: '/profile', icon: 'fa-solid fa-user' }
      ]
    case 'blood_bank':
      return [
        { name: 'Home', path: '/', icon: 'fa-solid fa-house' },
        { 
          hasDropdown: true, 
          name: 'Blood Management', 
          key: 'blood_bank_mgmt', 
          icon: 'fa-solid fa-warehouse',
          children: [
            { name: 'Inventory', path: '/blood-management?tab=inventory', icon: 'fa-solid fa-droplet' },
            { name: 'Blood Requests', path: '/blood-management?tab=requests', icon: 'fa-solid fa-file-medical' },
            { name: 'Donation Appointments', path: '/blood-management?tab=appointments', icon: 'fa-solid fa-calendar-check' }
          ] 
        },
        { name: 'Notifications', path: '/notifications', icon: 'fa-solid fa-bell' },
        { name: 'Profile', path: '/profile', icon: 'fa-solid fa-user' }
      ]
    case 'donor':
      return [
        { name: 'Home', path: '/', icon: 'fa-solid fa-house' },
        { name: 'Blood Donation', path: '/donate-blood', icon: 'fa-solid fa-hand-holding-droplet' },
        { name: 'My Appointments', path: '/appointments', icon: 'fa-solid fa-calendar-days' },
        { name: 'My Donations', path: '/donation-view', icon: 'fa-solid fa-clock-rotate-left' },
        { name: 'Notifications', path: '/notifications', icon: 'fa-solid fa-bell' },
        { name: 'Profile', path: '/profile', icon: 'fa-solid fa-user' }
      ]
    default:
      return [
        { name: 'Home', path: '/', icon: 'fa-solid fa-house' },
        { name: 'Blood Management', path: '/blood-management', icon: 'fa-solid fa-boxes-stacked' },
        { name: 'Notifications', path: '/notifications', icon: 'fa-solid fa-bell' },
        { name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-chart-line' },
        { name: 'LOGIN', path: '/login', icon: 'fa-solid fa-right-to-bracket' }
      ]
  }
})
</script>

<template>
  <header class="navbar-header">
    <div class="navbar-container">
      
      <button class="mobile-menu-btn" @click="$emit('toggle-sidebar')" aria-label="Open mobile menu">
        <i class="fa-solid fa-bars"></i>
      </button>

      <router-link to="/" class="logo-link">
        <img src="/src/assets/MADAD Logo.png" alt="MADAD - مَدَد" class="logo-img" />
      </router-link>

      <nav class="nav-links" aria-label="Desktop Navigation">
        <template v-for="(link, index) in navLinks" :key="index">
          <div v-if="link.hasDropdown" class="dropdown-container" @click="(e) => toggleDropdown(link.key, e)">
            <span class="nav-item dropdown-toggle">
              <i :class="link.icon" v-if="link.icon"></i>
              <span>{{ link.name }}</span>
              <i class="fa-solid fa-chevron-down dropdown-arrow"></i>
            </span>
            <div v-if="activeDropdown === link.key" class="dropdown-menu">
              <router-link 
                v-for="(child, cIndex) in link.children" 
                :key="cIndex" 
                :to="child.path" 
                class="dropdown-item"
                @click="activeDropdown = null"
              >
                <i :class="child.icon" v-if="child.icon"></i> {{ child.name }}
              </router-link>
            </div>
          </div>
          <router-link v-else :to="link.path" class="nav-item">
            <i :class="link.icon" v-if="link.icon"></i>
            <span>{{ link.name }}</span>
          </router-link>
        </template>
      </nav>

      <div class="navbar-right">
        <template v-if="userRole !== 'guest'">
          <div class="user-menu_badge">
            <i class="fa-solid fa-user-circle"></i> <span>{{ userData.name }}</span>
          </div>
        </template>
      </div>

    </div>
  </header>
</template>

<style scoped>
.navbar-header {
  width: 100%;
  padding: 15px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

.navbar-container {
  width: 68%;
  max-width: 1400px;
  height: 75px;
  border: 2px solid #730b19;
  border-radius: 10px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ;
  position: relative;
  direction: ltr;
}

.mobile-menu-btn {
  display: none;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #730b19;
  z-index: 20;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  height: 80px;
    max-width: 133px;
    object-fit: contain;
    border-radius: 0 10px 10px 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* تعديل الـ Nav Item لتكون الأيقونة فوق النص وحجم الخط 18px */
.nav-item {
  font-weight: 700;
  font-size: 18px;
  color: #333333;
  text-decoration: none;
  cursor: pointer;
  display: flex;
  flex-direction: column; /* جعل العناصر تترتب عمودياً */
  align-items: center;
  justify-content: center;
  gap: 3px;
  transition: color 0.2s ease;
  line-height: 1.2;
}

.nav-item i {
  color: #730b19;
  font-size: 18px; /* حجم أيقونة متناسق مع النص */
}

.nav-item:hover, 
.router-link-active {
  color: #730b19;
}

.dropdown-container {
  position: relative;
  cursor: pointer;
}

.dropdown-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dropdown-toggle span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-arrow {
  font-size: 10px;
  margin-top: 2px;
}

.dropdown-menu {
  position: absolute;
  top: 135%;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(115, 11, 25, 0.15);
  display: flex;
  flex-direction: column;
  min-width: 200px;
  z-index: 100;
  padding: 8px 0;
}

.dropdown-item {
  padding: 10px 16px;
  color: #333333;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-item i {
  color: #730b19;
  width: 16px;
  text-align: center;
}

.dropdown-item:hover {
  background-color: #fdf2f2;
  color: #730b19;
}

.user-menu_badge {
  font-weight: bold;
  color: #730b19;
  cursor: pointer;
  font-size: 15px;
  background-color: #fdf2f2;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(115, 11, 25, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 1100px) {
  .nav-links {
    gap: 1rem;
  }
  .nav-item {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .nav-links, 
  .navbar-right {
    display: none; 
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .navbar-container {
    width: 100%;
    border: none;
    box-shadow: none;
    padding: 0 10px;
  }
  
  .logo-img {
    height: 48px;
  }
}
</style>