<script setup lang="ts">
interface UserData {
  name: string
  roleTitle: string
  email: string
  phone: string
  city: string
  status: string
  bloodType?: string
}

withDefaults(defineProps<{
  isOpen?: boolean
  userRole?: string
  userData?: UserData
}>(), {
  isOpen: false,
  userRole: 'guest',
  userData: () => ({
    name: 'MADAD User',
    roleTitle: 'Donor',
    email: 'user@madad.com',
    phone: '09xxxxxxxx',
    city: 'Khartoum',
    status: 'Active',
    bloodType: 'O+'
  })
})

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div v-if="isOpen" class="sidebar-overlay" @click="emit('close')">
    <div class="sidebar-container" @click.stop role="dialog" aria-modal="true" aria-label="Mobile Navigation Sidebar">
      
      <button class="close-btn" @click="emit('close')" aria-label="Close navigation sidebar">&times;</button>

      <div class="sidebar-header-profile">
        <h3 class="brand-title">MADAD</h3>
        <div class="profile-info">
          <p class="p-name"><strong>{{ userData.name || 'User' }}</strong></p>
          <p class="p-role">{{ userData.roleTitle }}</p>
          <p v-if="userData.bloodType" class="p-blood">Blood Type: {{ userData.bloodType }}</p>
          <p class="p-detail">{{ userData.email }}</p>
          <p class="p-detail">{{ userData.phone }}</p>
          <p class="p-detail">{{ userData.city }}</p>
          <p class="p-status">● {{ userData.status }}</p>
        </div>
      </div>

      <hr class="divider" />

      <nav class="sidebar-links" aria-label="Mobile Navigation Links">
        
        <router-link to="/" class="sidebar-item" @click="emit('close')">
          <i class="fa-solid fa-house"></i> Home
        </router-link>

        <!-- ADMIN -->
        <template v-if="userRole === 'admin'">
          <router-link to="/blood-management" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-boxes-stacked"></i> Blood Management
          </router-link>
          <router-link to="/users?tab=hospitals" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-users-gear"></i> Users
          </router-link>
          <router-link to="/users?tab=hospitals" class="sidebar-sub-item" @click="emit('close')">
            <i class="fa-solid fa-hospital"></i> Hospitals
          </router-link>
          <router-link to="/users?tab=donors" class="sidebar-sub-item" @click="emit('close')">
            <i class="fa-solid fa-user-group"></i> Donors
          </router-link>
          <router-link to="/users?action=add-hospital" class="sidebar-sub-item" @click="emit('close')">
            <i class="fa-solid fa-hospital-user"></i> Add Hospital
          </router-link>
          <router-link to="/users?action=add-donor" class="sidebar-sub-item" @click="emit('close')">
            <i class="fa-solid fa-user-plus"></i> Add Donor
          </router-link>
          <router-link to="/notifications" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-bell"></i> Notifications
          </router-link>
          <router-link to="/profile" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-user"></i> Profile
          </router-link>
        </template>

        <!-- HOSPITAL -->
        <template v-else-if="userRole === 'hospital'">
          <router-link to="/blood-management?tab=requests" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-file-medical"></i> Blood Management
          </router-link>
          <router-link to="/blood-management?tab=requests" class="sidebar-sub-item" @click="emit('close')">
            <i class="fa-solid fa-list-check"></i> My Blood Requests
          </router-link>
          <router-link to="/request-blood" class="sidebar-sub-item" @click="emit('close')">
            <i class="fa-solid fa-hand-holding-medical"></i> Create Blood Request
          </router-link>
          <router-link to="/notifications" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-bell"></i> Notifications
          </router-link>
          <router-link to="/profile" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-user"></i> Profile
          </router-link>
        </template>

        <!-- BLOOD BANK -->
        <template v-else-if="userRole === 'blood_bank'">
          <router-link to="/blood-management" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-warehouse"></i> Blood Management
          </router-link>
          <router-link to="/blood-management?tab=inventory" class="sidebar-sub-item" @click="emit('close')">
            <i class="fa-solid fa-droplet"></i> Inventory
          </router-link>
          <router-link to="/blood-management?tab=requests" class="sidebar-sub-item" @click="emit('close')">
            <i class="fa-solid fa-file-medical"></i> Blood Requests
          </router-link>
          <router-link to="/blood-management?tab=appointments" class="sidebar-sub-item" @click="emit('close')">
            <i class="fa-solid fa-calendar-check"></i> Donation Appointments
          </router-link>
          <router-link to="/notifications" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-bell"></i> Notifications
          </router-link>
          <router-link to="/profile" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-user"></i> Profile
          </router-link>
        </template>

        <!-- DONOR -->
        <template v-else-if="userRole === 'donor'">
          <router-link to="/donate-blood" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-hand-holding-droplet"></i> Blood Donation
          </router-link>
          <router-link to="/appointments" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-calendar-days"></i> My Appointments
          </router-link>
          <router-link to="/donation-view" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-clock-rotate-left"></i> My Donations
          </router-link>
          <router-link to="/notifications" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-bell"></i> Notifications
          </router-link>
          <router-link to="/profile" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-user"></i> Profile
          </router-link>
        </template>

        <!-- GUEST -->
        <template v-else>
          <router-link to="/blood-management" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-boxes-stacked"></i> Blood Management
          </router-link>
          <router-link to="/notifications" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-bell"></i> Notifications
          </router-link>
          <router-link to="/dashboard" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-chart-line"></i> Dashboard
          </router-link>
          <router-link to="/login" class="sidebar-item" @click="emit('close')">
            <i class="fa-solid fa-right-to-bracket"></i> Login
          </router-link>
        </template>

        <!-- Logout -->
        <router-link v-if="userRole !== 'guest'" to="/login" class="sidebar-item logout" @click="emit('close')">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </router-link>

      </nav>
    </div>
  </div>
</template>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-start;
}

.sidebar-container {
  position: relative;
  width: 290px;
  height: 100%;
  background-color: #ffffff;
  padding: 20px;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.brand-title {
  color: #730b19;
  font-size: 24px;
  margin-bottom: 15px;
  text-align: center;
}

.profile-info {
  font-size: 14px;
  color: #333;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 10px;
}

.p-name { font-size: 16px; color: #111; }
.p-role { color: #730b19; font-weight: bold; margin-bottom: 5px; }
.p-blood { color: #d9534f; font-weight: bold; }
.p-detail { color: #666; font-size: 13px; }
.p-status { color: #28a745; font-weight: bold; margin-top: 5px; }

.divider {
  border: 0;
  border-top: 1px solid #ddd;
  margin: 15px 0;
}

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-item {
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
  font-weight: 600;
  font-size: 18px; /* حجم خط 18px */
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.sidebar-item i {
  font-size: 18px;
  color: #730b19;
  width: 20px;
  text-align: center;
}

.sidebar-sub-item {
  padding: 10px 15px 10px 35px;
  color: #555;
  text-decoration: none;
  font-size: 16px; /* حجم خط مناسب للعناصر الفرعية */
  font-weight: 500;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.sidebar-sub-item i {
  font-size: 15px;
  color: #730b19;
}

.sidebar-item:hover, 
.sidebar-sub-item:hover,
.router-link-active {
  background-color: #730b19;
  color: #ffffff;
}

.sidebar-item:hover i,
.sidebar-sub-item:hover i,
.router-link-active i {
  color: #ffffff;
}

.logout {
  color: #d9534f;
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 14px;
}

.logout i {
  color: #d9534f;
}

.logout:hover {
  background-color: #d9534f;
  color: #ffffff;
}

.logout:hover i {
  color: #ffffff;
}

.close-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #730b19;
}
</style>