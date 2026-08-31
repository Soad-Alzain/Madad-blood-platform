<template>
  <section class="donor-donations-container" aria-labelledby="donations-heading">
    <header class="dashboard-header">
      <h1 id="donations-heading" class="page-title">My Donations</h1>
      <p class="page-subtitle">Track your blood donation history and impact.</p>
    </header>

    <!-- Summary Metrics Cards -->
    <div class="metrics-grid" role="region" aria-label="Donation Summary Statistics">
      <article class="metric-card">
        <span class="metric-label">Total Donations</span>
        <strong class="metric-value" aria-live="polite">{{ safeTotalDonations }}</strong>
      </article>
      <article class="metric-card">
        <span class="metric-label">Total Units</span>
        <strong class="metric-value" aria-live="polite">{{ safeTotalUnits }}</strong>
      </article>
      <article class="metric-card">
        <span class="metric-label">Last Donation</span>
        <strong class="metric-value">{{ safeLastDonationDate }}</strong>
      </article>
    </div>

    <!-- Donation History Section -->
    <div class="history-section">
      <h2 class="section-title">Donation History</h2>
      
      <!-- Fallback for empty state -->
      <div v-if="!donations || donations.length === 0" class="empty-state" role="status">
        <p>No donation records found.</p>
      </div>

      <!-- Responsive Table Container -->
      <div v-else class="table-responsive-wrapper">
        <table class="donations-table" aria-describedby="donations-heading">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Blood Type</th>
              <th scope="col">Blood Bank</th>
              <th scope="col">Quantity</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(donation, index) in donations" :key="donation.id || index">
              <td>{{ donation.date || 'N/A' }}</td>
              <td><span class="badge-blood">{{ donation.bloodType || 'N/A' }}</span></td>
              <td>{{ donation.bloodBank || 'N/A' }}</td>
              <td>{{ donation.quantity || 0 }} Units</td>
              <td>
                <span :class="['status-badge', getStatusClass(donation.status)]">
                  {{ donation.status || 'Unknown' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script>
/**
 * @file MyDonationsView.vue
 * @description Renders the donor's personal donation metrics and history log.
 * Implements defensive programming principles to handle missing datasets gracefully.
 */
export default {
  name: 'MyDonationsView',
  props: {
    donations: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    safeTotalDonations() {
      return this.donations ? this.donations.length : 0;
    },
    safeTotalUnits() {
      if (!this.donations || this.donations.length === 0) return 0;
      return this.donations.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
    },
    safeLastDonationDate() {
      if (!this.donations || this.donations.length === 0) return 'None';
      return this.donations[0].date || 'N/A';
    }
  },
  methods: {
    /**
     * Determines the appropriate CSS status class based on donation status string.
     * @param {String} status - The current status of the donation.
     * @returns {String} The CSS modifier class name.
     */
    getStatusClass(status) {
      if (!status) return 'status-default';
      const normalized = status.toLowerCase();
      if (normalized.includes('complet') || normalized.includes('approv')) return 'status-success';
      if (normalized.includes('pend')) return 'status-pending';
      if (normalized.includes('reject')) return 'status-danger';
      return 'status-default';
    }
  }
};
</script>

<style scoped>
/* Component-specific Styles with Modern CSS and Mobile-First Approach */
.donor-donations-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: inherit;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #530653;
}

.page-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.metric-card {
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(55, 11, 25, 0.05);
  border-left: 4px solid #9b0103;
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #370b19;
}

.history-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(55, 11, 25, 0.05);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #370b19;
  margin-bottom: 1rem;
}

.table-responsive-wrapper {
  overflow-x: auto;
}

.donations-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.95rem;
}

.donations-table th,
.donations-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.donations-table th {
  background-color: #f9fafb;
  color: #370b19;
  font-weight: 600;
}

.badge-blood {
  background-color: #f3f4f6;
  color: #9b0103;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-success { background-color: #d1fae5; color: #065f46; }
.status-pending { background-color: #fef3c7; color: #92400e; }
.status-danger { background-color: #fee2e2; color: #991b1b; }
.status-default { background-color: #f3f4f6; color: #374151; }

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}
</style>