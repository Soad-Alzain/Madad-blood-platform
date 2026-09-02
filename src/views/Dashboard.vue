<template>
  <div class="dashboard-container" dir="ltr">
    <!-- Header Section -->
    <header class="dashboard-header">
      <h1 class="page-title">Dashboard</h1>
      <div class="menu-icon" @click="toggleSidebar" aria-label="Toggle Menu">
        <i class="fa-solid fa-bars"></i>
      </div>
    </header>

    <!-- Global Loading / Error Feedback -->
    <div v-if="loading" class="feedback-message">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading dashboard data...
    </div>
    <div v-if="errorMessage" class="feedback-message error">
      <i class="fa-solid fa-triangle-exclamation"></i> {{ errorMessage }}
    </div>

    <!-- Main Dashboard Grid Layout -->
    <div class="dashboard-grid" v-if="!loading">
      
      <!-- Left Panel: Statistics, Middle Cards, and Quick Actions -->
      <div class="left-panel">
        
        <!-- Statistics Overview Row -->
        <div class="stats-row">
          <div class="stat-card highlight">
            <div class="stat-title">
              <i class="fa-solid fa-droplet"></i> Blood Stock
            </div>
            <div class="stat-value">{{ totalStock }} Units</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">
              <i class="fa-solid fa-users"></i> Total Donors
            </div>
            <div class="stat-value">{{ formattedDonors }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">
              <i class="fa-solid fa-file-medical"></i> Blood Requests
            </div>
            <div class="stat-value">{{ formattedRequests }}</div>
          </div>
        </div>

        <!-- Middle Row: Latest Requests & Real-time Alerts -->
        <div class="middle-row">
          
          <!-- Latest Blood Request Card -->
          <div class="card-box">
            <h2 class="card-title">
              <i class="fa-solid fa-clock-rotate-left"></i> Latest Request
            </h2>
            <div class="request-details" v-if="latestRequest">
              <p><strong>Hospital:</strong> {{ latestRequest.hospitalName || latestRequest.hospital_name }}</p>
              <p><strong>Units Required:</strong> {{ latestRequest.units || latestRequest.units_required }}</p>
              <p><strong>Date:</strong> {{ latestRequest.date || latestRequest.create_date }}</p>
              <div class="request-status">
                <i class="fa-solid fa-spinner fa-spin"></i> Status: {{ latestRequest.status }}
              </div>
            </div>
            <div v-else class="request-details">
              <p>No recent requests found.</p>
            </div>
          </div>

          <!-- Real-time Alerts Card -->
          <div class="card-box">
            <h2 class="card-title">
              <i class="fa-solid fa-bell"></i> Alerts
            </h2>
            <ul class="alerts-list" v-if="alerts.length > 0">
              <li v-for="(alert, index) in alerts" :key="index">
                <i class="fa-solid fa-triangle-exclamation alert-icon"></i> {{ alert.message || alert.name }}
              </li>
            </ul>
            <div v-else class="request-details">
              <p>No new alerts.</p>
            </div>
          </div>

        </div>

        <!-- Quick Actions Footer Block -->
        <div class="quick-actions-box">
          <div class="quick-actions-title">
            <i class="fa-solid fa-bolt"></i> Quick Actions
          </div>
          <div class="actions-buttons">
            <button class="action-btn" @click="navigateTo('/request-blood')">
              <i class="fa-solid fa-hand-holding-medical"></i> <span>Request Blood</span>
            </button>
            <button class="action-btn" @click="navigateTo('/donate-blood')">
              <i class="fa-solid fa-user-plus"></i> <span>Donate Blood</span>
            </button>
            <button class="action-btn" @click="navigateTo('/blood-management')">
              <i class="fa-solid fa-boxes-stacked"></i> <span>Blood Stock</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Right Sidebar: Blood Inventory Table -->
      <div class="sidebar-table-box">
        <table class="blood-table" v-if="bloodInventory.length > 0">
          <thead>
            <tr>
              <th>Status</th>
              <th>Quantity</th>
              <th>Blood Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in bloodInventory" :key="item.bloodType || item.blood_type">
              <td>
                <span :class="['status-badge', getStatusClass(item.status)]">
                  {{ item.status }}
                </span>
              </td>
              <td>{{ item.quantity }}</td>
              <td><strong>{{ item.bloodType || item.blood_type }}</strong></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="request-details">
          <p>No inventory data available.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { bloodRequestService } from '@/services/bloodRequestService.js'
import { inventoryService } from '@/services/inventoryService.js'
import { notificationService } from '@/services/notificationService.js'
import { donorService } from '@/services/donorService.js'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()

    const loading = ref(true)
    const errorMessage = ref(null)

    const totalStock = ref(0)
    const totalDonors = ref(0)
    const totalRequests = ref(0)

    const latestRequest = ref(null)
    const alerts = ref([])
    const bloodInventory = ref([])

    const formattedDonors = computed(() => totalDonors.value.toLocaleString())
    const formattedRequests = computed(() => totalRequests.value.toLocaleString())

    const navigateTo = (path) => {
      router.push(path)
    }

    const toggleSidebar = () => {
      console.log('Sidebar toggled')
    }

    const getStatusClass = (status) => {
      if (!status) return ''
      switch (status.toLowerCase()) {
        case 'available': return 'status-available'
        case 'low': return 'status-low'
        case 'critical': return 'status-critical'
        default: return ''
      }
    }

    const fetchDashboardData = async () => {
      loading.value = true
      errorMessage.value = null
      try {
        // جلب البيانات بشكل متزامن من خدمات Odoo التي تم إنشاؤها
        const [requestsRes, inventoryRes, alertsRes, donorsRes] = await Promise.all([
          bloodRequestService.getRequests().catch(() => ({ data: [] })),
          inventoryService.getInventory().catch(() => ({ data: [] })),
          notificationService.getNotifications().catch(() => ({ data: [] })),
          donorService.getDonors ? donorService.getDonors().catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
        ])

        // معالجة طلبات الدم وأحدث طلب
        const requestsData = requestsRes.data || requestsRes || []
        totalRequests.value = requestsData.length
        if (requestsData.length > 0) {
          // نفترض أن الطلبات مرتبة تنازلياً أو نأخذ الأخير
          latestRequest.value = requestsData[0]
        }

        // معالجة المخزون وإجمالي وحدات الدم
        const inventoryData = inventoryRes.data || inventoryRes || []
        bloodInventory.value = inventoryData
        totalStock.value = inventoryData.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

        // معالجة الإشعارات والتنبيهات
        alerts.value = alertsRes.data || alertsRes || []

        // معالجة إجمالي المتبرعين
        const donorsData = donorsRes.data || donorsRes || []
        totalDonors.value = donorsData.length > 0 ? donorsData.length : 0

      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error)
        errorMessage.value = 'Failed to load dashboard data from server. Please try again later.'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      loading,
      errorMessage,
      totalStock,
      totalDonors,
      totalRequests,
      latestRequest,
      alerts,
      bloodInventory,
      formattedDonors,
      formattedRequests,
      navigateTo,
      toggleSidebar,
      getStatusClass
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-container {
  background-color: #ffffff;
  color: #1a1a1a;
  padding: 20px 30px;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.page-title {
  color: #730B19;
  font-size: 36px;
  font-weight: bold;
}

.menu-icon {
  font-size: 28px;
  cursor: pointer;
  color: #333;
  transition: color 0.2s ease;
}

.menu-icon:hover {
  color: #730B19;
}

.feedback-message {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #730B19;
  padding: 40px;
}

.feedback-message.error {
  color: #9B1C1C;
}

/* Grid Architecture */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 25px;
  max-width: 1300px;
  margin: 0 auto;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0; 
}

/* 1. Statistical Counter Cards */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-card {
  border: 2px solid #730B19;
  border-radius: 12px;
  padding: 20px 10px;
  text-align: center;
  background-color: #fff;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.highlight {
  background-color: #730B19;
  color: #fff;
}

.stat-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #730B19;
}

.stat-card.highlight .stat-title {
  color: #fff;
}

.stat-value {
  font-size: 17px;
  font-weight: bold;
  color: #000;
}

.stat-card.highlight .stat-value {
  color: #fff;
}

/* 2. Middle Section */
.middle-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.card-box {
  border: 2px solid #730B19;
  border-radius: 18px;
  padding: 20px;
  background-color: #fff;
  min-height: 220px;
}

.card-title {
  color: #730B19;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}

.request-details {
  text-align: center;
  line-height: 1.8;
  font-size: 14px;
  font-weight: 600;
  word-break: break-word;
}

.request-status {
  margin-top: 12px;
  color: #730B19;
  font-weight: bold;
  font-size: 15px;
}

.alerts-list {
  list-style-type: none;
  padding: 0;
  font-size: 13px;
  line-height: 1.8;
  font-weight: 600;
}

.alerts-list li {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  text-align: left;
}

.alert-icon {
  color: #730B19;
  margin-top: 3px;
}

/* 3. Quick Actions Block */
.quick-actions-box {
  border: 2px solid #730B19;
  border-radius: 25px;
  padding: 15px 20px;
  text-align: center;
  background-color: #fff;
}

.quick-actions-title {
  color: #730B19;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

.actions-buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  background: none;
  border: none;
  color: #000;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  padding: 8px 12px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  color: #730B19;
  text-decoration: underline;
}

/* 4. Blood Inventory Sidebar Table */
.sidebar-table-box {
  border: 2px solid #730B19;
  border-radius: 18px;
  padding: 15px;
  background-color: #fff;
  height: fit-content;
}

.blood-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.blood-table th {
  color: #730B19;
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 10px;
  border-bottom: 2px solid #730B19;
}

.blood-table td {
  padding: 10px 5px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1.5px solid #730B19;
}

.blood-table tr:last-child td {
  border-bottom: none;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
}
.status-available { color: #03543F; background-color: #DEF7EC; }
.status-low { color: #9F580A; background-color: #FEF08A; }
.status-critical { color: #9B1C1C; background-color: #FDE8E8; }

/* ==========================================================================
   Responsive Design for All Screen Sizes
   ========================================================================== */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px 15px;
  }
  .stats-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .middle-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .actions-buttons {
    flex-direction: column;
    gap: 6px;
  }
  .page-title {
    font-size: 26px;
  }
  .card-box {
    min-height: auto;
  }
}
</style>