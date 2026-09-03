<template>
  <div class="dashboard-container" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
    <!-- Header Section -->
    <header class="dashboard-header">
      <div class="header-actions">
        <!-- Language Switcher Button -->
        <button class="lang-btn" @click="toggleLanguage" aria-label="Toggle Language">
          <i class="fa-solid fa-globe"></i> <span>{{ currentLang === 'ar' ? 'English' : 'العربية' }}</span>
        </button>
        <!-- Role Indicator / Display -->
        <div class="role-display-wrapper">
          <span class="role-badge-header">{{ roleTitle }}</span>
        </div>
      </div>
      <h1 class="page-title">MADAD — {{ roleTitle }}</h1>
    </header>

    <!-- Global Loading / Error Feedback -->
    <div v-if="loading" class="feedback-message">
      <i class="fa-solid fa-circle-notch fa-spin"></i> {{ t('loading') }}
    </div>
    <div v-if="errorMessage" class="feedback-message error">
      <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
    </div>

    <!-- Main Dashboard Unified Layout -->
    <div class="dashboard-grid" v-if="!loading">
      
      <!-- Left Main Panel -->
      <div class="left-panel">
        
        <!-- Welcome Message & Dynamic Statistics Cards -->
        <div class="welcome-banner">
          <h2>{{ t('welcomeBack') }}, {{ userDisplayName }}</h2>
        </div>

        <div :class="['stats-row', 'grid-cols-' + currentStats.length]">
          <div 
            v-for="(stat, idx) in currentStats" 
            :key="idx" 
            :class="['stat-card', { highlight: stat.highlight }]"
          >
            <div class="stat-title">
              <i :class="stat.icon"></i> {{ stat.label }}
            </div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>

        <!-- Role-Specific Secondary Stats Row -->
        <div class="secondary-stats-row" v-if="secondaryStats.length > 0">
          <div v-for="(secStat, sIdx) in secondaryStats" :key="sIdx" class="stat-card secondary-card">
            <div class="stat-title"><i :class="secStat.icon"></i> {{ secStat.label }}</div>
            <div class="stat-value">{{ secStat.value }}</div>
          </div>
        </div>

        <!-- Middle Row: Charts or Visual Overviews & Activity Alerts -->
        <div class="middle-row">
          
          <!-- Chart Card / Visual Section -->
          <div class="card-box chart-card-box">
            <h2 class="card-title">
              <i class="fa-solid fa-chart-pie"></i> {{ chartSectionTitle }}
            </h2>

            <!-- Admin / Blood Bank: Blood Stock Bar Representation -->
            <div v-if="currentRole === 'admin' || currentRole === 'blood_bank'" class="stock-bar-chart">
              <template v-if="bloodInventory.length > 0">
                <div v-for="item in bloodInventory" :key="item.bloodType" class="bar-row">
                  <span class="blood-type-label">{{ item.bloodType }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ width: getBarWidth(item.quantity) }" :class="getStatusClass(item.status)"></div>
                  </div>
                  <span class="bar-qty">{{ item.quantity }}</span>
                </div>
              </template>
              <div v-else class="request-details">
                <p>{{ t('noInventory') }}</p>
              </div>
            </div>

            <!-- Hospital: Blood Type Quick Search Tool -->
            <div v-else-if="currentRole === 'hospital'" class="hospital-search-section">
              <div class="search-input-group">
                <label>{{ t('searchBloodType') }}:</label>
                <select v-model="selectedSearchType" class="styled-select" aria-label="Search Blood Type">
                  <option value="">{{ t('allTypes') }}</option>
                  <option v-for="tName in allBloodTypes" :key="tName" :value="tName">{{ tName }}</option>
                </select>
              </div>
              <div class="mini-table-container table-responsive">
                <table class="blood-table mini-table">
                  <thead>
                    <tr>
                      <th>{{ t('bank') }}</th>
                      <th>{{ t('bloodType') }}</th>
                      <th>{{ t('available') }}</th>
                      <th>{{ t('status') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="filteredHospitalAvailability.length > 0">
                      <tr v-for="(res, rIdx) in filteredHospitalAvailability" :key="rIdx">
                        <td>{{ res.bank }}</td>
                        <td><strong>{{ res.bloodType }}</strong></td>
                        <td>{{ res.quantity }}</td>
                        <td>
                          <span :class="['status-badge', getStatusClass(res.status)]">{{ res.status }}</span>
                        </td>
                      </tr>
                    </template>
                    <tr v-else>
                      <td colspan="4" class="text-center">{{ t('noInventory') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Donor: Impact & Upcoming Appointments -->
            <div v-else-if="currentRole === 'donor'" class="donor-overview-content">
              <div class="donor-info-snippet">
                <p><i class="fa-solid fa-award"></i> <strong>{{ t('donorBadge') }}:</strong> {{ donorInfo.badge || '-' }}</p>
                <p><i class="fa-solid fa-calendar-days"></i> <strong>{{ t('nextEligibleDate') }}:</strong> {{ donorInfo.nextEligibleDate || '-' }}</p>
                <p><i class="fa-solid fa-heart-pulse"></i> <strong>{{ t('livesSavedCount') }}:</strong> {{ donorInfo.livesSaved ?? 0 }} {{ t('units') }}</p>
              </div>
            </div>

          </div>

          <!-- Recent Activity / Alerts Card -->
          <div class="card-box">
            <h2 class="card-title">
              <i class="fa-solid fa-bell"></i> {{ t('alertsAndActivity') }}
            </h2>
            <ul class="alerts-list" v-if="alerts.length > 0">
              <li v-for="(alert, index) in alerts" :key="index">
                <i :class="alert.icon || 'fa-solid fa-triangle-exclamation'" class="alert-icon"></i> 
                <div>
                  <strong>{{ alert.title }}</strong>
                  <p>{{ alert.message }}</p>
                </div>
              </li>
            </ul>
            <div v-else class="request-details">
              <p>{{ t('noAlerts') }}</p>
            </div>
          </div>

        </div>

        <!-- Recent Requests Table / Expiring Soon Section -->
        <div class="bottom-section-grid">
          
          <!-- Recent Requests Table (Admin, Blood Bank, Hospital) -->
          <div class="card-box wide-card" v-if="currentRole !== 'donor'">
            <h2 class="card-title">
              <i class="fa-solid fa-file-waveform"></i> {{ t('recentRequests') }}
            </h2>
            
            <template v-if="recentRequests.length > 0">
              <div class="table-responsive">
                <table class="blood-table">
                  <thead>
                    <tr>
                      <th>{{ t('hospital') }}</th>
                      <th>{{ t('bloodType') }}</th>
                      <th>{{ t('units') }}</th>
                      <th v-if="currentRole === 'blood_bank'">{{ t('priority') }}</th>
                      <th>{{ t('status') }}</th>
                      <th v-if="currentRole === 'blood_bank'">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(req, index) in recentRequests" :key="index">
                      <td>{{ req.hospital }}</td>
                      <td><strong>{{ req.bloodType }}</strong></td>
                      <td>{{ req.units }}</td>
                      <td v-if="currentRole === 'blood_bank'">
                        <span :class="['priority-badge', (req.priority || 'normal').toLowerCase()]">{{ req.priority || 'Normal' }}</span>
                      </td>
                      <td>
                        <span :class="['status-badge', getRequestStatusClass(req.status)]">{{ req.status }}</span>
                      </td>
                      <td v-if="currentRole === 'blood_bank'">
                        <button class="action-btn accept-btn" @click="handleAcceptRequest(req.request_id || req.id)">Accept</button>
                        <button class="action-btn reject-btn" @click="handleRejectRequest(req.request_id || req.id)">Reject</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <template v-else>
              <div class="request-details">
                <p>{{ t('noRequests') }}</p>
              </div>
            </template>

          </div>

          <!-- Expiring Soon Unit Warnings -->
          <div class="card-box expiring-card" v-if="currentRole === 'blood_bank' || currentRole === 'admin'">
            <h2 class="card-title">
              <i class="fa-solid fa-triangle-exclamation"></i> {{ t('expiringSoon') }}
            </h2>
            <ul class="expiring-list" v-if="expiringUnits.length > 0">
              <li v-for="(exp, eIdx) in expiringUnits" :key="eIdx">
                <div class="exp-badge">{{ exp.bloodType }} — {{ exp.units }} {{ t('units') }}</div>
                <div class="exp-date"><i class="fa-regular fa-clock"></i> {{ t('expiry') }}: {{ exp.expiryDate }}</div>
              </li>
            </ul>
            <div v-else class="request-details">
              <p>No expiring units found.</p>
            </div>
          </div>

        </div>

      </div>

      <!-- Right Sidebar: Full Inventory / Quick Management Table -->
      <div class="sidebar-table-box">
        <h3 class="sidebar-table-title"><i class="fa-solid fa-boxes-stacked"></i> {{ t('bloodStockOverview') }}</h3>
        
        <template v-if="bloodInventory.length > 0">
          <div class="table-responsive">
            <table class="blood-table">
              <thead>
                <tr>
                  <th>{{ t('status') }}</th>
                  <th>{{ t('quantity') }}</th>
                  <th>{{ t('bloodType') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in bloodInventory" :key="item.bloodType">
                  <td>
                    <span :class="['status-badge', getStatusClass(item.status)]">
                      {{ item.status }}
                    </span>
                  </td>
                  <td>{{ item.quantity }}</td>
                  <td><strong>{{ item.bloodType }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <template v-else>
          <div class="request-details">
            <p>{{ t('noInventory') }}</p>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { authService } from '@/services/authService'
import { bloodRequestService } from '@/services/bloodRequestService'
import { inventoryService } from '@/services/inventoryService'
import { notificationService } from '@/services/notificationService'

export default {
  name: 'UnifiedDashboardView',
  setup() {
    const loading = ref(false)
    const errorMessage = ref(null)
    const currentLang = ref('en')
    const currentRole = ref('admin')
    const userDisplayName = ref('User')
    const selectedSearchType = ref('')

    const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

    const bloodInventory = ref([])
    const recentRequests = ref([])
    const alerts = ref([])
    const expiringUnits = ref([])
    const currentStats = ref([])
    const secondaryStats = ref([])
    const hospitalAvailability = ref([])
    const donorInfo = ref({})

    const translations = {
      en: {
        loading: 'Loading dashboard data...',
        welcomeBack: 'Welcome back',
        alertsAndActivity: 'Alerts & Activity',
        noAlerts: 'No new alerts or activity notifications.',
        recentRequests: 'Recent Blood Requests',
        hospital: 'Hospital',
        units: 'Units',
        priority: 'Priority',
        status: 'Status',
        noRequests: 'No recent requests found.',
        expiringSoon: 'Expiring Soon (Next 7 Days)',
        expiry: 'Expiry',
        bloodStockOverview: 'Blood Stock Overview',
        noInventory: 'Inventory data unavailable.',
        searchBloodType: 'Search Blood Type',
        allTypes: 'All Types',
        bank: 'Blood Bank',
        available: 'Available',
        donorBadge: 'Donor Rank',
        nextEligibleDate: 'Next Eligible Donation',
        livesSavedCount: 'Lives Impacted',
        quantity: 'Quantity'
      },
      ar: {
        loading: 'جاري تحميل بيانات لوحة التحكم...',
        welcomeBack: 'أهلاً بك مجدداً',
        alertsAndActivity: 'التنبيهات والأنشطة',
        noAlerts: 'لا توجد تنبيهات أو إشعارات نشاط جديدة.',
        recentRequests: 'طلبات الدم الأخيرة',
        hospital: 'المستشفى',
        units: 'الوحدات',
        priority: 'الأولوية',
        status: 'الحالة',
        noRequests: 'لا توجد طلبات حديثة.',
        expiringSoon: 'تنتهي صلاحيتها قريباً (خلال 7 أيام)',
        expiry: 'انتهاء الصلاحية',
        bloodStockOverview: 'نظرة عامة على مخزون الدم',
        noInventory: 'بيانات المخزون غير متوفرة.',
        searchBloodType: 'البحث عن فصيلة الدم',
        allTypes: 'جميع الفصائل',
        bank: 'بنك الدم',
        available: 'متوفر',
        donorBadge: 'رتبة المتبرع',
        nextEligibleDate: 'موعد التبرع القادم',
        livesSavedCount: 'الأرواح التي تم إنقاذها',
        quantity: 'الكمية'
      }
    }

    const t = (key) => {
      return translations[currentLang.value][key] || key
    }

    const roleTitlesMap = {
      admin: 'Admin Dashboard',
      blood_bank: 'Central Blood Bank Dashboard',
      hospital: 'Hospital Portal',
      donor: 'Donor Portal'
    }

    const roleTitle = computed(() => roleTitlesMap[currentRole.value] || 'Dashboard')

    const chartSectionTitle = computed(() => {
      if (currentRole.value === 'hospital') return 'Cross-Bank Blood Availability'
      if (currentRole.value === 'donor') return 'Donor Impact Overview'
      return 'Blood Inventory Distribution'
    })

    const filteredHospitalAvailability = computed(() => {
      const list = hospitalAvailability.value
      if (!selectedSearchType.value) return list
      return list.filter(item => item.bloodType === selectedSearchType.value)
    })

    const loadDashboardData = async () => {
      loading.value = true
      errorMessage.value = null
      try {
        const user = authService.getCurrentUser()
        if (user) {
          currentRole.value = user.role || 'donor'
          userDisplayName.value = user.name || 'User'
        }

        // جلب طلبات الدم من الخدمة بناءً على الدور
        if (currentRole.value !== 'donor') {
          const reqs = await bloodRequestService.getRequests()
          recentRequests.value = reqs || []
        } else {
          recentRequests.value = []
        }

        // جلب بيانات المخزون الفعلية
        if (typeof inventoryService !== 'undefined' && inventoryService.getInventory) {
          const inventoryData = await inventoryService.getInventory()
          bloodInventory.value = inventoryData || []
        } else {
          bloodInventory.value = []
        }

        // جلب الإشعارات النشطة
        if (typeof notificationService !== 'undefined' && notificationService.getNotifications) {
          const alertData = await notificationService.getNotifications()
          alerts.value = alertData || []
        } else {
          alerts.value = []
        }

        // جلب البيانات الخاصة بالمتبرع إن وجد
        if (currentRole.value === 'donor' && typeof authService.getDonorProfile === 'function') {
          const profile = await authService.getDonorProfile()
          donorInfo.value = profile || {}
        } else {
          donorInfo.value = {}
        }

        updateCalculatedStats()

      } catch (err) {
        errorMessage.value = err.message || 'Unable to load data. Please try again.'
      } finally {
        loading.value = false
      }
    }

    const updateCalculatedStats = () => {
      const totalUnits = bloodInventory.value.reduce((acc, item) => acc + (item.quantity || 0), 0)
      const lowStockCount = bloodInventory.value.filter(item => (item.status || '').toLowerCase() === 'low').length

      if (currentRole.value === 'admin') {
        currentStats.value = [
          { label: 'Total Donors', value: '-', icon: 'fa-solid fa-user-group' },
          { label: 'Total Hospitals', value: '-', icon: 'fa-solid fa-hospital' },
          { label: 'Blood Banks', value: '-', icon: 'fa-solid fa-warehouse' },
          { label: 'Blood Requests', value: recentRequests.value.length, icon: 'fa-solid fa-file-waveform', highlight: true }
        ]
      } else if (currentRole.value === 'blood_bank') {
        currentStats.value = [
          { label: 'Total Blood Units', value: totalUnits, icon: 'fa-solid fa-bottle-droplet' },
          { label: 'Available Units', value: totalUnits, icon: 'fa-solid fa-circle-check', highlight: true },
          { label: 'Low Stock Items', value: lowStockCount, icon: 'fa-solid fa-triangle-exclamation' },
          { label: 'Critical Items', value: '0', icon: 'fa-solid fa-fire' }
        ]
      } else if (currentRole.value === 'hospital') {
        currentStats.value = [
          { label: 'Active Requests', value: recentRequests.value.length, icon: 'fa-solid fa-file-waveform', highlight: true },
          { label: 'Fulfilled Units', value: '-', icon: 'fa-solid fa-square-check' },
          { label: 'Emergency Quota', value: '-', icon: 'fa-solid fa-kit-medical' }
        ]
      } else if (currentRole.value === 'donor') {
        currentStats.value = [
          { label: 'Total Donations', value: donorInfo.value.totalDonations ?? '-', icon: 'fa-solid fa-hand-holding-droplet', highlight: true },
          { label: 'Lives Saved', value: donorInfo.value.livesSaved ?? '-', icon: 'fa-solid fa-heart' },
          { label: 'Blood Group', value: donorInfo.value.bloodType ?? '-', icon: 'fa-solid fa-droplet' }
        ]
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    const toggleLanguage = () => {
      currentLang.value = currentLang.value === 'en' ? 'ar' : 'en'
    }

    const handleAcceptRequest = async (requestId) => {
      try {
        await bloodRequestService.acceptRequest(requestId)
        await loadDashboardData()
      } catch (err) {
        errorMessage.value = err.message || 'Failed to accept request.'
      }
    }

    const handleRejectRequest = async (requestId) => {
      try {
        await bloodRequestService.rejectRequest(requestId)
        await loadDashboardData()
      } catch (err) {
        errorMessage.value = err.message || 'Failed to reject request.'
      }
    }

    const getBarWidth = (qty) => {
      const max = 500
      const percentage = Math.min(Math.max(((qty || 0) / max) * 100, 5), 100)
      return `${percentage}%`
    }

    const getStatusClass = (status) => {
      switch ((status || '').toLowerCase()) {
        case 'available': return 'status-available'
        case 'low': return 'status-low'
        case 'critical': return 'status-critical'
        default: return 'status-default'
      }
    }

    const getRequestStatusClass = (status) => {
      switch ((status || '').toLowerCase()) {
        case 'fulfilled': return 'status-available'
        case 'approved': return 'status-available'
        case 'accepted': return 'status-available'
        case 'pending': return 'status-low'
        default: return 'status-critical'
      }
    }

    return {
      loading,
      errorMessage,
      currentLang,
      currentRole,
      selectedSearchType,
      allBloodTypes,
      roleTitle,
      userDisplayName,
      currentStats,
      secondaryStats,
      bloodInventory,
      recentRequests,
      alerts,
      expiringUnits,
      chartSectionTitle,
      filteredHospitalAvailability,
      donorInfo,
      t,
      toggleLanguage,
      handleAcceptRequest,
      handleRejectRequest,
      getBarWidth,
      getStatusClass,
      getRequestStatusClass
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: inherit;
  color: #1e293b;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #9b0103;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.lang-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  transition: all 0.2s ease;
}

.lang-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.role-badge-header {
  background-color: #fee2e2;
  color: #9b0103;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #fecaca;
}

.styled-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.feedback-message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  background-color: #e0f2fe;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feedback-message.error {
  background-color: #fee2e2;
  color: #991b1b;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-banner h2 {
  font-size: 1.25rem;
  color: #0f172a;
  margin: 0 0 16px 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.secondary-stats-row {
  display: grid;
  grid-template-columns: 1fr;
}

.stat-card {
  background: #ffffff;
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.stat-card.highlight {
  border-left: 4px solid #9b0103;
}

.stat-title {
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.middle-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .middle-row {
    grid-template-columns: 1fr;
  }
}

.card-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stock-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.blood-type-label {
  width: 40px;
  font-weight: 700;
  font-size: 0.875rem;
  color: #334155;
}

.bar-track {
  flex-grow: 1;
  background-color: #f1f5f9;
  border-radius: 6px;
  height: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s ease;
}

.bar-qty {
  width: 40px;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.alerts-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alerts-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 0.875rem;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.alerts-list li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.alert-icon {
  color: #d97706;
  margin-top: 3px;
}

.bottom-section-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .bottom-section-grid {
    grid-template-columns: 1fr;
  }
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.blood-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.blood-table th, .blood-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
}

.blood-table th {
  font-weight: 600;
  color: #64748b;
  background-color: #f8fafc;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.status-available {
  background-color: #dcfce7;
  color: #166534;
}

.status-low {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-critical {
  background-color: #fee2e2;
  color: #991b1b;
}

.priority-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-badge.high {
  background-color: #fee2e2;
  color: #991b1b;
}

.priority-badge.normal {
  background-color: #e0f2fe;
  color: #0369a1;
}

.action-btn {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 4px;
}

.accept-btn {
  background-color: #dcfce7;
  color: #166534;
}

.reject-btn {
  background-color: #fee2e2;
  color: #991b1b;
}

.expiring-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expiring-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fffbeb;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #fde68a;
  font-size: 0.875rem;
}

.exp-badge {
  font-weight: 700;
  color: #92400e;
}

.exp-date {
  color: #b45309;
  font-size: 0.75rem;
}

.sidebar-table-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.sidebar-table-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.donor-info-snippet p {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
  color: #334155;
  font-size: 0.95rem;
}

.donor-info-snippet i {
  color: #9b0103;
}
</style>