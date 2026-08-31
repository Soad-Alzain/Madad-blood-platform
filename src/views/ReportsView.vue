<script setup>
/**
 * @file ReportsView.vue
 * @description Centralized reporting view that dynamically renders metrics and lists 
 * based on the authorization role with Font Awesome icons and PDF export.
 */
import { ref, computed } from 'vue';

const props = defineProps({
  userRole: {
    type: String,
    required: false,
    default: 'Donor'
  }
});

// Sanitized and normalized role
const sanitizedRole = computed(() => {
  if (!props.userRole) return 'donor';
  return props.userRole.toLowerCase().trim();
});

// Mock Data for different roles matching Odoo specifications
const reportData = ref({
  bloodRequests: [
    { request_id: "REQ-01", hospital: "Al-Amal Hospital", blood_type: "O+", quantity: 3, status: "Pending" }
  ],
  donations: [
    { id: 1, date: "2026-08-15", bloodType: "O+", bloodBank: "Central Bank", quantity: 1, status: "Completed" }
  ],
  bloodBanks: [
    { id: 1, name: "Central Blood Bank", location: "Khartoum", stockLevel: "High" }
  ],
  donors: [
    { id: 1, name: "Soad Hamdan", bloodType: "O+", phone: "0912345678" }
  ],
  inventory: [
    { bloodType: "O+", units: 45 },
    { bloodType: "A+", units: 30 },
    { bloodType: "B+", units: 15 }
  ],
  approved: [
    { request_id: "REQ-02", hospital: "City Hospital", blood_type: "A+", quantity: 2, status: "Approved" }
  ],
  pending: [
    { request_id: "REQ-03", hospital: "Teaching Hospital", blood_type: "B-", quantity: 1, status: "Pending" }
  ],
  completed: [
    { request_id: "REQ-04", hospital: "Children Hospital", blood_type: "O-", quantity: 4, status: "Completed" }
  ],
  unitsDonated: 4
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

      <div class="reports-content-wrapper" role="region">
        
        <!-- Admin Role Sections -->
        <template v-if="sanitizedRole === 'admin'">
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-hand-holding-medical icon-title"></i> Blood Requests</h2>
            <div class="card-content">{{ reportData.bloodRequests.length }} Active Requests</div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-heartbeat icon-title"></i> Donations</h2>
            <div class="card-content">{{ reportData.donations.length }} Total Donations</div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-hospital icon-title"></i> Blood Banks</h2>
            <div class="card-content">{{ reportData.bloodBanks.length }} Registered Banks</div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-users icon-title"></i> Donors</h2>
            <div class="card-content">{{ reportData.donors.length }} Active Donors</div>
          </section>
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-boxes icon-title"></i> Inventory</h2>
            <div class="card-content">View Global Stock Levels</div>
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
            <div class="card-content">Handle Hospital Requests</div>
          </section>
        </template>

        <!-- Hospital Role Sections -->
        <template v-else-if="sanitizedRole === 'hospital'">
          <section class="report-block">
            <h2 class="block-title"><i class="fas fa-file-medical icon-title"></i> Requests</h2>
            <div class="card-content">All Hospital Requests</div>
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
            <div class="card-content">{{ reportData.donations.length }} Donations Logged</div>
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