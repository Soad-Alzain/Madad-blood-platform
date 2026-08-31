<script setup lang="ts">
/**
 * @file Sidebar.vue
 * @description Responsive mobile sidebar component providing role-based navigation and user profile summary.
 */

/**
 * Strict TypeScript interface for User Profile Data model.
 */
interface UserData {
  name: string
  roleTitle: string
  email: string
  phone: string
  city: string
  status: string
  bloodType?: string
}

/**
 * Component input properties with default fallback configurations.
 */
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

/**
 * Component emitted events for state management coordination.
 */
const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <!-- Sidebar Backdrop Overlay: Closes drawer on outside click -->
  <div v-if="isOpen" class="sidebar-overlay" @click="emit('close')">
    
    <!-- Sidebar Content Drawer: Stops click propagation to prevent unwanted closing -->
    <div class="sidebar-container" @click.stop role="dialog" aria-modal="true" aria-label="Sidebar Navigation">
      
      <!-- Close Button inside container for proper positioning -->
      <button class="close-btn" @click="emit('close')" aria-label="Close sidebar">&times;</button>

      <!-- User Profile Header Section (Role-Tailored) -->
      <div class="sidebar-header-profile">
        <h3 class="brand-title">MADAD</h3>
        <div class="profile-info">
          <p class="p-name"><strong>{{ userData.name  || 'User'}}</strong></p>
          <p class="p-role">{{ userData.roleTitle }}</p>
          <p v-if="userData.bloodType" class="p-blood">Blood Type: {{ userData.bloodType }}</p>
          <p class="p-detail">{{ userData.email }}</p>
          <p class="p-detail">{{ userData.phone }}</p>
          <p class="p-detail">{{ userData.city }}</p>
          <p class="p-status">● {{ userData.status }}</p>
        </div>
      </div>

      <hr class="divider" />

      <!-- Dynamic Navigation Links Based on User Permissions & Roles -->
      <nav class="sidebar-links" aria-label="Mobile Navigation">
        <router-link to="/" class="sidebar-item" @click="emit('close')">Home</router-link>
        <router-link to="/dashboard" class="sidebar-item" @click="emit('close')">Dashboard</router-link>
        
        <!-- Role-Specific Conditional Route: Donor Specific View -->
        <template v-if="userRole === 'donor'">
          <router-link to="/my-donations" class="sidebar-item" @click="emit('close')">My Donations</router-link>
        </template>
        
        <!-- Role-Specific Conditional Route: Institutional / General View -->
        <template v-else>
          <router-link to="/blood-management" class="sidebar-item" @click="emit('close')">Blood Management</router-link>
        </template>

        <!-- Role-Specific Conditional Route: Admin Privileges -->
        <template v-if="userRole === 'admin'">
          <router-link to="/users" class="sidebar-item" @click="emit('close')">Users</router-link>
        </template>

        <router-link to="/reports" class="sidebar-item" @click="emit('close')">Reports</router-link>
        <router-link to="/notifications" class="sidebar-item" @click="emit('close')">Notifications</router-link>
        <router-link to="/profile" class="sidebar-item" @click="emit('close')">Profile</router-link>
        <router-link to="/login" class="sidebar-item logout" @click="emit('close')">Logout</router-link>
      </nav>
    </div>
  </div>
</template>

<style scoped>
/* Backdrop overlay styling with smooth focus containment */
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

/* Sidebar panel container layout and dimensions */
.sidebar-container {
  position: relative; /* Added to anchor the absolute close button inside */
  width: 280px;
  height: 100%;
  background-color: #ffffff;
  padding: 20px;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Brand identity header styling */
.brand-title {
  color: #730b19;
  font-size: 22px;
  margin-bottom: 15px;
  text-align: center;
}

/* User profile card section styling */
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

/* Visual separator component */
.divider {
  border: 0;
  border-top: 1px solid #ddd;
  margin: 15px 0;
}

/* Navigation items wrapper layout */
.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Individual navigation link styling and transition effects */
.sidebar-item {
  padding: 10px 15px;
  color: #333;
  text-decoration: none;
  font-weight: 600;
  border-radius: 6px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.sidebar-item:hover, 
.router-link-active {
  background-color: #730b19;
  color: #ffffff;
}

/* Destructive action styling for Logout */
.logout {
  color: #d9534f;
}

.logout:hover {
  background-color: #d9534f;
  color: #ffffff;
}

/* Fixed positioning inside the sidebar container */
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