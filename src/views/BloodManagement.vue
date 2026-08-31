<script setup lang="ts">
/**
 * @file BloodManagement.vue
 * @description Fully responsive component with table-to-card transformation for small screens.
 */

import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// ==========================================
// 1. TYPE DEFINITIONS & INTERFACES
// ==========================================

type TabType = 'banks' | 'inventory' | 'requests'

interface BloodBank {
  id: number
  name: string
  location: string
  contact: string
  bloodType: string
  stockLevel: string
  status: 'Active' | 'Inactive'
  totalUnits?: number
  availableTypes?: string[]
}

interface InventoryItem {
  id: number
  bloodType: string
  available: number
  reserved: number
  expiryDate: string
  status: 'Available' | 'Low'
  location: string
  fromBank?: string
  toBank?: string
}

interface BloodRequest {
  id: string
  hospital: string
  bloodType: string
  units: number
  priority: 'High' | 'Normal' | 'Low'
  status: 'Pending' | 'Approved' | 'Rejected'
  location: string
  note?: string
  bloodBank?: string
}

// ==========================================
// 2. REACTIVE STATE MANAGEMENT
// ==========================================

const activeTab = ref<TabType>('banks')
const searchQuery = ref<string>('')

const selectedBloodType = ref<string>('')
const selectedLocation = ref<string>('')
const selectedStatus = ref<string>('')

// Modal States
const isModalOpen = ref<boolean>(false)
const selectedBankItem = ref<BloodBank | null>(null)
const selectedInventoryItem = ref<InventoryItem | null>(null)
const selectedRequestItem = ref<BloodRequest | null>(null)

// Odoo Loading & Error States
const isLoading = ref<boolean>(false)
const odooError = ref<string | null>(null)

// ==========================================
// 3. CONSTANTS & DROPDOWN OPTIONS
// ==========================================

const bloodTypes: readonly string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const locations: readonly string[] = ['Khartoum', 'Kassala', 'Gedaref', 'Northern', 'Port Sudan']

// ==========================================
// 4. DATASETS (Fallback & Initial)
// ==========================================

const bloodBanks = ref<BloodBank[]>([
  { id: 1, name: 'Khartoum Central Blood', location: 'Khartoum', contact: '091594548', bloodType: 'O+', stockLevel: 'High', status: 'Active', totalUnits: 500, availableTypes: ['A-', 'O+', 'B+'] },
  { id: 2, name: 'Port Sudan Blood Bank', location: 'Port Sudan', contact: '01158565798', bloodType: 'B+', stockLevel: 'Medium', status: 'Active', totalUnits: 320, availableTypes: ['A+', 'O-'] }
])

const inventory = ref<InventoryItem[]>([
  { id: 1, bloodType: 'A+', available: 120, reserved: 20, expiryDate: '15 Sep', status: 'Available', location: 'Khartoum', fromBank: 'Central Blood Bank', toBank: 'Emergency Blood Bank' },
  { id: 2, bloodType: 'O+', available: 45, reserved: 10, expiryDate: '20 Sep', status: 'Low', location: 'Kassala', fromBank: 'Central Blood Bank', toBank: 'Emergency Blood Bank' }
])

const requests = ref<BloodRequest[]>([
  { id: '#REQ001', hospital: 'Al Noor', bloodType: 'O-', units: 5, priority: 'High', status: 'Pending', location: 'Khartoum', note: 'Emergency surgery', bloodBank: 'Khartoum Central Blood' },
  { id: '#REQ002', hospital: 'Royal Hospital', bloodType: 'A+', units: 5, priority: 'Normal', status: 'Approved', location: 'Gedaref', note: 'Blood Exhibition, Loss Exhibition', bloodBank: 'Port Sudan Blood Bank' }
])

// ==========================================
// 5. ODOO JSON-RPC INTEGRATION HANDLER
// ==========================================

const fetchOdooData = async () => {
  isLoading.value = true
  odooError.value = null

  try {
    const authResponse = await axios.post('/jsonrpc', {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'authenticate',
        args: ['YOUR_DB_NAME', 'user@example.com', 'YOUR_PASSWORD', {}]
      }
    })

    const uid = authResponse.data?.result
    if (!uid) {
      throw new Error('Odoo Authentication failed. Please verify your credentials.')
    }

    const response = await axios.post('/jsonrpc', {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          'YOUR_DB_NAME',
          uid,
          'YOUR_PASSWORD',
          'medical.blood.bank',
          'search_read',
          [[]],
          { fields: ['name', 'location', 'phone', 'stock_level', 'state', 'blood_type'] }
        ]
      }
    })

    if (response.data?.error) {
      throw new Error(response.data.error.data?.message || 'Odoo RPC Error')
    }

    if (response.data?.result) {
      bloodBanks.value = response.data.result.map((item: any) => ({
        id: item.id,
        name: item.name,
        location: item.location || 'Unknown',
        contact: item.phone || 'N/A',
        bloodType: item.blood_type || 'O+',
        stockLevel: item.stock_level || 'Normal',
        status: item.state === 'active' ? 'Active' : 'Inactive'
      }))
    }
  } catch (err: any) {
    odooError.value = err?.message || 'Failed to connect to Odoo Server.'
    console.error('Odoo Connection Error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // fetchOdooData()
})

// ==========================================
// 6. COMPUTED FILTERING LOGIC
// ==========================================

const filteredBanks = computed<BloodBank[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return bloodBanks.value.filter(b => {
    const matchSearch = !query || b.name.toLowerCase().includes(query)
    const matchBlood = !selectedBloodType.value || b.bloodType === selectedBloodType.value
    const matchLocation = !selectedLocation.value || b.location === selectedLocation.value
    const matchStatus = !selectedStatus.value || b.status === selectedStatus.value
    return matchSearch && matchBlood && matchLocation && matchStatus
  })
})

const filteredInventory = computed<InventoryItem[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return inventory.value.filter(i => {
    const matchSearch = !query || i.bloodType.toLowerCase().includes(query)
    const matchBlood = !selectedBloodType.value || i.bloodType === selectedBloodType.value
    const matchStatus = !selectedStatus.value || i.status === selectedStatus.value
    return matchSearch && matchBlood && matchStatus
  })
})

const filteredRequests = computed<BloodRequest[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return requests.value.filter(r => {
    const matchSearch = !query || r.hospital.toLowerCase().includes(query) || r.id.toLowerCase().includes(query)
    const matchBlood = !selectedBloodType.value || r.bloodType === selectedBloodType.value
    const matchLocation = !selectedLocation.value || r.location === selectedLocation.value
    const matchStatus = !selectedStatus.value || r.status === selectedStatus.value
    return matchSearch && matchBlood && matchLocation && matchStatus
  })
})

// ==========================================
// 7. HELPER & MODAL METHODS
// ==========================================

const resetFilters = (): void => {
  searchQuery.value = ''
  selectedBloodType.value = ''
  selectedLocation.value = ''
  selectedStatus.value = ''
}

const switchTab = (tab: TabType): void => {
  activeTab.value = tab
  resetFilters()
}

const viewBankDetails = (bank: BloodBank) => {
  selectedBankItem.value = bank
  isModalOpen.value = true
}

const viewInventoryDetails = (item: InventoryItem) => {
  selectedInventoryItem.value = item
  isModalOpen.value = true
}

const viewRequestDetails = (request: BloodRequest) => {
  selectedRequestItem.value = request
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedBankItem.value = null
  selectedInventoryItem.value = null
  selectedRequestItem.value = null
}

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'available':
    case 'approved':
      return 'status-active'
    case 'pending':
      return 'status-pending'
    case 'low':
    case 'inactive':
    case 'rejected':
      return 'status-low'
    default:
      return ''
  }
}
</script>

<template>
  <main class="blood-management-page">
    <h1 class="main-title">Blood Management</h1>

    <!-- Tab Navigation Bar -->
    <nav class="category-cards" aria-label="Main Navigation">
      <button 
        class="card" 
        :class="{ active: activeTab === 'banks' }" 
        @click="switchTab('banks')"
      >
        <span class="icon"><i class="fas fa-hospital"></i></span>
        <h3>Blood Banks</h3>
      </button>

      <button 
        class="card" 
        :class="{ active: activeTab === 'inventory' }" 
        @click="switchTab('inventory')"
      >
        <span class="icon"><i class="fas fa-boxes"></i></span>
        <h3>Inventory</h3>
      </button>

      <button 
        class="card" 
        :class="{ active: activeTab === 'requests' }" 
        @click="switchTab('requests')"
      >
        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
        <h3>Blood Requests</h3>
      </button>
    </nav>

    <!-- Centered Larger Search Box -->
    <div class="search-container">
      <div class="search-box">
        <span class="search-icon"><i class="fas fa-search"></i></span>
        <input 
          v-model="searchQuery" 
          type="search" 
          placeholder="Search blood banks, requests, or types..." 
          aria-label="Search"
        />
      </div>
    </div>

    <!-- Odoo Alert Message -->
    <div v-if="odooError" class="alert error-alert">
      {{ odooError }}
    </div>

    <!-- Section 1: Blood Banks -->
    <section v-if="activeTab === 'banks'" class="section-container">
      <header class="section-header">
        <h2>Blood Bank</h2>
        <p class="subtitle">Manage and monitor connected Blood Banks</p>
      </header>

      <div class="controls-row">
        <div class="filter-buttons">
          <select v-model="selectedBloodType" class="filter-select">
            <option value="">Blood Type (All)</option>
            <option v-for="type in bloodTypes" :key="type" :value="type">{{ type }}</option>
          </select>

          <select v-model="selectedLocation" class="filter-select">
            <option value="">Location (All)</option>
            <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
          </select>

          <select v-model="selectedStatus" class="filter-select">
            <option value="">Status (All)</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table responsive-table">
          <thead>
            <tr>
              <th>Blood Bank</th>
              <th>Location</th>
              <th>Contact</th>
              <th>Blood Type</th>
              <th>Stock Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bank in filteredBanks" :key="bank.id">
              <td data-label="Blood Bank">{{ bank.name }}</td>
              <td data-label="Location">{{ bank.location }}</td>
              <td data-label="Contact">{{ bank.contact }}</td>
              <td data-label="Blood Type"><strong>{{ bank.bloodType }}</strong></td>
              <td data-label="Stock Level">{{ bank.stockLevel }}</td>
              <td data-label="Status"><span class="status-badge" :class="getStatusClass(bank.status)">{{ bank.status }}</span></td>
              <td data-label="Actions"><button @click="viewBankDetails(bank)" class="btn-view">View</button></td>
            </tr>
            <tr v-if="filteredBanks.length === 0">
              <td colspan="7" class="no-data">No matching blood banks found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 2: Blood Inventory -->
    <section v-if="activeTab === 'inventory'" class="section-container">
      <header class="section-header">
        <h2>Blood Inventory</h2>
        <p class="subtitle">Blood units available from each blood type and their condition</p>
      </header>

      <div class="controls-row">
        <div class="filter-buttons">
          <select v-model="selectedBloodType" class="filter-select">
            <option value="">Blood Type (All)</option>
            <option v-for="type in bloodTypes" :key="type" :value="type">{{ type }}</option>
          </select>

          <select v-model="selectedStatus" class="filter-select">
            <option value="">Status (All)</option>
            <option value="Available">Available</option>
            <option value="Low">Low Stock</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table responsive-table">
          <thead>
            <tr>
              <th>Blood Type</th>
              <th>Available</th>
              <th>Reserved</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Movement</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredInventory" :key="item.id">
              <td data-label="Blood Type"><strong>{{ item.bloodType }}</strong></td>
              <td data-label="Available">{{ item.available }}</td>
              <td data-label="Reserved">{{ item.reserved }}</td>
              <td data-label="Expiry Date">{{ item.expiryDate }}</td>
              <td data-label="Status">
                <span class="status-badge" :class="getStatusClass(item.status)">
                  {{ item.status }}
                </span>
              </td>
              <td data-label="Movement"><button @click="viewInventoryDetails(item)" class="btn-view">View</button></td>
            </tr>
            <tr v-if="filteredInventory.length === 0">
              <td colspan="6" class="no-data">No matching inventory records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 3: Blood Requests -->
    <section v-if="activeTab === 'requests'" class="section-container">
      <header class="section-header">
        <h2>Blood Requests</h2>
        <p class="subtitle">Blood requests sent by hospitals and their condition</p>
      </header>

      <div class="controls-row">
        <div class="filter-buttons">
          <select v-model="selectedBloodType" class="filter-select">
            <option value="">Blood Type (All)</option>
            <option v-for="type in bloodTypes" :key="type" :value="type">{{ type }}</option>
          </select>

          <select v-model="selectedLocation" class="filter-select">
            <option value="">Location (All)</option>
            <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
          </select>

          <select v-model="selectedStatus" class="filter-select">
            <option value="">Status (All)</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table responsive-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Hospital</th>
              <th>Blood Type</th>
              <th>Units</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in filteredRequests" :key="req.id">
              <td data-label="Request ID">{{ req.id }}</td>
              <td data-label="Hospital">{{ req.hospital }}</td>
              <td data-label="Blood Type"><strong>{{ req.bloodType }}</strong></td>
              <td data-label="Units">{{ req.units }}</td>
              <td data-label="Priority">{{ req.priority }}</td>
              <td data-label="Status">
                <span class="status-badge" :class="getStatusClass(req.status)">
                  {{ req.status }}
                </span>
              </td>
              <td data-label="Actions"><button @click="viewRequestDetails(req)" class="btn-view">View</button></td>
            </tr>
            <tr v-if="filteredRequests.length === 0">
              <td colspan="7" class="no-data">No matching blood requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ==================== VIEW POPUPS (MODALS) ==================== -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      
      <!-- Pop-up 1: Blood Bank View -->
      <div v-if="activeTab === 'banks' && selectedBankItem" class="popup-card">
        <div class="popup-icon-wrapper">
          <div class="circle-icon"><i class="fas fa-hospital"></i></div>
        </div>
        <h3>{{ selectedBankItem.name }}</h3>
        <div class="popup-grid">
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-map-marker-alt"></i></span> <strong>Location:</strong> {{ selectedBankItem.location }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-phone-alt"></i></span> <strong>Phone:</strong> {{ selectedBankItem.contact }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-check-circle"></i></span> <strong>Status:</strong> {{ selectedBankItem.status }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-tint"></i></span> <strong>Total Blood Units:</strong> {{ selectedBankItem.totalUnits || 500 }} Units
          </div>
        </div>
        <div class="popup-full-width">
          <span class="p-icon"><i class="fas fa-check-circle"></i></span> <strong>Available Blood Types:</strong> {{ selectedBankItem.availableTypes?.join(', ') || 'A-, O+, B+' }}
        </div>
        <button class="btn-close-modal" @click="closeModal">Close</button>
      </div>

      <!-- Pop-up 2: Unit Movement View -->
      <div v-if="activeTab === 'inventory' && selectedInventoryItem" class="popup-card">
        <div class="popup-icon-wrapper">
          <div class="circle-icon borderless"><i class="fas fa-sync-alt"></i></div>
        </div>
        <h3 class="popup-title-red">Unit Movement</h3>
        
        <div class="movement-flow">
          <span>{{ selectedInventoryItem.fromBank || 'Central Blood Bank' }}</span>
          <span class="arrow"><i class="fas fa-arrow-right"></i></span>
          <span>{{ selectedInventoryItem.toBank || 'Emergency Blood Bank' }}</span>
        </div>

        <div class="popup-grid">
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-tint"></i></span> <strong>Blood Type:</strong> {{ selectedInventoryItem.bloodType }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-chart-bar"></i></span> <strong>Available Units:</strong> {{ selectedInventoryItem.available }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-thumbtack"></i></span> <strong>Reserved:</strong> {{ selectedInventoryItem.reserved }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-hourglass-half"></i></span> <strong>Expiry Date:</strong> {{ selectedInventoryItem.expiryDate }}
          </div>
        </div>
        <button class="btn-close-modal" @click="closeModal">Close</button>
      </div>

      <!-- Pop-up 3: Blood Request View -->
      <div v-if="activeTab === 'requests' && selectedRequestItem" class="popup-card">
        <div class="popup-icon-wrapper">
          <div class="circle-icon"><i class="fas fa-clipboard-list"></i></div>
        </div>
        <h3>Request Details: {{ selectedRequestItem.id }}</h3>
        <div class="popup-grid">
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-hospital-alt"></i></span> <strong>Hospital:</strong> {{ selectedRequestItem.hospital }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-tint"></i></span> <strong>Blood Type:</strong> {{ selectedRequestItem.bloodType }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-boxes"></i></span> <strong>Units:</strong> {{ selectedRequestItem.units }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-bolt"></i></span> <strong>Priority:</strong> {{ selectedRequestItem.priority }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-map-marker-alt"></i></span> <strong>Location:</strong> {{ selectedRequestItem.location }}
          </div>
          <div class="popup-item">
            <span class="p-icon"><i class="fas fa-tag"></i></span> <strong>Status:</strong> {{ selectedRequestItem.status }}
          </div>
        </div>
        <div v-if="selectedRequestItem.note" class="popup-full-width">
          <span class="p-icon"><i class="fas fa-comment-alt"></i></span> <strong>Note:</strong> {{ selectedRequestItem.note }}
        </div>
        <button class="btn-close-modal" @click="closeModal">Close</button>
      </div>

    </div>
  </main>
</template>

<style scoped>
.blood-management-page {
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  box-sizing: border-box;
  width: 100%;
}

.main-title {
  text-align: center;
  color: #730b19;
  font-size: 1.8rem;
  margin-bottom: 24px;
}

/* Category Navigation */
.category-cards {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.card {
  border: 2px solid #730b19;
  border-radius: 12px;
  padding: 15px 25px;
  text-align: center;
  cursor: pointer;
  width: 180px;
  background-color: #fff;
  transition: all 0.2s ease-in-out;
}

.card.active,
.card:hover {
  background-color: #730b19;
  color: #fff;
}

.card .icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 6px;
  color: #730b19;
}

.card.active .icon,
.card:hover .icon {
  color: #fff;
}

/* Center & Large Search Box */
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 35px;
  width: 100%;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 650px;
}

.search-box input {
  width: 100%;
  padding: 14px 20px 14px 45px;
  border: 2px solid #730b19;
  border-radius: 30px;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 4px 12px rgba(115, 11, 25, 0.08);
  transition: all 0.2s;
}

.search-box input:focus {
  box-shadow: 0 4px 15px rgba(115, 11, 25, 0.2);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #730b19;
}

/* Error Alert */
.error-alert {
  background-color: #fde8e8;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

/* Controls & Filters */
.section-header {
  text-align: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #730b19;
  font-size: 1.5rem;
  margin: 0 0 4px 0;
}

.subtitle {
  color: #666;
  font-size: 0.875rem;
}

.controls-row {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  width: 100%;
}

.filter-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.filter-select {
  border: 1px solid #730b19;
  background: #fff;
  color: #333;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  flex: 1;
  min-width: 130px;
}

/* Data Table Desktop */
.table-wrapper {
  width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #730b19;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.data-table th {
  background-color: #730b19;
  color: #fff;
  padding: 12px;
  text-align: center;
}

.data-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}

.no-data {
  padding: 24px;
  color: #777;
  font-style: italic;
  text-align: center;
}

.btn-view {
  background: transparent;
  border: none;
  font-weight: bold;
  cursor: pointer;
  color: #730b19;
  padding: 4px 8px;
}

.status-badge {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-active { color: #2e7d32; }
.status-pending { color: #e65100; }
.status-low { color: #c62828; }

/* Modals / Popups */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 15px;
  box-sizing: border-box;
}

.popup-card {
  background: #fff;
  border: 3px solid #730b19;
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  max-height: 90vh;
  overflow-y: auto;
}

.popup-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.circle-icon {
  background-color: #730b19;
  color: #fff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.p-icon {
  color: #730b19;
  margin-right: 4px;
}

.popup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
  text-align: left;
  font-size: 0.9rem;
}

.popup-full-width {
  text-align: center;
  margin-top: 15px;
  font-size: 0.9rem;
}

.popup-title-red {
  color: #730b19;
  margin-bottom: 15px;
}

.movement-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  font-size: 0.95rem;
  flex-wrap: wrap;
}

.arrow {
  color: #730b19;
}

.btn-close-modal {
  margin-top: 25px;
  background-color: #730b19;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

/* ==========================================
   RESPONSIVE DESIGN: TABLE-TO-CARD FOR MOBILE
   ========================================== */

@media (max-width: 768px) {
  .blood-management-page {
    padding: 15px 10px;
  }

  .main-title {
    font-size: 1.5rem;
  }

  .category-cards {
    gap: 10px;
  }

  .card {
    width: 100%;
    max-width: 110px;
    padding: 10px 5px;
  }

  .card h3 {
    font-size: 0.8rem;
  }

  .filter-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .filter-select {
    width: 100%;
  }

  .responsive-table, 
  .responsive-table thead, 
  .responsive-table tbody, 
  .responsive-table th, 
  .responsive-table td, 
  .responsive-table tr {
    display: block;
  }

  .responsive-table thead {
    display: none; 
  }

  .responsive-table tr {
    background: #fff;
    border: 2px solid #730b19;
    border-radius: 12px;
    margin-bottom: 15px;
    padding: 15px;
    box-shadow: 0 4px 10px rgba(115, 11, 25, 0.05);
  }

  .responsive-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
    padding: 8px 0;
    border: none;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.9rem;
  }

  .responsive-table td:last-child {
    border-bottom: none;
    padding-bottom: 0;
    justify-content: center;
    margin-top: 10px;
    border-top: 1px dashed #ddd;
    padding-top: 10px;
  }

  .responsive-table td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #730b19;
    text-align: left;
    margin-right: 15px;
  }

  .popup-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    text-align: center;
  }

  .popup-card {
    padding: 20px 15px;
  }
}
</style>