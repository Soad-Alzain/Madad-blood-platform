<script setup lang="ts">
/**
 * @file HeroSection.vue
 * @description Hero section component for MADAD platform featuring responsive layout,
 * brand introduction, call-to-action buttons with icons, and smooth transitions.
 * 
 * @author Soad Alzain
 * @created August 2026
 */

// Component logic can be added here if needed
</script>

<template>
  <section class="hero-section">
    <div class="hero-container">
      
      <!-- Hero Content Column -->
      <div class="hero-content">
        <div class="title-box">
          <h1 class="brand-en">MADAD</h1>
          <h2 class="brand-ar">مَدَد</h2>
        </div>

        <h3 class="hero-slogan">MADAD Reaches… Life Continues</h3>

        <p class="hero-description">
          A smart platform connecting blood donors, blood banks, and hospitals to make blood access faster and help save lives.
        </p>

        <div class="action-buttons">
          <router-link to="/request-blood" class="btn-request">
            <i class="fas fa-hand-holding-medical" aria-hidden="true"></i> Request Blood
          </router-link>
          
          <router-link to="/donate-blood" class="btn-donate">
            <i class="fas fa-tint" aria-hidden="true"></i> Donate Blood
          </router-link>
        </div>

        <router-link to="/about" class="read-more">
          Learn More <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </router-link>
      </div>

      <!-- Hero Image Card Column -->
      <div class="hero-image-card">
        <img src="C:\Users\LENOVO\Desktop\madad-blood-bank\src\assets\hero-imag.jpg" alt="Blood Donation" class="hero-img" />
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ==========================================
   HERO SECTION BASE STYLES
   ========================================== */
.hero-section {
  width: 100%;
  padding: 3rem 1.5rem;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.hero-container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 3rem;
  justify-content: space-between;
}

/* ==========================================
   HERO IMAGE STYLING
   ========================================== */
.hero-image-card {
  flex: 1;
  max-width: 580px;
  width: 100%;
  border: 3px solid #730b19;
  border-radius: 35px;
  padding: 6px;
  background-color: #ffffff;
  box-shadow: 0 4px 15px rgba(115, 11, 25, 0.08);
  box-sizing: border-box;
}

.hero-img {
  width: 100%;
  height: 380px;
  object-fit: cover;
  border-radius: 28px;
  display: block;
}

/* ==========================================
   HERO CONTENT TYPOGRAPHY & LAYOUT
   ========================================== */
.hero-content {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.title-box {
  margin-bottom: 0.5rem;
  text-align: center;
}

.brand-en {
  font-family: serif;
  font-size: 2.5rem;
  color: #730b19;
  margin: 0;
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 1.1;
}

.brand-ar {
  font-size: 2rem;
  color: #730b19;
  margin: 0;
  font-weight: bold;
}

.hero-slogan {
  font-size: 1.6rem;
  color: #222222;
  margin: 1rem 0;
  font-weight: 800;
}

.hero-description {
  font-size: 1.1rem;
  color: #730b19;
  line-height: 1.8;
  max-width: 480px;
  margin-bottom: 2rem;
  font-weight: 600;
}

/* ==========================================
   ACTION BUTTONS & INTERACTION
   ========================================== */
.action-buttons {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn-request,
.btn-donate {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.8rem 2rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  border: 2px solid #730b19;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-request {
  background-color: #730b19;
  color: #ffffff;
}

.btn-request:hover {
  background-color: #5c0813;
  border-color: #5c0813;
  box-shadow: 0 4px 12px rgba(115, 11, 25, 0.25);
}

.btn-donate {
  background-color: #ffffff;
  color: #730b19;
}

.btn-donate:hover {
  background-color: #fcf0f2;
  border-color: #730b19;
  box-shadow: 0 4px 12px rgba(115, 11, 25, 0.15);
}

.read-more {
  color: #730b19;
  font-weight: bold;
  font-size: 1.05rem;
  text-decoration: none;
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s;
  text-align: center;
}

.read-more:hover {
  opacity: 0.75;
}

/* ==========================================
   RESPONSIVE DESIGN (MEDIA QUERIES)
   ========================================== */
@media (max-width: 900px) {
  .hero-container {
    flex-direction: column-reverse;
    text-align: center;
    gap: 2rem;
  }

  .hero-content {
    align-items: center;
    text-align: center;
  }

  .action-buttons {
    justify-content: center;
    width: 100%;
  }

  .btn-request,
  .btn-donate {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }

  .hero-image-card {
    max-width: 100%;
  }

  .hero-img {
    height: 280px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 1.5rem 1rem;
  }

  .brand-en {
    font-size: 2rem;
  }

  .brand-ar {
    font-size: 1.6rem;
  }

  .hero-slogan {
    font-size: 1.3rem;
  }

  .hero-description {
    font-size: 1rem;
  }
}
</style>