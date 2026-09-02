<script setup lang="ts">
/**
 * @file DonateBlood.vue
 * @description Donor registration component integrated with Odoo backend donor workflows.
 */

import { reactive, ref } from 'vue'
import { donorService } from '@/services/donorService'

/**
 * Strict TypeScript interface for donor registration payload.
 */
interface DonorForm {
  name: string
  email: string
  phone: string
  bloodType: string
  city: string
  lastDonationDate?: string
}

// Form reactive state with defensive default configurations
const form = reactive<DonorForm>({
  name: '',
  email: '',
  phone: '',
  bloodType: '',
  city: '',
  lastDonationDate: ''
})

// UI Interaction and API states
const isLoading = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Domain configuration constants
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

/**
 * Handles form validation and API submission to the Odoo backend platform 
 * using the centralized donorService.
 */
const handleDonorSubmit = async () => {
  isLoading.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    // Calling real Odoo API endpoint via donorService
    const response = await donorService.createDonor({
      name: form.name,
      email: form.email,
      phone: form.phone,
      blood_type: form.bloodType,
      city: form.city,
      last_donation_date: form.lastDonationDate || null
    })

    successMessage.value = response?.message || 'Donation registration completed successfully! Thank you for saving lives.'
    
    // Reset form fields safely
    form.name = ''
    form.email = ''
    form.phone = ''
    form.bloodType = ''
    form.city = ''
    form.lastDonationDate = ''
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'An error occurred during registration. Please check your connection and try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="donate-page" role="main">
    <div class="donate-container">
      
      <!-- Page Header Section -->
      <header class="donate-header">
        <h1 class="page-title">Donate Blood, Save Lives</h1>
        <p class="page-subtitle">
          Every drop counts. Register as a blood donor today and help bridge the gap for patients in critical need.
        </p>
      </header>

      <!-- Feedback Alerts -->
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-error" role="alert">
        {{ errorMessage }}
      </div>

      <div class="donate-grid">
        <!-- Registration Form -->
        <section class="form-card" aria-label="Donor Registration Form">
          <h2 class="section-title">Donor Information Form</h2>
          
          <form @submit.prevent="handleDonorSubmit" class="donor-form">
            <div class="form-group">
              <label for="fullName">Full Name <span class="required">*</span></label>
              <input 
                id="fullName"
                type="text" 
                v-model="form.name" 
                required 
                placeholder="Enter your full name"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Email Address <span class="required">*</span></label>
                <input 
                  id="email"
                  type="email" 
                  v-model="form.email" 
                  required 
                  placeholder="name@example.com"
                />
              </div>
              <div class="form-group">
                <label for="phone">Phone Number <span class="required">*</span></label>
                <input 
                  id="phone"
                  type="tel" 
                  v-model="form.phone" 
                  required 
                  placeholder="09xxxxxxxx"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="bloodType">Blood Type <span class="required">*</span></label>
                <select id="bloodType" v-model="form.bloodType" required>
                  <option disabled value="">Select Blood Type</option>
                  <option v-for="type in bloodTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="city">City / Branch <span class="required">*</span></label>
                <input 
                  id="city"
                  type="text" 
                  v-model="form.city" 
                  required 
                  placeholder="e.g., Khartoum"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="lastDonation">Last Donation Date (Optional)</label>
              <input 
                id="lastDonation"
                type="date" 
                v-model="form.lastDonationDate" 
              />
            </div>

            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
              <span v-else>Confirm Donation Registration</span>
            </button>
          </form>
        </section>

        <!-- Eligibility Criteria & Guidelines -->
        <aside class="guidelines-card" aria-label="Donation Guidelines">
          <h3 class="guideline-title">Donor Eligibility Criteria</h3>
          <ul class="guideline-list">
            <li>Age must be between 18 and 65 years old.</li>
            <li>Minimum weight requirement is 50 kg.</li>
            <li>Must be in good general health with no chronic infectious conditions.</li>
            <li>Adequate rest and hydration prior to donation are recommended.</li>
          </ul>

          <div class="support-box">
            <h4>Need Support?</h4>
            <p>Our medical coordinators are available to answer your eligibility questions.</p>
            <span class="support-hotline">📞 800-MADAD-HELP</span>
          </div>
        </aside>
      </div>

    </div>
  </main>
</template>

<style scoped>
.donate-page {
  width: 100%;
  min-height: 85vh;
  padding: 2.5rem 1rem;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
}

.donate-container {
  max-width: 1000px;
  width: 100%;
}

.donate-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-title {
  color: #730b19;
  font-size: 2.2rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #666;
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.donate-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .donate-grid {
    grid-template-columns: 1fr;
  }
}

.form-card, .guidelines-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 20px;
  border: 2px solid #730b19;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}

.section-title {
  color: #111;
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.donor-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 576px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-weight: 700;
  color: #333;
  font-size: 0.9rem;
}

.required {
  color: #9b0103;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #730b19;
}

.btn-submit {
  background-color: #730b19;
  color: #ffffff;
  padding: 0.9rem;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  background-color: #ccc;
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
  color: #730b19;
  border: 1px solid #f5c6cb;
}

.guideline-title {
  color: #730b19;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.guideline-list {
  list-style-type: disc;
  padding-left: 1.2rem;
  color: #555;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

.support-box {
  background: linear-gradient(135deg, #730b19, #a11b2d);
  color: #ffffff;
  padding: 1.5rem;
  border-radius: 14px;
}

.support-box h4 {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.support-box p {
  font-size: 0.85rem;
  color: #e0e0e0;
  margin-bottom: 1rem;
}

.support-hotline {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>