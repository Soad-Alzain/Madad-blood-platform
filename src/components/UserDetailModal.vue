<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <h3>{{ type === 'hospital' ? 'Hospital Details' : 'Donor Details' }}</h3>
        <button class="close-icon-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body" v-if="userData">
        <template v-if="type === 'hospital'">
          <div class="detail-row"><strong>Hospital Name:</strong> <span>{{ userData.name }}</span></div>
          <div class="detail-row"><strong>Email:</strong> <span>{{ userData.email }}</span></div>
          <div class="detail-row"><strong>Phone:</strong> <span>{{ userData.phone }}</span></div>
          <div class="detail-row"><strong>Location:</strong> <span>{{ userData.location }}</span></div>
          <div class="detail-row">
            <strong>Status:</strong> 
            <span :class="['status-badge', userData.status.toLowerCase()]">{{ userData.status }}</span>
          </div>
          <div class="detail-row"><strong>Total Blood Requests:</strong> <span>{{ userData.totalBloodRequests }}</span></div>
        </template>

        <template v-else>
          <div class="detail-row"><strong>Donor Name:</strong> <span>{{ userData.name }}</span></div>
          <div class="detail-row"><strong>Blood Type:</strong> <span class="blood-badge">{{ userData.bloodType }}</span></div>
          <div class="detail-row"><strong>Email:</strong> <span>{{ userData.email }}</span></div>
          <div class="detail-row"><strong>Phone:</strong> <span>{{ userData.phone }}</span></div>
          <div class="detail-row"><strong>Location:</strong> <span>{{ userData.location }}</span></div>
          <div class="detail-row"><strong>Last Donation:</strong> <span>{{ userData.lastDonation }}</span></div>
          <div class="detail-row">
            <strong>Donation Status:</strong> 
            <span :class="['status-badge', userData.status === 'Eligible' ? 'eligible' : 'not-eligible']">{{ userData.status }}</span>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <button class="btn-close-modal" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @file UserDetailModal.vue
 * @description Dynamic modal component for viewing detailed hospital or donor records.
 */
export default {
  name: 'UserDetailModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    type: {
      type: String, // 'hospital' or 'donor'
      required: true
    },
    userData: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('close')
    }

    return {
      closeModal
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: #FFFFFF;
  width: 90%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: modalFadeIn 0.25s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  background-color: #730B19;
  color: #FFFFFF;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.close-icon-btn {
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  color: #333333;
  padding-bottom: 8px;
  border-bottom: 1px solid #F3F4F6;
}

.detail-row strong {
  color: #4B5563;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active, .status-badge.eligible {
  background-color: #DEF7EC;
  color: #03543F;
}

.status-badge.inactive, .status-badge.not-eligible {
  background-color: #FDE8E8;
  color: #9B1C1C;
}

.blood-badge {
  background-color: #FEE2E2;
  color: #730B19;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: bold;
}

.modal-footer {
  padding: 12px 20px;
  background-color: #F9FAFB;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #E5E7EB;
}

.btn-close-modal {
  background-color: #730B19;
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-close-modal:hover {
  background-color: #5a0813;
}
</style>