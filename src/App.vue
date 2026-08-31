<script setup lang="ts">
import { ref } from 'vue'
import Navbar from './components/navbar.vue'
import Sidebar from '@/components/Sidebar.vue'

// حالة القائمة الجانبية للموبايل
const isSidebarOpen = ref(false)

// تحديد الدور الحالي (يمكنك تغييره حسب رغبتك أو جعلها guest لو زائر)
const currentUserRole = ref('guest') // خيارات: 'guest' | 'admin' | 'hospital' | 'blood_bank' | 'donor'
const currentUserData = ref({
  name: 'زائر',
  roleTitle: 'Guest',
  email: 'guest@madad.com',
  phone: '09xxxxxxxx',
  city: 'Khartoum',
  status: 'Active'
})
</script>

<template>
  <div id="app">
    <!-- Navbar العلوي يظهر هنا ليرافق كل الصفحات -->
    <Navbar 
      :user-role="currentUserRole" 
      :user-data="currentUserData" 
      @toggle-sidebar="isSidebarOpen = true" 
    />

    <!-- Sidebar للجوال -->
    <Sidebar 
      :is-open="isSidebarOpen" 
      :user-role="currentUserRole" 
      :user-data="currentUserData" 
      @close="isSidebarOpen = false" 
    />

    <!-- هنا يتم عرض صفحة Register أو أي صفحة أخرى حسب الـ Router -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: 'Cairo', sans-serif;
  background-color: #fff;
}

.main-content {
  padding: 20px;
}
</style>