<template>
  <section class="hero-section">
    <div class="hero-container">
      
      <div class="hero-image-card">
        <img src="/src/assets/hero-image.jpg" alt="Blood Donation" class="hero-img" />
      </div>

      <div class="hero-content">
        <div class="title-box">
          <h1 class="brand-en">MADAD</h1>
          <h2 class="brand-ar">مَدَد</h2>
        </div>

        <h3 class="hero-slogan">MADAD Reaches… Life Continues
</h3>

        <p class="hero-description">
A smart platform connecting blood donors, blood banks,and hospitals to make blood access faster and help save lives.
        </p>

        <div class="action-buttons">
          <router-link to="/request-blood" class="btn-request">Request Blood</router-link>
          <router-link to="/donate-blood" class="btn-donate">Donate Blood</router-link>
        </div>

        <router-link to="/about" class="read-more">Learn More .......
</router-link>
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero-section {
  width: 100%;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.hero-container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 3rem;
  justify-content: space-between;
}

.hero-image-card {
  flex: 1;
  max-width: 580px;
  border: 3px solid #730b19;
  border-radius: 35px;
  padding: 6px;
  background-color: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.hero-img {
  width: 100%;
  height: 360px;
  object-fit: cover;
  border-radius: 28px;
  display: block;
}

.hero-content {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-box {
  margin-bottom: 0.5rem;
}

.brand-en {
  font-family: serif;
  font-size: 2.2rem;
  color: #730b19;
  margin: 0;
  font-weight: 900;
  letter-spacing: 1px;
}

.brand-ar {
  font-size: 1.8rem;
  color: #730b19;
  margin: 0;
  font-weight: bold;
}

.hero-slogan {
  font-size: 1.8rem;
  color: #222222;
  margin: 1rem 0;
  font-weight: 800;
}

.hero-description {
  font-size: 1.15rem;
  color: #730b19;
  line-height: 1.8;
  max-width: 480px;
  margin-bottom: 2rem;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  cursor:pointer;

}


.btn-request {
  background-color: #730b19;
  color: #ffffff;
  padding: 0.8rem 2.5rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
  border: 2px solid #730b19;
  transition: opacity 0.2s;
  cursor: pointer;
}
.btn-request:hover{
  border:solid  4px ;
  transition: border 0.4s ease;
}

.btn-donate {
  background-color: #ffffff;
  color: #730b19;
  padding: 0.8rem 2.5rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
  border: 2px solid #730b19;
  transition: background-color 0.2s;
  cursor: pointer;
}
.btn-donate:hover{
    border:solid  4px ;
    transition: border 0.2s ease;
}

.btn-request:hover,
.btn-donate:hover {
  opacity: 0.9;
}

.read-more {
  color: #730b19;
  font-weight: bold;
  font-size: 1.1rem;
  text-decoration: none;
  margin-top: 0.5rem;
  direction: ltr;
}

@media (max-width: 900px) {
  .hero-container {
    flex-direction: column-reverse;
  }
}
</style>