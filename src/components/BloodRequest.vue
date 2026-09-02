<script setup lang="ts">
/**
 * @file BloodRequest.vue
 * @description Blood Request form component allowing hospitals to submit blood unit requests 
 * integrated with structured bloodRequestService APIs. Implements form validation, loading states, 
 * error handling, and success feedback.
 */

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { bloodRequestService } from '@/services/bloodRequestService'

const router = useRouter()

// Form reactive data model matching Odoo API requirements
const form = reactive({
  hospital_id: '',
  blood_type: '',
  quantity: 1,
  blood_bank: '',
  priority: 'Normal',
  notes: ''
})

// UI & API States
const isLoading = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Dropdown options constants
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const priorities = ['Normal', 'High', 'Emergency']
const bloodBanks = [
  { id: 'bank_1', name: 'Khartoum Central Blood Bank' },
  { id: 'bank_2', name: 'Port Sudan Blood Bank' }
]

/**
 * Handles form submission, triggers Odoo API integration via bloodRequestService,
 * and manages asynchronous loading and error feedback states.
 */
const submitBloodRequest = async () => {
  isLoading.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    // Calling structured bloodRequestService API endpoint for creating a blood request
    const response = await bloodRequestService.createRequest({
      hospital_id: form.hospital_id,
      blood_type: form.blood_type,
      quantity: Number(form.quantity),
      blood_bank: form.blood_bank,
      priority: form.priority,
      notes: form.notes
    })

    if (response) {
      successMessage.value = `Blood request successfully created! Request ID: ${response.request_id || 'N/A'} (Status: ${response.status || 'Pending'})`
      
      // Reset form fields after successful submission
      form.hospital_id = ''
      form.blood_type = ''
      form.quantity = 1
      form.blood_bank = ''
      form.priority = 'Normal'
      form.notes = ''
    }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to submit blood request. Please check your connection and try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="blood-request-page">
    <div class="request-container">
      <h1 class="page-title">Request Blood</h1>
      <p class="page-subtitle">Submit a formal blood request to available blood banks.</p>

      <!-- Success Notification Alert -->
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <!-- Error Notification Alert -->
      <div v-if="errorMessage" class="alert alert-error" role="alert">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="submitBloodRequest" class="request-form">
        <!-- Hospital ID / Name -->
        <div class="form-group">
          <label for="hospital_id">Hospital Name / ID <span class="required">*</span></label>
          <input 
            id="hospital_id" 
            type="text" 
            v-model="form.hospital_id" 
            required 
            placeholder="Enter hospital identifier or name"
          />
        </div>

        <!-- Blood Type Selection -->
        <div class="form-group">
          <label for="blood_type">Blood Type <span class="required">*</span></label>
          <select id="blood_type" v-model="form.blood_type" required>
            <option disabled value="">Select Blood Type</option>
            <option v-for="type in bloodTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label for="quantity">Quantity (Units) <span class="required">*</span></label>
          <input 
            id="quantity" 
            type="number" 
            min="1" 
            max="100" 
            v-model="form.quantity" 
            required 
          />
        </div>

        <!-- Blood Bank Selection -->
        <div class="form-group">
          <label for="blood_bank">Target Blood Bank</label>
          <select id="blood_bank" v-model="form.blood_bank">
            <option disabled value="">Select Blood Bank (Optional)</option>
            <option v-for="bank in bloodBanks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
          </select>
        </div>

        <!-- Priority (UI enhancement) -->
        <div class="form-group">
          <label for="priority">Priority Level</label>
          <select id="priority" v-model="form.priority">
            <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>

        <!-- Notes (UI enhancement) -->
        <div class="form-group">
          <label for="notes">Additional Notes</label>
          <textarea id="notes" v-model="form.notes" rows="3" placeholder="Enter any specific requirements or patient condition notes"></textarea>
        </div>

        <!-- Form Submit Button with Loading State -->
        <button type="submit" class="btn-submit" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Submit Request</span>
        </button>
      </form>
    </div>
  </main>
</template>

<style>
body {
  direction: ltr;
}
</style>

<style scoped>
.blood-request-page {
  width: 100%;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  background-color: #f8f9fa;
  min-height: 85vh;
}

.request-container {
  max-width: 650px;
  width: 100%;
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 20px;
  border: 2px solid #730b19;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.page-title {
  color: #730b19;
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  text-align: center;
}

.page-subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
  direction: ltr;
}

.request-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-weight: 700;
  color: #333;
  font-size: 0.95rem;
  direction: ltr;
}

.required {
  color: #730b19;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
  direction: ltr;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #730b19;
}

.btn-submit {
  background-color: #730b19;
  color: #ffffff;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>