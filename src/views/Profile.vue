<script setup lang="ts">
/**
 * @file Profile.vue
 * @description Comprehensive User Profile Component with Dynamic Role Support,
 * Image Upload Capabilities, Accessibility Enhancements, and Modal Animations.
 */

import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

// Import asset using Vite dynamic asset resolution
import defaultAvatar from '@/assets/user.png'

const router = useRouter()

// DOM References
const fileInputRef = ref<HTMLInputElement | null>(null)

// Application States
const isLoadingImage = ref<boolean>(false)

// Type Definitions
type Role = 'donor' | 'hospital' | 'bloodBank' | 'admin'

interface UserProfile {
  role: Role
  fullName: string
  email: string
  phone: string
  location: string
  avatar: string
  bloodType?: string
  lastDonation?: string
  donationStatus?: string
  totalRequests?: number
  totalUnits?: number
  connectedHospitals?: number
  status?: string
}

// Reactive State for User Profile
const user = reactive<UserProfile>({
  role: 'donor',
  fullName: 'Sara Ahmed',
  email: 'sara@gmail.com',
  phone: '0912345678',
  location: 'Khartoum',
  avatar: defaultAvatar,
  bloodType: 'O+',
  lastDonation: '20 Aug 2026',
  donationStatus: 'Eligible',
  totalRequests: 25,
  totalUnits: 25430,
  connectedHospitals: 12,
  status: 'Active'
})

/**
 * Lifecycle Hook: Restores user state and avatar preference from persistent storage.
 */
onMounted(() => {
  const savedRole = localStorage.getItem('userRole') as Role
  if (savedRole) {
    user.role = savedRole
  }
  
  const savedAvatar = localStorage.getItem('userAvatar')
  if (savedAvatar) {
    user.avatar = savedAvatar
  } else {
    user.avatar = defaultAvatar
  }
})

/**
 * Triggers the hidden file input dialog programmatically.
 */
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

/**
 * Handles profile image selection, validates file type, and processes Base64 encoding.
 * @param {Event} event - The DOM file input change event.
 */
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // File Validation Guard
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.')
      return
    }

    isLoadingImage.value = true

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        const newAvatar = e.target.result as string
        user.avatar = newAvatar
        localStorage.setItem('userAvatar', newAvatar)
      }
      isLoadingImage.value = false
    }
    reader.onerror = () => {
      alert('Error reading the image file.')
      isLoadingImage.value = false
    }
    reader.readAsDataURL(file)
  }
}

// Modal Visibility Controls
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const showLogoutModal = ref(false)

// Form States
const editForm = reactive({ fullName: '', email: '', phone: '', location: '' })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })

/**
 * Populates and opens the Edit Profile modal form.
 */
const openEditModal = () => {
  editForm.fullName = user.fullName
  editForm.email = user.email
  editForm.phone = user.phone
  editForm.location = user.location
  showEditModal.value = true
}

/**
 * Persists updated profile info to the active state.
 */
const handleSaveProfile = () => {
  user.fullName = editForm.fullName
  user.email = editForm.email
  user.phone = editForm.phone
  user.location = editForm.location
  showEditModal.value = false
}

/**
 * Validates and processes user password updates.
 */
const handleChangePassword = () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('Passwords do not match!')
    return
  }
  showPasswordModal.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  alert('Password changed successfully!')
}

/**
 * Clears persistent credentials and performs safe router navigation.
 */
const handleLogout = () => {
  localStorage.clear()
  showLogoutModal.value = false
  router.push('/login')
}

/**
 * Computed helper providing formatted human-readable role titles.
 */
const roleTitle = computed(() => {
  switch (user.role) {
    case 'donor': return 'Donor'
    case 'hospital': return 'Hospital'
    case 'bloodBank': return 'Blood Bank'
    case 'admin': return 'System Administrator'
    default: return 'User'
  }
})
</script>

<template>
  <div class="profile-layout">
    <!-- Navigation Bar -->
    <nav class="top-navbar" aria-label="Main Navigation">
      <div class="nav-link active" aria-current="page">Profile</div>
    </nav>

    <main class="profile-container">
      <h2 class="page-title">My Profile</h2>

      <!-- Profile Header View -->
      <section class="profile-header-card">
        
        <!-- Avatar Wrapper with Key Accessibility Events -->
        <div 
          class="avatar-wrapper" 
          @click="triggerFileInput" 
          @keydown.enter="triggerFileInput"
          @keydown.space.prevent="triggerFileInput"
          tabindex="0"
          role="button"
          aria-label="Change profile picture"
        >
          <img :src="user.avatar" alt="User Profile Avatar" class="profile-avatar" />
          
          <!-- Loading Spinner Overlay -->
          <div v-if="isLoadingImage" class="avatar-loading">
            <span class="spinner"></span>
          </div>

          <!-- Hover Action Overlay -->
          <div v-else class="avatar-overlay">
            <span class="camera-icon" aria-hidden="true">📷</span>
          </div>
        </div>

        <!-- Hidden Native File Upload Input -->
        <input 
          type="file" 
          ref="fileInputRef" 
          @change="handleImageUpload" 
          accept="image/*" 
          class="visually-hidden" 
          aria-hidden="true"
        />

        <h3 class="user-name">{{ user.fullName }}</h3>
        <span class="role-badge" :class="user.role">{{ roleTitle }}</span>
      </section>

      <!-- Personal Details View -->
      <section class="info-card" aria-labelledby="personal-info-title">
        <h4 id="personal-info-title" class="card-title">Personal Information</h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Full Name</label>
            <p>{{ user.fullName }}</p>
          </div>
          <div class="info-item">
            <label>Email</label>
            <p>{{ user.email }}</p>
          </div>
          <div class="info-item">
            <label>Phone</label>
            <p>{{ user.phone }}</p>
          </div>
          <div class="info-item" v-if="user.role !== 'admin'">
            <label>Location</label>
            <p>{{ user.location }}</p>
          </div>
        </div>
      </section>

      <!-- Control Panel Actions -->
      <section class="actions-group" aria-label="Profile Management Controls">
        <button class="btn btn-primary" @click="openEditModal">Edit Profile</button>
        <button class="btn btn-secondary" @click="showPasswordModal = true">Change Password</button>
        <button class="btn btn-danger" @click="showLogoutModal = true">Logout</button>
      </section>
    </main>

    <!-- 1. EDIT PROFILE MODAL -->
    <Transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-card" role="dialog" aria-labelledby="edit-modal-title">
          <h3 id="edit-modal-title">Edit Profile</h3>
          <form @submit.prevent="handleSaveProfile">
            <div class="modal-input-group">
              <label for="edit-name">Full Name</label>
              <input id="edit-name" type="text" v-model="editForm.fullName" required />
            </div>
            <div class="modal-input-group">
              <label for="edit-email">Email</label>
              <input id="edit-email" type="email" v-model="editForm.email" required />
            </div>
            <div class="modal-input-group">
              <label for="edit-phone">Phone</label>
              <input id="edit-phone" type="tel" v-model="editForm.phone" required />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-cancel" @click="showEditModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- 2. CHANGE PASSWORD MODAL -->
    <Transition name="modal">
      <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
        <div class="modal-card" role="dialog" aria-labelledby="password-modal-title">
          <h3 id="password-modal-title">Change Password</h3>
          <form @submit.prevent="handleChangePassword">
            <div class="modal-input-group">
              <label for="curr-pass">Current Password</label>
              <input id="curr-pass" type="password" v-model="passwordForm.currentPassword" required />
            </div>
            <div class="modal-input-group">
              <label for="new-pass">New Password</label>
              <input id="new-pass" type="password" v-model="passwordForm.newPassword" required />
            </div>
            <div class="modal-input-group">
              <label for="conf-pass">Confirm Password</label>
              <input id="conf-pass" type="password" v-model="passwordForm.confirmPassword" required />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-cancel" @click="showPasswordModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Change Password</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- 3. LOGOUT MODAL -->
    <Transition name="modal">
      <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
        <div class="modal-card dialog" role="alertdialog" aria-labelledby="logout-modal-title">
          <h3 id="logout-modal-title">Confirm Logout</h3>
          <p>Are you sure you want to logout?</p>
          <div class="modal-actions">
            <button class="btn btn-cancel" @click="showLogoutModal = false">Cancel</button>
            <button class="btn btn-danger" @click="handleLogout">Logout</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  border: 0 !important;
}

.profile-layout {
  min-height: 100vh;
  background-color: #f4f5f7;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 15px 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nav-brand {
  font-weight: 700;
  color: #700010;
}

.profile-container {
  max-width: 650px;
  margin: 30px auto;
  padding: 0 20px 40px;
}

.page-title {
  text-align: center;
  color: #700010;
  margin-bottom: 25px;
}

.profile-header-card {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

/* Interactive Avatar with Accessibility Focus */
.avatar-wrapper {
  position: relative;
  width: 105px;
  height: 105px;
  border-radius: 50%;
  margin: 0 auto 12px;
  overflow: hidden;
  border: 3px solid #700010;
  background-color: #e9ecef;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.avatar-wrapper:focus-visible {
  outline: 3px solid #700010;
  outline-offset: 3px;
}

.avatar-wrapper:hover {
  transform: scale(1.03);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay, .avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-overlay {
  opacity: 0;
  transition: opacity 0.25s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 24px;
}

/* Spinner Animation */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.user-name {
  font-size: 20px;
  margin: 0 0 6px;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 700;
}

.role-badge.donor { background: #ffe6e6; color: #700010; }
.role-badge.hospital { background: #e6f0ff; color: #0056b3; }
.role-badge.bloodBank { background: #e6ffe6; color: #1e7e34; }
.role-badge.admin { background: #f3e6ff; color: #6f42c1; }

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

.card-title {
  margin: 0 0 15px;
  color: #700010;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item label {
  display: block;
  font-size: 12px;
  color: #777;
  font-weight: 600;
}

.info-item p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.actions-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.btn:active {
  transform: scale(0.99);
}

.btn-primary { background: #700010; color: #fff; }
.btn-secondary { background: #e0e0e0; color: #333; }
.btn-danger { background: #aa3a4b; color: #fff; }
.btn-cancel { background: #f8f9fa; border: 1px solid #ccc; }

/* Modals Overlay Base */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #fff;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-input-group {
  margin-bottom: 12px;
}

.modal-input-group label {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
}

.modal-input-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

/* Vue Modal Transition (Fade & Scale Effect) */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.25s ease;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.9);
}
</style>