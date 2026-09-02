<template>
  <div class="users-page-container">
    <!-- Page Header -->
    <header class="page-header">
      <h2>Users</h2>
      <p class="subtitle">Manage registered hospitals and donors</p>
    </header>

    <!-- Navigation Tabs -->
    <div class="tabs-container">
      <button 
        :class="['tab-btn', { active: activeTab === 'hospitals' }]"
        @click="activeTab = 'hospitals'"
      >
        Hospitals
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'donors' }]"
        @click="activeTab = 'donors'"
      >
        Donors
      </button>
    </div>

    <!-- Controls Bar (Search & Filter) -->
    <div class="controls-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search users..." 
        />
      </div>

      <div class="filter-group">
        <label for="statusFilter">Filter:</label>
        <select id="statusFilter" v-model="selectedFilter">
          <template v-if="activeTab === 'hospitals'">
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </template>
          <template v-else>
            <option value="All">All</option>
            <option value="Eligible">Eligible</option>
            <option value="Not Eligible">Not Eligible</option>
          </template>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="empty-state">
      <p>Loading user records from server...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="empty-state alert-error">
      <p>{{ errorMessage }}</p>
    </div>

    <!-- Data Tables Section -->
    <div v-else class="table-card">
      <!-- Hospitals Table -->
      <div v-if="activeTab === 'hospitals'">
        <table v-if="filteredHospitals.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Hospital Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hospital in paginatedHospitals" :key="hospital.hospital_id || hospital.id">
              <td><strong>{{ hospital.name }}</strong></td>
              <td>{{ hospital.email }}</td>
              <td>{{ hospital.location }}</td>
              <td>
                <span :class="['badge', (hospital.status || '').toLowerCase()]">
                  {{ hospital.status }}
                </span>
              </td>
              <td>
                <button class="btn-view" @click="openDetails(hospital, 'hospital')">View</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <p>No hospitals found.</p>
        </div>
      </div>

      <!-- Donors Table -->
      <div v-if="activeTab === 'donors'">
        <table v-if="filteredDonors.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Blood Type</th>
              <th>Location</th>
              <th>Last Donation</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="donor in paginatedDonors" :key="donor.donor_id || donor.id">
              <td><strong>{{ donor.name }}</strong></td>
              <td><span class="blood-type-tag">{{ donor.blood_type || donor.bloodType }}</span></td>
              <td>{{ donor.location }}</td>
              <td>{{ donor.last_donation || donor.lastDonation || 'N/A' }}</td>
              <td>
                <span :class="['badge', (donor.status === 'Eligible' || donor.status === 'active') ? 'eligible' : 'not-eligible']">
                  {{ donor.status }}
                </span>
              </td>
              <td>
                <button class="btn-view" @click="openDetails(donor, 'donor')">View</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <p>No donors found.</p>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="pagination-container" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1" 
          @click="currentPage--"
        >
          Previous
        </button>
        <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages" 
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Dynamic Detail Modal Component -->
    <UserDetailModal 
      :is-open="isModalOpen" 
      :type="modalType" 
      :user-data="selectedUser" 
      @close="closeModal" 
    />
  </div>
</template>

<script>
/**
 * @file UsersView.vue
 * @description Admin Users Management page integrated with Odoo backend services.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { hospitalService } from '@/services/hospitalService'
import { donorService } from '@/services/donorService'
import UserDetailModal from '@/components/UserDetailModal.vue'

export default {
  name: 'UsersView',
  components: {
    UserDetailModal
  },
  setup() {
    const activeTab = ref('hospitals')
    const searchQuery = ref('')
    const selectedFilter = ref('All')
    const currentPage = ref(1)
    const pageSize = 5

    const hospitals = ref([])
    const donors = ref([])
    
    // UI & API states
    const isLoading = ref(false)
    const errorMessage = ref(null)

    // Modal state
    const isModalOpen = ref(false)
    const modalType = ref('hospital')
    const selectedUser = ref(null)

    // Load data from Odoo backend services
    const fetchUsersData = async () => {
      isLoading.value = true
      errorMessage.value = null
      try {
        const [hospitalsRes, donorsRes] = await Promise.all([
          hospitalService.getHospitals(),
          donorService.getDonors()
        ])
        hospitals.value = hospitalsRes || []
        donors.value = donorsRes || []
      } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to load user records from Odoo backend.'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      fetchUsersData()
    })

    // Reset pagination and filters when switching tabs
    watch(activeTab, () => {
      searchQuery.value = ''
      selectedFilter.value = 'All'
      currentPage.value = 1
    })

    // Computed: Filtered Hospitals
    const filteredHospitals = computed(() => {
      return hospitals.value.filter(h => {
        const name = h.name || ''
        const email = h.email || ''
        const location = h.location || ''
        const matchesSearch = name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              location.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesFilter = selectedFilter.value === 'All' || h.status === selectedFilter.value
        return matchesSearch && matchesFilter
      })
    })

    // Computed: Filtered Donors
    const filteredDonors = computed(() => {
      return donors.value.filter(d => {
        const name = d.name || ''
        const email = d.email || ''
        const location = d.location || ''
        const bloodType = d.blood_type || d.bloodType || ''
        const matchesSearch = name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              location.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              bloodType.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesFilter = selectedFilter.value === 'All' || d.status === selectedFilter.value
        return matchesSearch && matchesFilter
      })
    })

    // Computed: Pagination for Hospitals
    const paginatedHospitals = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return filteredHospitals.value.slice(start, start + pageSize)
    })

    // Computed: Pagination for Donors
    const paginatedDonors = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return filteredDonors.value.slice(start, start + pageSize)
    })

    // Computed: Total Pages based on active tab
    const totalPages = computed(() => {
      const total = activeTab.value === 'hospitals' ? filteredHospitals.value.length : filteredDonors.value.length
      return Math.ceil(total / pageSize) || 1
    })

    // Modal Controls
    const openDetails = (user, type) => {
      selectedUser.value = user
      modalType.value = type
      isModalOpen.value = true
    }

    const closeModal = () => {
      isModalOpen.value = false
      selectedUser.value = null
    }

    return {
      activeTab,
      searchQuery,
      selectedFilter,
      currentPage,
      isLoading,
      errorMessage,
      filteredHospitals,
      filteredDonors,
      paginatedHospitals,
      paginatedDonors,
      totalPages,
      isModalOpen,
      modalType,
      selectedUser,
      openDetails,
      closeModal
    }
  }
}
</script>

<style scoped>
.users-page-container {
  padding: 30px;
  background-color: #FFFFFF;
  min-height: 100vh;
  color: #333333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.subtitle {
  color: #6B7280;
  font-size: 0.95rem;
}

/* Tabs Styling */
.tabs-container {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 12px;
}

.tab-btn {
  background: #F3F4F6;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background-color: #730B19;
  color: #FFFFFF;
}

.tab-btn:hover:not(.active) {
  background-color: #E5E7EB;
}

/* Controls Bar */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #F9FAFB;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 8px 14px;
  width: 300px;
  max-width: 100%;
}

.search-icon {
  margin-right: 8px;
  color: #9CA3AF;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.filter-group select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #D1D5DB;
  background-color: #FFFFFF;
  outline: none;
  font-weight: 500;
  color: #374151;
}

/* Tables Card */
.table-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  color: #6B7280;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 16px;
  font-size: 0.9rem;
  border-bottom: 1px solid #F3F4F6;
  color: #1F2937;
}

.data-table tbody tr:hover {
  background-color: #F9FAFB;
}

/* Badges */
.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.badge.active, .badge.eligible {
  background-color: #DEF7EC;
  color: #03543F;
}

.badge.inactive, .badge.not-eligible {
  background-color: #FDE8E8;
  color: #9B1C1C;
}

.blood-type-tag {
  background-color: #FEE2E2;
  color: #730B19;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.85rem;
}

/* View Action Button */
.btn-view {
  background-color: #730B19;
  color: #FFFFFF;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-view:hover {
  background-color: #5a0813;
}

/* Empty State */
.empty-state {
  padding: 40px;
  text-align: center;
  color: #6B7280;
  font-size: 1rem;
  font-weight: 500;
}

.alert-error {
  color: #9B1C1C;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #E5E7EB;
}

.page-btn {
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB;
  color: #374151;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background-color: #F3F4F6;
}

.page-indicator {
  font-size: 0.85rem;
  color: #6B7280;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
}
</style>