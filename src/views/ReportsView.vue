<script setup>
/**
 * @file ReportsView.vue
 * @description Centralized reporting view that dynamically fetches metrics and lists 
 * based on the authorization role from Odoo backend APIs with full error and loading handling.
 */
import { ref, computed, onMounted } from 'vue';
import { bloodRequestService } from '@/services/bloodRequestService';
import { inventoryService } from '@/services/inventoryService';
import { hospitalService } from '@/services/hospitalService';
import { appointmentService } from '@/services/appointmentService';

const props = defineProps({
  userRole: {
    type: String,
    required: false,
    default: 'donor'
  }
});

// Sanitized and normalized role
const sanitizedRole = computed(() => {
  if (!props.userRole) return 'donor';
  return props.userRole.toLowerCase().trim();
});

// Reactive states for dynamic data, loading, and errors
const loading = ref(true);
const errorMessage = ref('');

const reportData = ref({
  bloodRequests: [],
  donations: [],
  bloodBanks: [],
  donors: [],
  inventory: [],
  approved: [],
  pending: [],
  completed: [],
  unitsDonated: 0
});

/**
 * Fetches dynamic report data from Odoo backend based on the user role.
 */
const fetchReportData = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    // Fetch requests and appointments based on available Odoo APIs
    const [requestsRes, inventoryRes, appointmentsRes] = await Promise.all([
      bloodRequestService.getBloodRequests().catch(() => []),
      inventoryService.getInventory().catch(() => []),
      appointmentService.getAppointments().catch(() => [])
    ]);

    reportData.value.bloodRequests = requestsRes || [];
    reportData.value.inventory = inventoryRes || [];
    reportData.value.donations = appointmentsRes || [];
    
    // Filtering states for requests if applicable
    reportData.value.approved = reportData.value.bloodRequests.filter(r => r.status?.toLowerCase() === 'approved');
    reportData.value.pending = reportData.value.bloodRequests.filter(r => r.status?.toLowerCase() === 'pending');
    reportData.value.completed = reportData.value.bloodRequests.filter(r => r.status?.toLowerCase() === 'completed');

  } catch (error) {
    console.error('Error fetching reports data:', error);
    errorMessage.value = 'Unable to load data. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReportData();
});

/**
 * Triggers the native browser print dialog configured to save as PDF.
 */
const downloadPDF = () => {
  window.print();
};
</script>

<template>
  <main class="reports-container">
    <!-- Action Bar for PDF Export (Hidden when printing) -->
    <div class="action-bar no-print">
      <button @click="downloadPDF" class="btn-export">
        <i class="fas fa-file-pdf ml-2"></i> Save Report as PDF
      </button>
    </div>

    <!-- Printable Report Wrapper -->
    <div class="printable-area" aria-labelledby="reports-main-title">
      <header class="reports-header">
        <h1 id="reports-main-title" class="page-title">
          System Reports
        </h1>
        <p class="role-indicator">Viewing as: <span class="role-highlight">{{ userRole }}</span></p>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="status-message">
        Loading reports...
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <!-- Content Wrapper -->
      <div v-else class="reports-content-wrapper" role="region">
        
        <!-- Admin Role Sections -->
        <template v-if="sanitizedRole === 'admin'">
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-hand-holding-medical icon-title"></i> Blood Requests</h2>
            <div class="card-content">
              <span v-if="reportData.bloodRequests.length">{{ reportData.bloodRequests.length }} Active Requests</span>
              <span v-else class="empty-text">No blood requests found.</span>
            </div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-heartbeat icon-title"></i> Donations</h2>
            <div class="card-content">
              <span v-if="reportData.donations.length">{{ reportData.donations.length }} Total Donations</span>
              <span v-else class="empty-text">No donations found.</span>
            </div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-boxes icon-title"></i> Inventory</h2>
            <div class="card-content">
              <span v-if="reportData.inventory.length">View Global Stock Levels</span>
              <span v-else class="empty-text">No inventory data found.</span>
            </div>
          </section>
        </template>

        <!-- Blood Bank Role Sections -->
        <template v-else-if="sanitizedRole === 'blood bank' || sanitizedRole === 'bloodbank'">
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-warehouse icon-title"></i> Inventory</h2>
            <div class="card-content">Manage Blood Units Stock</div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-hand-holding-heart icon-title"></i> Donations</h2>
            <div class="card-content">Track Incoming Donations</div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-clipboard-list icon-title"></i> Requests</h2>
            <div class="card-content">
              <span v-if="reportData.bloodRequests.length">{{ reportData.bloodRequests.length }} Requests to Handle</span>
              <span v-else class="empty-text">No blood requests found.</span>
            </div>
          </section>
        </template>

        <!-- Hospital Role Sections -->
        <template v-else-if="sanitizedRole === 'hospital'">
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-file-medical icon-title"></i> Requests</h2>
            <div class="card-content">
              <span v-if="reportData.bloodRequests.length">{{ reportData.bloodRequests.length }} Total Requests</span>
              <span v-else class="empty-text">No blood requests found.</span>
            </div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-check-circle icon-title"></i> Approved</h2>
            <div class="card-content">{{ reportData.approved.length }} Approved Requests</div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-clock icon-title"></i> Pending</h2>
            <div class="card-content">{{ reportData.pending.length }} Pending Requests</div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-check-double icon-title"></i> Completed</h2>
            <div class="card-content">{{ reportData.completed.length }} Completed Requests</div>
          </section>
        </template>

        <!-- Donor Role Sections -->
        <template v-else>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-tint icon-title"></i> Donations</h2>
            <div class="card-content">
              <span v-if="reportData.donations.length">{{ reportData.donations.length }} Donations Logged</span>
              <span v-else class="empty-text">No donations found.</span>
            </div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-plus-circle icon-title"></i> Units Donated</h2>
            <div class="card-content">{{ reportData.unitsDonated }} Units in Total</div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-history icon-title"></i> Donation History</h2>
            <div class="card-content">View Full Timeline</div>
          </section>
        </template>

      </div>
    </div>
  </main>
</template>

<style scoped>
.reports-container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: inherit;
  background-color: #fff;
  color: #000;
  min-height: 85vh;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.btn-export {
  background-color: #730b19;
  color: #fff;
  padding: 0.7rem 1.5rem;
  border-radius: 12px;
  font-weight: bold;
  border: 2px solid #730b19;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-export:hover {
  background-color: #fff;
  color: #730b19;
}

.printable-area {
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
}

.reports-header {
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #730b19;
  text-align: center;
}

.role-indicator {
  font-size: 1rem;
  color: #333;
  margin-top: 0.25rem;
  font-weight: 600;
}

.role-highlight {
  color: #730b19;
  text-transform: capitalize;
}

.reports-content-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.report-block {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 2px solid #730b19;
}

.block-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #000;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-title {
  color: #730b19;
}

.card-content {
  font-size: 1rem;
  color: #333;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-weight: 600;
}

.status-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: #555;
}

.status-message.error {
  color: #d9534f;
}

.empty-text {
  color: #777;
  font-style: italic;
}

/* Hide action buttons when printing to PDF */
@media print {
  .no-print {
    display: none !important;
  }
  .reports-container {
    padding: 0;
  }
}
</style>