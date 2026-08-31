<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import loginImage from '@/assets/login-image.png';

const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const showPassword = ref(false); // Added for password visibility toggle

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const login = async () => {
  // Basic frontend validation
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Please enter both email and password.';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    const response = await axios.post(`${API_BASE_URL}/login`, {
      email: email.value.trim(),
      password: password.value,
    });

    console.log('Login successful:', response.data);

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    router.push('/dashboard');
  } catch (error: unknown) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error)) {
      // Safely extract backend message if available
      const data = error.response?.data as { message?: string };
      errorMessage.value =
        data?.message || 'Login failed. Please check your credentials.';
    } else {
      errorMessage.value = 'An unexpected error occurred.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section class="login-section">
    <div class="signup-container">
      <div class="login-image-card">
        <div class="img-wrapper">
          <img :src="loginImage" alt="Login Illustration" class="login-image" />
        </div>
        <h3>MADAD Reaches… Life Continues</h3>
      </div>

      <div class="login-form">
        <form @submit.prevent="login" class="register">
          <h1 class="title">LOGIN</h1>

          <div class="input-group">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              aria-label="Email Address"
              autocomplete="email"
              required
            />
          </div>

          <div class="input-group password-group">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              aria-label="Password"
              autocomplete="current-password"
              required
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>

          <transition name="shake">
            <p v-if="errorMessage" class="error-msg" role="alert">{{ errorMessage }}</p>
          </transition>

          <button type="submit" :disabled="isLoading" class="btn-submit">
            <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
            <span>{{ isLoading ? 'Loading...' : 'Log In' }}</span>
          </button>

          <router-link to="/register" class="signup-link">
            You don't have an account? Register
          </router-link>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Base Setup */
.login-section {
  width: 100%;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  background-color: #fff;
}

.signup-container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 3rem;
  justify-content: space-between;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.title {
  text-align: center;
  color: #730b19;
  font-size: 30px;
  margin-bottom: 30px;
  font-weight: bold;
}

/* Image Card Animations */
.login-image-card {
  flex: 1;
  max-width: 580px;
  padding: 6px;
  background-color: #ffffff;
  animation: floatCard 6s ease-in-out infinite;
}

.img-wrapper {
  overflow: hidden;
  border-radius: 28px;
}

.login-image {
  width: 100%;
  height: 360px;
  object-fit: cover;
  border-radius: 28px;
  display: block;
  transition: transform 0.5s ease;
}

.login-image-card:hover .login-image {
  transform: scale(1.04);
}

.login-image-card h3 {
  text-align: center;
  margin-top: 1rem;
  color: #333;
}

/* Form Styles & Input Animations */
.login-form {
  flex: 1;
  max-width: 500px;
  padding: 50px;
  border: 2px solid #730b19;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.login-form:hover {
  box-shadow: 0 8px 25px rgba(115, 11, 25, 0.12);
}

.input-group {
  position: relative;
  margin-bottom: 2rem;
}

.password-group {
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 0;
  background: none;
  border: none;
  color: #730b19;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
}

.register input {
  display: block;
  width: 100%;
  color: #333;
  padding: 12px 0;
  border: none;
  outline: none;
  direction: ltr;
  border-bottom: 2px solid black;
  font-size: 18px;
  transition: border-color 0.3s ease, padding 0.3s ease;
  background: transparent;
}

.register input::placeholder {
  color: #a6a6a6;
  font-size: 18px;
  font-weight: 100;
  transition: opacity 0.3s ease;
}

.register input:focus {
  border-color: #730b19;
  padding-left: 5px;
}

.register input:focus::placeholder {
  opacity: 0.5;
}

/* Button & Loading Animation */
.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 300px;
  height: 44px;
  margin: 0 auto;
  border-radius: 10px;
  border: 2px solid #730b19;
  background: #730b19;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(115, 11, 25, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background: #570813;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(115, 11, 25, 0.3);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
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

/* Link & Error Styling */
.signup-link {
  display: block;
  margin-top: 15px;
  color: #730b19;
  text-decoration: none;
  font-size: 14px;
  width: 100%;
  text-align: center;
  transition: color 0.2s ease, transform 0.2s ease;
}

.signup-link:hover {
  text-decoration: underline;
  color: #570813;
}

.error-msg {
  color: #730b19;
  font-size: 14px;
  margin-bottom: 10px;
  width: 100%;
  text-align: center;
}

/* Keyframe Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatCard {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Vue Shake Transition for Errors */
.shake-enter-active {
  animation: shake 0.4s ease-in-out;
}

.shake-leave-active {
  animation: shake 0.4s ease-in-out reverse;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

@media (max-width: 900px) {
  .signup-container {
    flex-direction: column-reverse;
  }
}
</style>