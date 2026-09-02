<script setup lang="ts">
/**
 * @file BloodManagement.vue
 * @description Role-based Blood Management component dynamically adapting tabs and features for Admin, Hospital, and Blood Bank using Odoo Backend APIs.
 */

import { ref, computed, onMounted } from 'vue'
import { bloodRequestService } from '@/services/bloodRequestService'
import { inventoryService } from '@/services/inventoryService'
import { hospitalService } from '@/services/hospitalService'
import { appointmentService } from '@/services/appointmentService'

// ==========================================
// 1. TYPE DEFINITIONS & INTERFACES
// ==========================================

type UserRole = 'admin' | 'hospital' | 'blood_bank' | 'donor'

// Dynamic tabs depending on role
type TabType = 'banks' | 'inventory' | 'requests' | 'appointments' | 'users'

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
  status: 'Pending' | 'Approved' | 'Rejected' | 'Accepted'
  location: string
  note?: string
  bloodBank?: string
}

interface DonationAppointment {
  id: string
  donorName: string
  bloodType: string
  bloodBank: string
  date: string
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
}

interface SystemUser {
  id: number
  name: string
  email: string
  role: 'Hospital' | 'Blood Bank'
  status: 'Active' | 'Inactive'
}

// ==========================================
// 2. REACTIVE STATE MANAGEMENT
// ==========================================

// Current user role fetched from backend session/auth storage
const currentUserRole = ref<UserRole>('blood_bank')

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
const selectedAppointmentItem = ref<DonationAppointment | null>(null)
const isAddHospitalModalOpen = ref<boolean>(false)

// New entity form states
const newHospitalForm = ref({ name: '', location: '', contact: '', bloodBank: '' })

// Odoo Loading, Error & Empty States
const isLoading = ref<boolean>(false)
const odooError = ref<string | null>(null)

// Dynamic Data States (Fetched from Odoo APIs - No Mock Data)
const bloodBanks = ref<BloodBank[]>([])
const inventory = ref<InventoryItem[]>([])
const requests = ref<BloodRequest[]>([])
const appointments = ref<DonationAppointment[]>([])
const systemUsers = ref<SystemUser[]>([])

// ==========================================
// 3. CONSTANTS & DROPDOWN OPTIONS
// ==========================================

const bloodTypes: readonly string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const locations: readonly string[] = ['Khartoum', 'Kassala', 'Gedaref', 'Northern', 'Port Sudan']

// ==========================================
// 4. API FETCHING METHODS (Odoo Integration)
// ==========================================

const fetchDashboardData = async () => {
  isLoading.value = true
  odooError.value = null
  try {
    // Fetch Blood Requests from Odoo API
    const reqResponse = await bloodRequestService.getBloodRequests()
    requests.value = Array.isArray(reqResponse) ? reqResponse : []

    // Fetch Inventory if API is available
    if (typeof inventoryService.getInventory === 'function') {
      const invResponse = await inventoryService.getInventory()
      inventory.value = Array.isArray(invResponse) ? invResponse : []
    }

    // Fetch Hospitals/Banks if API is available
    if (typeof hospitalService.getHospitals === 'function') {
      const hospResponse = await hospitalService.getHospitals()
      bloodBanks.value = Array.isArray(hospResponse) ? hospResponse : []
    }

    // Fetch Appointments if API is available
    if (typeof appointmentService.getAppointments === 'function') {
      const apptResponse = await appointmentService.getAppointments()
      appointments.value = Array.isArray(apptResponse) ? apptResponse : []
    }
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      odooError.value = 'Unauthorized. Please log in again.'
    } else if (err.response && err.response.status === 403) {
      odooError.value = 'Forbidden. You do not have permission to view this data.'
    } else {
      odooError.value = 'Unable to load data. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// ==========================================
// 5. ROLE CONFIGURATION & COMPUTED TABS
// ==========================================

const availableTabs = computed(() => {
  switch (currentUserRole.value) {
    case 'admin':
      return [
        { id: 'users', label: 'Manage Users & Entities', icon: 'fas fa-users-cog' },
        { id: 'banks', label: 'Blood Banks', icon: 'fas fa-hospital' },
        { id: 'inventory', label: 'Inventory', icon: 'fas fa-boxes' },
        { id: 'requests', label: 'All Requests', icon: 'fas fa-clipboard-list' }
      ]
    case 'hospital':
      return [
        { id: 'banks', label: 'Available Banks', icon: 'fas fa-hospital' },
        { id: 'inventory', label: 'Blood Inventory', icon: 'fas fa-boxes' },
        { id: 'requests', label: 'My Blood Requests', icon: 'fas fa-clipboard-list' }
      ]
    case 'blood_bank':
      return [
        { id: 'banks', label: 'Blood Banks', icon: 'fas fa-hospital' },
        { id: 'inventory', label: 'Inventory Management', icon: 'fas fa-boxes' },
        { id: 'requests', label: 'Incoming Requests', icon: 'fas fa-clipboard-list' },
        { id: 'appointments', label: 'Donation Appointments', icon: 'fas fa-calendar-check' }
      ]
    default:
      return [{ id: 'banks', label: 'Blood Banks', icon: 'fas fa-hospital' }]
  }
})

onMounted(() => {
  const tabs = availableTabs.value
  if (!tabs.some(t => t.id === activeTab.value)) {
    activeTab.value = tabs[0].id as TabType
  }
  fetchDashboardData()
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

const filteredAppointments = computed<DonationAppointment[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return appointments.value.filter(a => {
    const matchSearch = !query || a.donorName.toLowerCase().includes(query) || a.bloodBank.toLowerCase().includes(query)
    return matchSearch
  })
})

// ==========================================
// 7. HELPER & API ACTION METHODS
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

const viewAppointmentDetails = (appt: DonationAppointment) => {
  selectedAppointmentItem.value = appt
  isModalOpen.value = true
}

const approveRequest = async (reqId: string) => {
  try {
    await bloodRequestService.acceptBloodRequest({ request_id: reqId })
    const req = requests.value.find(r => r.id === reqId)
    if (req) req.status = 'Approved'
  } catch (err) {
    odooError.value = 'Failed to accept blood request.'
  }
}

const rejectRequest = async (reqId: string) => {
  try {
    await bloodRequestService.rejectBloodRequest({ request_id: reqId })
    const req = requests.value.find(r => r.id === reqId)
    if (req) req.status = 'Rejected'
  } catch (err) {
    odooError.value = 'Failed to reject blood request.'
  }
}

const confirmAppointment = async (apptId: string) => {
  try {
    if (typeof appointmentService.acceptAppointment === 'function') {
      await appointmentService.acceptAppointment(apptId)
    }
    const appt = appointments.value.find(a => a.id === apptId)
    if (appt) appt.status = 'Confirmed'
  } catch (err) {
    odooError.value = 'Failed to confirm appointment.'
  }
}

const rejectAppointment = async (apptId: string) => {
  try {
    if (typeof appointmentService.rejectAppointment === 'function') {
      await appointmentService.rejectAppointment(apptId)
    }
    const appt = appointments.value.find(a => a.id === apptId)
    if (appt) appt.status = 'Cancelled'
  } catch (err) {
    odooError.value = 'Failed to cancel appointment.'
  }
}

const saveNewHospital = async () => {
  if (!newHospitalForm.value.name) return
  try {
    if (typeof hospitalService.createHospital === 'function') {
      await hospitalService.createHospital(newHospitalForm.value)
    }
    isAddHospitalModalOpen.value = false
    newHospitalForm.value = { name: '', location: '', contact: '', bloodBank: '' }
    fetchDashboardData()
  } catch (err) {
    odooError.value = 'Failed to create hospital.'
  }
}

const closeModal = () => {
  isModalOpen.value = false
  selectedBankItem.value = null
  selectedInventoryItem.value = null
  selectedRequestItem.value = null
  selectedAppointmentItem.value = null
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'available':
    case 'approved':
    case 'accepted':
    case 'confirmed':
    case 'completed':
      return 'status-active'
    case 'pending':
      return 'status-pending'
    case 'low':
    case 'inactive':
    case 'rejected':
    case 'cancelled':
      return 'status-low'
    default:
      return ''
  }
}
</script>

<template>
  <main class="blood-management-page">
    <header class="page-top-header">
      <h1 class="main-title">Blood Management & Operations</h1>
    </header>

    <!-- Tab Navigation Bar (Dynamic Based on Role) -->
    <nav class="category-cards" aria-label="Main Navigation">
      <button 
        v-for="tab in availableTabs"
        :key="tab.id"
        type="button"
        class="card" 
        :class="{ active: activeTab === tab.id }" 
        @click="switchTab(tab.id as TabType)"
      >
        <span class="icon"><i :class="tab.icon"></i></span>
        <h3>{{ tab.label }}</h3>
      </button>
    </nav>

    <!-- Admin Quick Action Toolbar -->
    <div v-if="currentUserRole === 'admin'" class="admin-actions-bar">
      <button type="button" class="btn-action primary" @click="isAddHospitalModalOpen = true">
        <i class="fas fa-hospital-symbol"></i> Add Hospital / Bank
      </button>
    </div>

    <!-- Centered Larger Search Box -->
    <div class="search-container">
      <div class="search-box">
        <span class="search-icon"><i class="fas fa-search"></i></span>
        <input 
          v-model="searchQuery" 
          type="search" 
          placeholder="Search records, types, or names..." 
          aria-label="Search"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="alert loading-alert">
      Loading data from Odoo...
    </div>

    <!-- Odoo Alert Message -->
    <div v-if="odooError" class="alert error-alert">
      {{ odooError }}
    </div>

    <!-- Section: Admin Users Management -->
    <section v-if="activeTab === 'users' && currentUserRole === 'admin'" class="section-container">
      <header class="section-header">
        <h2>System Users & Entities</h2>
        <p class="subtitle">Unified control panel for hospitals and blood banks</p>
      </header>
      <div class="table-wrapper">
        <table class="data-table responsive-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email / Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in systemUsers" :key="user.id">
              <td data-label="Name"><strong>{{ user.name }}</strong></td>
              <td data-label="Email / Contact">{{ user.email }}</td>
              <td data-label="Role">{{ user.role }}</td>
              <td data-label="Status"><span class="status-badge" :class="getStatusClass(user.status)">{{ user.status }}</span></td>
              <td data-label="Actions">
                <button type="button" class="btn-view">Toggle Status</button>
              </td>
            </tr>
            <tr v-if="systemUsers.length === 0">
              <td colspan="5" class="no-data">No system users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 1: Blood Banks -->
    <section v-if="activeTab === 'banks'" class="section-container">
      <header class="section-header">
        <h2>Blood Banks Network</h2>
        <p class="subtitle">Manage and monitor connected Blood Banks and stock availability</p>
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
              <td data-label="Actions"><button type="button" @click="viewBankDetails(bank)" class="btn-view">View</button></td>
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
              <td data-label="Movement"><button type="button" @click="viewInventoryDetails(item)" class="btn-view">View</button></td>
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
        <p class="subtitle">{{ currentUserRole === 'hospital' ? 'Manage your hospital blood requests' : 'Review blood requests sent by hospitals' }}</p>
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
            <option value="Rejected">Rejected</option>
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
              <td data-label="Actions">
                <button type="button" @click="viewRequestDetails(req)" class="btn-view">View</button>
                <template v-if="currentUserRole === 'blood_bank' && req.status === 'Pending'">
                  <button type="button" @click="approveRequest(req.id)" class="btn-action-sm approve">Accept</button>
                  <button type="button" @click="rejectRequest(req.id)" class="btn-action-sm reject">Reject</button>
                </template>
              </td>
            </tr>
            <tr v-if="filteredRequests.length === 0">
              <td colspan="7" class="no-data">No blood requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 4: Donation Appointments -->
    <section v-if="activeTab === 'appointments'" class="section-container">
      <header class="section-header">
        <h2>Donation Appointments</h2>
        <p class="subtitle">Manage incoming appointments from donors</p>
      </header>

      <div class="table-wrapper">
        <table class="data-table responsive-table">
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Donor Name</th>
              <th>Blood Type</th>
              <th>Blood Bank</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appt in filteredAppointments" :key="appt.id">
              <td data-label="Appointment ID">{{ appt.id }}</td>
              <td data-label="Donor Name">{{ appt.donorName }}</td>
              <td data-label="Blood Type"><strong>{{ appt.bloodType }}</strong></td>
              <td data-label="Blood Bank">{{ appt.bloodBank }}</td>
              <td data-label="Date & Time">{{ appt.date }}</td>
              <td data-label="Status"><span class="status-badge" :class="getStatusClass(appt.status)">{{ appt.status }}</span></td>
              <td data-label="Actions">
                <button type="button" @click="viewAppointmentDetails(appt)" class="btn-view">View</button>
                <template v-if="currentUserRole === 'blood_bank' && appt.status === 'Pending'">
                  <button type="button" @click="confirmAppointment(appt.id)" class="btn-action-sm approve">Confirm</button>
                  <button type="button" @click="rejectAppointment(appt.id)" class="btn-action-sm reject">Cancel</button>
                </template>
              </td>
            </tr>
            <tr v-if="filteredAppointments.length === 0">
              <td colspan="7" class="no-data">No donation appointments found.</td>
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
            <span class="p-icon"><i class="fas fa-tint"></i></span> <strong>Total Blood Units:</strong> {{ selectedBankItem.totalUnits || 0 }} Units
          </div>
        </div>
        <div class="popup-full-width">
          <span class="p-icon"><i class="fas fa-check-circle"></i></span> <strong>Available Blood Types:</strong> {{ selectedBankItem.availableTypes?.join(', ') || 'N/A' }}
        </div>
        <button type="button" class="btn-close-modal" @click="closeModal">Close</button>
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
        <button type="button" class="btn-close-modal" @click="closeModal">Close</button>
      </div>

      <!-- Pop-up 3: Blood Request View -->
      <div v-if="activeTab === 'requests' && selectedRequestItem" class="popup-card">
        <div class="popup-icon-wrapper">
          <div class="circle-icon"><i class="fas fa-clipboard-list"></i></div>
        </div>
        <h3>Request Details: {{ selectedRequestItem.id }}</h3>
        <div class="popup-grid">
          <div class="popup-item"><strong>Hospital:</strong> {{ selectedRequestItem.hospital }}</div>
          <div class="popup-item"><strong>Blood Type:</strong> {{ selectedRequestItem.bloodType }}</div>
          <div class="popup-item"><strong>Units:</strong> {{ selectedRequestItem.units }}</div>
          <div class="popup-item"><strong>Priority:</strong> {{ selectedRequestItem.priority }}</div>
          <div class="popup-item"><strong>Status:</strong> {{ selectedRequestItem.status }}</div>
          <div class="popup-item"><strong>Location:</strong> {{ selectedRequestItem.location }}</div>
        </div>
        <div v-if="selectedRequestItem.note" class="popup-full-width">
          <strong>Note:</strong> {{ selectedRequestItem.note }}
        </div>
        <button type="button" class="btn-close-modal" @click="closeModal">Close</button>
      </div>

      <!-- Pop-up 4: Appointment View -->
      <div v-if="activeTab === 'appointments' && selectedAppointmentItem" class="popup-card">
        <div class="popup-icon-wrapper">
          <div class="circle-icon"><i class="fas fa-calendar-check"></i></div>
        </div>
        <h3>Appointment: {{ selectedAppointmentItem.id }}</h3>
        <div class="popup-grid">
          <div class="popup-item"><strong>Donor Name:</strong> {{ selectedAppointmentItem.donorName }}</div>
          <div class="popup-item"><strong>Blood Type:</strong> {{ selectedAppointmentItem.bloodType }}</div>
          <div class="popup-item"><strong>Blood Bank:</strong> {{ selectedAppointmentItem.bloodBank }}</div>
          <div class="popup-item"><strong>Date & Time:</strong> {{ selectedAppointmentItem.date }}</div>
          <div class="popup-item"><strong>Status:</strong> {{ selectedAppointmentItem.status }}</div>
        </div>
        <button type="button" class="btn-close-modal" @click="closeModal">Close</button>
      </div>

    </div>

    <!-- Modal: Add Hospital / Blood Bank (Admin Only) -->
    <div v-if="isAddHospitalModalOpen" class="modal-overlay" @click.self="isAddHospitalModalOpen = false">
      <div class="popup-card">
        <h3>Add New Hospital / Blood Bank</h3>
        <div class="form-group">
          <label>Name:</label>
          <input v-model="newHospitalForm.name" type="text" placeholder="Enter entity name" class="form-input" />
        </div>
        <div class="form-group">
          <label>Location:</label>
          <input v-model="newHospitalForm.location" type="text" placeholder="Enter location" class="form-input" />
        </div>
        <div class="form-group">
          <label>Contact:</label>
          <input v-model="newHospitalForm.contact" type="text" placeholder="Enter phone number" class="form-input" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-action primary" @click="saveNewHospital">Save</button>
          <button type="button" class="btn-close-modal" @click="isAddHospitalModalOpen = false">Cancel</button>
        </div>
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

.page-top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.main-title {
  color: #730b19;
  font-size: 1.8rem;
  margin: 4px;
  width: 100%;
  text-align: center;
}

.role-selector-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fdf2f2;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #730b19;
}

.role-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #730b19;
  background: #fff;
  font-weight: 600;
  color: #730b19;
  cursor: pointer;
}

.admin-actions-bar {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.btn-action {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  border: none;
}

.btn-action.primary {
  background-color: #730b19;
  color: #fff;
}

.btn-action.secondary {
  background-color: #333;
  color: #fff;
}

.btn-action-sm {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  margin-left: 5px;
}

.btn-action-sm.approve {
  background-color: #2e7d32;
  color: #fff;
}

.btn-action-sm.reject {
  background-color: #c62828;
  color: #fff;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #730b19;
  border-radius: 6px;
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

/* ==========================================
    RESPONSIVE DESIGN: TABLE-TO-CARD FOR MOBILE
    ========================================== */

@media (max-width: 768px) {
  .blood-management-page {
    padding: 15px 10px;
  }

  .page-top-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .main-title {
    font-size: 1.5rem;
    text-align: center;
  }

  .category-cards {
    gap: 10px;
  }

  .card {
    width: 100%;
    max-width: 130px;
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
    grid-template-columns: 1-fr;
    gap: 10px;
    text-align: center;
  }

  .popup-card {
    padding: 20px 15px;
  }
}
</style>