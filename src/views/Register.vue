<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 1. Reactive Form State
const registerData = reactive({
  accountType: 'donor',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// State Management
const errorMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// Account Types Constant
const accountTypes = [
  { id: 'donor', label: 'Donor' },
  { id: 'hospital', label: 'Hospital' },
  { id: 'blood_bank', label: 'Blood Bank' }
]

// 2. Form & Validation Logic (Email, Phone, Passwords)
const validateForm = (): boolean => {
  // التحقق من مطابقة كلمات المرور
  if (registerData.password !== registerData.confirmPassword) {
    errorMessage.value = 'Passwords do not match!'
    return false
  }
  if (registerData.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long.'
    return false
  }

  // التحقق من صحة البريد الإلكتروني عبر Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerData.email)) {
    errorMessage.value = 'Please enter a valid email address.'
    return false
  }

  // التحقق من صحة رقم الهاتف (يقبل الأرقام الدولية والمحلية)
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
  if (!phoneRegex.test(registerData.phone)) {
    errorMessage.value = 'Please enter a valid phone number.'
    return false
  }

  return true
}

// 3. Handle Real Backend Registration & Dynamic Routing
const handleRegister = async () => {
  errorMessage.value = ''

  if (!validateForm()) return

  try {
    isLoading.value = true

    // إرسال البيانات للـ Backend الحقيقي
    const response = await axios.post(`${API_BASE_URL}/register`, {
      name: registerData.fullName,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
      role: registerData.accountType
    })

    console.log('Registration successful:', response.data)

    // حفظ بيانات المستخدم والتوكن في التخزين المحلي
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    localStorage.setItem('user', JSON.stringify(response.data.user || registerData))
    localStorage.setItem('userRole', registerData.accountType)

    // 4. التوجيه لصفحات مختلفة بناءً على نوع الحساب
    switch (registerData.accountType) {
      case 'donor':
        router.push('/donor-dashboard')
        break
      case 'hospital':
        router.push('/hospital-dashboard')
        break
      case 'blood_bank':
        router.push('/bloodbank-dashboard')
        break
      default:
        router.push('/profile')
        break
    }

  } catch (error: unknown) {
    console.error('Registration error:', error)
    if (axios.isAxiosError(error)) {
      errorMessage.value =
        error.response?.data?.message || 'Registration failed. Please check your inputs.'
    } else {
      errorMessage.value = 'An unexpected error occurred.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-container animate-fade-in">
      
      <!-- Brand Sidebar -->
      <div class="brand-section">
        <div class="brand-header">
          <h2>Create New Account</h2>
          <p>Join MADAD platform and help connect blood donors, blood banks, and hospitals.</p>
        </div>
        
        <img 
          src="/src/assets/regsterImage.png" 
          alt="MADAD Illustration" 
          class="illustration floating-animation"
        />
        
        <div class="brand-slogan">MADAD Connects... Life Continues</div>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <div class="form-card">
          <h2 class="form-title">Register</h2>
          
          <form @submit.prevent="handleRegister">
            
            <!-- Account Type Selector -->
            <div class="role-selector">
              <label class="title">Account Type :</label>
              <div class="radio-group">
                <label 
                  v-for="type in accountTypes" 
                  :key="type.id" 
                  class="radio-label"
                >
                  <input 
                    type="radio" 
                    v-model="registerData.accountType" 
                    :value="type.id" 
                  /> 
                  {{ type.label }}
                </label>
              </div>
            </div>

            <!-- Input Fields -->
            <div class="input-group">
              <label for="fullName">Full Name</label>
              <input id="fullName" v-model.trim="registerData.fullName" type="text" required placeholder="Your Name" />
            </div>

            <div class="input-group">
              <label for="email">Email</label>
              <input id="email" v-model.trim="registerData.email" type="email" required placeholder="example@mail.com" />
            </div>

            <div class="input-group">
              <label for="phone">Phone Number</label>
              <input id="phone" v-model.trim="registerData.phone" type="tel" required placeholder="+249 5X XXX XXXX" />
            </div>

            <div class="input-group">
              <label for="password">Password</label>
              <div class="password-wrapper">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="registerData.password" 
                  required 
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="input-group">
              <label for="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" v-model="registerData.confirmPassword" type="password" required />
            </div>

            <!-- Error Message Transition -->
            <Transition name="slide-fade">
              <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
            </Transition>

            <!-- Submit Button -->
            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="!isLoading">Create Account</span>
              <span v-else class="spinner"></span>
            </button>
          </form>

          <div class="switch-mode">
            Already have an account? 
            <router-link to="/login">LOGIN</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f4;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  direction: ltr;
  padding: 20px;
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 520px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.brand-section {
  flex: 1;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  text-align: center;
}

.brand-header h2 {
  color: #700010;
  font-size: 26px;
  margin-bottom: 8px;
}

.brand-header p {
  color: #444;
  font-size: 15px;
  line-height: 1.5;
  max-width: 280px;
}

.illustration {
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  margin: 15px 0;
}

.brand-slogan {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.form-section {
  flex: 1.1;
  background-color: #fff;
  padding: 35px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-card {
  border: 2px solid #700010;
  border-radius: 16px;
  padding: 25px 20px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(112, 0, 16, 0.05);
}

.form-title {
  color: #700010;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.input-group input {
  width: 100%;
  border: none;
  border-bottom: 2px solid #d1d1d1;
  background: transparent;
  padding: 8px 0;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s ease, transform 0.2s ease;
}

.input-group input:focus {
  border-bottom-color: #700010;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 5px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.role-selector {
  margin-bottom: 18px;
  text-align: left;
}

.role-selector label.title {
  display: block;
  font-size: 13px;
  font-weight: bold;
  color: #222;
  margin-bottom: 8px;
}

.radio-group {
  display: flex;
  gap: 15px;
  font-size: 13px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.radio-label:hover {
  transform: translateY(-1px);
}

.radio-group input[type="radio"] {
  accent-color: #700010;
}

.btn-submit {
  background-color: #700010;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  padding: 12px 25px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  width: 70%;
  margin: 15px auto 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(112, 0, 16, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background-color: #52000c;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(112, 0, 16, 0.3);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-msg {
  color: #d9534f;
  font-size: 13px;
  text-align: center;
  margin-top: 10px;
  font-weight: 600;
}

.switch-mode {
  text-align: center;
  margin-top: 15px;
  font-size: 13px;
  color: #555;
}

.switch-mode a {
  color: #700010;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.2s;
}

.switch-mode a:hover {
  text-decoration: underline;
  color: #52000c;
}

.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.floating-animation {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 850px) {
  .auth-container {
    flex-direction: column-reverse;
  }
  
  .brand-section {
    padding: 25px;
  }

  .btn-submit {
    width: 100%;
  }
}
</style>