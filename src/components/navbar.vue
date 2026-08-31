<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  userRole: {
    type: String,
    default: 'guest'
  },
  userData: {
    type: Object,
    default: () => ({ name: 'زائر', subtitle: 'guest@madad.com' })
  }
})

defineEmits(['toggle-sidebar'])
const router = useRouter()

const activeDropdown = ref<string | null>(null)

const toggleDropdown = (menu: string) => {
  activeDropdown.value = activeDropdown.value === menu ? null : menu
}

const navLinks = computed(() => {
  switch (props.userRole) {
    case 'admin':
      return [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { hasDropdown: true, name: 'Blood Management', key: 'blood', children: [
            { name: 'Blood Banks', path: '/blood-management?tab=banks' },
            { name: 'Inventory', path: '/blood-management?tab=inventory' },
            { name: 'Blood Requests', path: '/blood-management?tab=requests' }
          ]
        },
        { hasDropdown: true, name: 'Users', key: 'users', children: [
            { name: 'Hospitals', path: '/users?type=hospitals' },
            { name: 'Donors', path: '/users?type=donors' }
          ]
        },
        { name: 'Reports', path: '/reports' }
      ]
    case 'hospital':
      return [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { hasDropdown: true, name: 'Blood Management', key: 'blood', children: [
            { name: 'Blood Search', path: '/blood-management?tab=search' },
            { name: 'My Requests', path: '/blood-management?tab=my-requests' }
          ]
        },
        { name: 'Reports', path: '/reports' }
      ]
    case 'blood_bank':
      return [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { hasDropdown: true, name: 'Blood Management', key: 'blood', children: [
            { name: 'Blood Banks', path: '/blood-management?tab=banks' },
            { name: 'Inventory', path: '/blood-management?tab=inventory' },
            { name: 'Blood Requests', path: '/blood-management?tab=requests' }
          ]
        },
        { name: 'Reports', path: '/reports' }
      ]
    case 'donor':
      return [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'My Donations', path: '/my-donations' },
        { name: 'Reports', path: '/reports' }
      ]
    default:
      return [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Blood Management', path: '/blood-management' },
        { name: 'Users', path: '/users' }
      ]
  }
})
</script>

<template>
  <header class="navbar-header">
    <div class="navbar-container">
      <button class="mobile-menu-btn" @click="$emit('toggle-sidebar')">
        ☰
      </button>

      <router-link to="/" class="logo-link">
        <img src="/src/assets/MADAD Logo.png" alt="MADAD - مَدَد" class="logo-img" />
      </router-link>

      <nav class="nav-links">
        <template v-for="(link, index) in navLinks" :key="index">
          <div v-if="link.hasDropdown" class="dropdown-container" @click="toggleDropdown(link.key)">
            <span class="nav-item dropdown-toggle">{{ link.name }} ▾</span>
            <div v-if="activeDropdown === link.key" class="dropdown-menu">
              <router-link v-for="(child, cIndex) in link.children" :key="cIndex" :to="child.path" class="dropdown-item">
                {{ child.name }}
              </router-link>
            </div>
          </div>
          <router-link v-else class="nav-item" :to="link.path">{{ link.name }}</router-link>
        </template>
      </nav>

      <div class="navbar-right">
        <template v-if="userRole === 'guest'">
          <div class="log-re-btn">
            <router-link to="/login" class="login-btn">Login</router-link>
            <router-link to="/register" class="register-btn">Register</router-link>
          </div>
        </template>
        <template v-else>
          <div class="user-menu_badge">
            <span>{{ userData.name }} ▾</span>
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
}

.navbar-container {
  width: 90%;
  max-width: 1200px;
  height: 65px;
  border: 2px solid #730b19;
  border-radius: 20px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
}

.mobile-menu-btn {
  display: none;
  font-size: 26px;
  font-weight: bold;
  background: none;
  border: none;
  cursor: pointer;
  color: #730b19;
  z-index: 20;
}

.logo-link {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 45px;
  max-width: 120px;
  object-fit: contain;
  border-radius: 10px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-item {
  font-weight: 700;
  font-size: 15px;
  color: #111111;
  text-decoration: none;
  cursor: pointer;
}

.nav-item:hover, .router-link-active {
  color: #730b19;
}

.dropdown-container {
  position: relative;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  min-width: 160px;
  z-index: 100;
  padding: 8px 0;
}

.dropdown-item {
  padding: 8px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #730b19;
}

.log-re-btn {
  display: flex;
  align-items: center;
}

.login-btn {
  background-color: #730b19;
  color: #ffffff;
  border: 1px solid #730b19;
  border-radius: 6px 0 0 6px;
  text-decoration: none;
  padding: 5px 10px;
  font-size: 13px;
}

.register-btn {
  background-color: #ffffff;
  color: #730b19;
  border: 1px solid #730b19;
  border-radius: 0 6px 6px 0;
  text-decoration: none;
  padding: 5px 10px;
  font-size: 13px;
}

.user-menu_badge {
  font-weight: bold;
  color: #730b19;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 992px) {
  .nav-links, .log-re-btn, .user-menu_badge {
    display: none; 
  }
  .mobile-menu-btn {
    display: block;
  }
  .navbar-container {
    width: 100%;
    padding: 0 15px;
    border:none;
    justify-content: space-between;
  }
  .mobile-menu-btn{
    margin: 100px;
  }
}
</style>