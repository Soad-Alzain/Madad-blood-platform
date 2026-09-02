<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import loginImage from '@/assets/login-image.png'
import registerImage from '@/assets/regsterImage.png'

const router = useRouter()

// Toggle between 'login' and 'register' modes
const authMode = ref<'login' | 'register'>('login')

// Form States
const loginData = reactive({
  email: '',
  password: ''
})

const registerData = reactive({
  accountType: 'donor',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// Shared State Management
const errorMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

// Account Types Constant
const accountTypes = [
  { id: 'donor', label: 'Donor' },
  { id: 'hospital', label: 'Hospital' },
  { id: 'blood_bank', label: 'Blood Bank' }
]

// Dynamic Branding Text / Image based on Mode
const currentImage = computed(() => (authMode.value === 'login' ? loginImage : registerImage))
const brandTitle = computed(() => (authMode.value === 'login' ? 'MADAD Reaches… Life Continues' : 'MADAD Connects... Life Continues'))

// Switch Mode Function and Clear Errors
const switchMode = (mode: 'login' | 'register') => {
  authMode.value = mode
  errorMessage.value = ''
  showPassword.value = false
}

// Validation Logic for Registration
const validateRegisterForm = (): boolean => {
  if (registerData.password !== registerData.confirmPassword) {
    errorMessage.value = 'Passwords do not match!'
    return false
  }
  if (registerData.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long.'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerData.email)) {
    errorMessage.value = 'Please enter a valid email address.'
    return false
  }

  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
  if (!phoneRegex.test(registerData.phone)) {
    errorMessage.value = 'Please enter a valid phone number.'
    return false
  }

  return true
}

// Handle Login Action
const handleLogin = async () => {
  if (!loginData.email.trim() || !loginData.password) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    const response = await axios.post(`${API_BASE_URL}/web/session/authenticate`, {
      jsonrpc: '2.0',
      params: {
        db: 'blood_bank_db',
        login: loginData.email.trim(),
        password: loginData.password,
      },
    }, {
      withCredentials: true
    })

    if (response.data.error) {
      throw new Error(response.data.error.data?.message || 'Authentication failed.')
    }

    const result = response.data.result
    if (result) {
      localStorage.setItem('session_id', result.session_id || '')
      localStorage.setItem('user', JSON.stringify(result))
      
      // إذا كان الخادم يعيد نوع المستخدم أو دوره، يمكنك حفظه (مثال افتراضي بناءً على الاستجابة أو بيانات الخادم)
      // const userRole = result.role || 'donor' 
      // localStorage.setItem('userRole', userRole)
    }

    // التوجيه الذكي للـ Dashboard بناءً على الدور المخزن أو نوع الحساب
    const userRole = localStorage.getItem('userRole') || 'donor'
    
    switch (userRole) {
      case 'admin':
        router.push('/dashboard') // أو لوحة تحكم الأدمن الخاصة بك
        break
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
        router.push('/dashboard')
        break
    }
  } catch (error: unknown) {
    console.error('Login error:', error)
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else if (axios.isAxiosError(error)) {
      const data = error.response?.data as { error?: { data?: { message?: string } }; message?: string }
      errorMessage.value = data?.error?.data?.message || data?.message || 'Login failed. Please check your credentials.'
    } else {
      errorMessage.value = 'An unexpected error occurred.'
    }
  } finally {
    isLoading.value = false
  }
}

// Handle Register Action
const handleRegister = async () => {
  errorMessage.value = ''
  if (!validateRegisterForm()) return

  try {
    isLoading.value = true

    const response = await axios.post(`${API_BASE_URL}/web/session/authenticate`, {
      jsonrpc: '2.0',
      params: {
        db: 'blood_bank_db',
        login: registerData.email.trim(),
        password: registerData.password
      }
    }, {
      withCredentials: true
    })

    if (response.data.error) {
      throw new Error(response.data.error.data?.message || 'Authentication failed.')
    }

    const result = response.data.result
    if (result) {
      localStorage.setItem('session_id', result.session_id || '')
      localStorage.setItem('user', JSON.stringify(result))
      localStorage.setItem('userRole', registerData.accountType)
    }

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
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else if (axios.isAxiosError(error)) {
      const data = error.response?.data as { error?: { data?: { message?: string } }; message?: string }
      errorMessage.value = data?.error?.data?.message || data?.message || 'Registration failed. Please check your inputs.'
    } else {
      errorMessage.value = 'An unexpected error occurred.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="auth-section">
    <div class="signup-container animate-fade-in">
      
      <!-- Brand Sidebar / Image Section -->
      <div class="brand-section">
        <div class="brand-header" v-if="authMode === 'register'">
          <h2>Create New Account</h2>
          <p>Join MADAD platform and help connect blood donors, blood banks, and hospitals.</p>
        </div>
        
        <div class="img-wrapper">
          <img :src="currentImage" alt="MADAD Illustration" class="login-image floating-animation" />
        </div>
        
        <div class="brand-slogan">{{ brandTitle }}</div>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <div class="form-card">
          
          <!-- LOGIN FORM -->
          <form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="register">
            <h1 class="title">LOGIN</h1>

            <div class="input-group">
              <label for="login-email">Email</label>
              <input
                id="login-email"
                v-model="loginData.email"
                type="email"
                placeholder="Enter your email"
                aria-label="Email Address"
                autocomplete="email"
                required
              />
            </div>

            <div class="input-group">
              <label for="login-password">Password</label>
              <div class="password-wrapper">
                <input
                  id="login-password"
                  v-model="loginData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  aria-label="Password"
                  autocomplete="current-password"
                  required
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <Transition name="slide-fade">
              <p v-if="errorMessage" class="error-msg" role="alert">{{ errorMessage }}</p>
            </Transition>

            <button type="submit" :disabled="isLoading" class="btn-submit">
              <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
              <span>{{ isLoading ? 'Loading...' : 'Log In' }}</span>
            </button>

            <div class="switch-mode">
              You don't have an account? 
              <a href="#" @click.prevent="switchMode('register')">Register</a>
            </div>
          </form>

          <!-- REGISTER FORM -->
          <form v-else @submit.prevent="handleRegister">
            <h2 class="title">Register</h2>
            
            <div class="role-selector">
              <label class="title-label">Account Type :</label>
              <div class="radio-group">
                <label v-for="type in accountTypes" :key="type.id" class="radio-label">
                  <input type="radio" v-model="registerData.accountType" :value="type.id" /> 
                  {{ type.label }}
                </label>
              </div>
            </div>

            <div class="input-group">
              <label for="fullName">Full Name</label>
              <input id="fullName" v-model.trim="registerData.fullName" type="text" required placeholder="Your Name" />
            </div>

            <div class="input-group">
              <label for="register-email">Email</label>
              <input id="register-email" v-model.trim="registerData.email" type="email" required placeholder="example@mail.com" />
            </div>

            <div class="input-group">
              <label for="phone">Phone Number</label>
              <input id="phone" v-model.trim="registerData.phone" type="tel" required placeholder="+249 5X XXX XXXX" />
            </div>

            <div class="input-group">
              <label for="register-password">Password</label>
              <div class="password-wrapper">
                <input 
                  id="register-password"
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="registerData.password" 
                  required 
                  placeholder="At least 6 characters"
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="input-group">
              <label for="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" v-model="registerData.confirmPassword" type="password" required placeholder="Re-enter password" />
            </div>

            <Transition name="slide-fade">
              <p v-if="errorMessage" class="error-msg" role="alert">{{ errorMessage }}</p>
            </Transition>

            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="!isLoading">Create Account</span>
              <span v-else class="spinner"></span>
            </button>

            <div class="switch-mode">
              Already have an account? 
              <a href="#" @click.prevent="switchMode('login')">LOGIN</a>
            </div>
          </form>

        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.auth-section {
  width: 100%;
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  direction: ltr;
}

.signup-container {
  max-width: 1100px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 3rem;
  justify-content: space-between;
}

.brand-section {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}

.brand-header h2 {
  color: #730b19;
  font-size: 26px;
  margin-bottom: 8px;
}

.brand-header p {
  color: #444;
  font-size: 15px;
  line-height: 1.5;
  max-width: 280px;
}

.img-wrapper {
  overflow: hidden;
  border-radius: 28px;
  width: 100%;
  max-width: 450px;
  margin: 15px 0;
}

.login-image {
  width: 100%;
  height: 320px;
  object-fit: contain;
  border-radius: 28px;
  display: block;
}

.brand-slogan {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
}

.form-section {
  flex: 1.1;
  max-width: 500px;
  width: 100%;
}

.form-card {
  border: 2px solid #730b19;
  border-radius: 25px;
  padding: 35px 30px;
  background-color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 8px 25px rgba(115, 11, 25, 0.12);
}

.title {
  text-align: center;
  color: #730b19;
  font-size: 28px;
  margin-bottom: 25px;
  font-weight: bold;
}

.input-group {
  position: relative;
  margin-bottom: 1.2rem;
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
  display: block;
  width: 100%;
  color: #333;
  padding: 8px 0;
  border: none;
  outline: none;
  direction: ltr;
  border-bottom: 2px solid #d1d1d1;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background: transparent;
}

.input-group input::placeholder {
  color: #a6a6a6;
  font-size: 15px;
  font-weight: 300;
}

.input-group input:focus {
  border-bottom-color: #730b19;
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

.role-selector label.title-label {
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
}

.radio-group input[type="radio"] {
  accent-color: #730b19;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 260px;
  height: 44px;
  margin: 20px auto 0;
  border-radius: 12px;
  border: 2px solid #730b19;
  background: #730b19;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(115, 11, 25, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background: #570813;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(115, 11, 25, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.switch-mode {
  text-align: center;
  margin-top: 15px;
  font-size: 13px;
  color: #555;
}

.switch-mode a {
  color: #730b19;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.2s;
}

.switch-mode a:hover {
  text-decoration: underline;
  color: #570813;
}

.error-msg {
  color: #730b19;
  font-size: 13px;
  text-align: center;
  margin-top: 10px;
  font-weight: 600;
}

.animate-fade-in {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.floating-animation {
  animation: floatCard 6s ease-in-out infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

@media (max-width: 900px) {
  .signup-container {
    flex-direction: column-reverse;
    gap: 1.5rem;
  }
  
  .form-section {
    max-width: 100%;
  }
}
</style>