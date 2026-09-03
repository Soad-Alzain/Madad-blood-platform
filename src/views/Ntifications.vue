<template>
  <div class="madad-notifications-container" :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'" :class="currentLanguage">
    <!-- Role Switcher & Language Toggle Bar -->
     
      
      <button class="lang-toggle-btn" @click="toggleLanguage">
        {{ currentLanguage === 'ar' ? 'English' : 'العربية' }}
      </button>

    <!-- Main Content Container / Full Notifications Page -->
    <main class="main-container">
      <section class="notifications-page">
        <div class="page-header">
          <h2>{{ t.notificationsCenter }}</h2>
          <button class="btn-primary" @click="markAllAsRead">{{ t.markAllRead }}</button>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
          <button 
            v-for="filter in filters" 
            :key="filter.key"
            class="filter-btn" 
            :class="{ active: currentFilter === filter.key }"
            @click="currentFilter = filter.key"
          >
            {{ filter.label[currentLanguage] }}
          </button>
        </div>

        <!-- Main Notifications List -->
        <div class="notifications-list">
          <template v-if="loading">
            <p class="loading-msg">Loading notifications...</p>
          </template>
          <template v-else-if="errorMessage">
            <p class="error-msg">{{ errorMessage }}</p>
          </template>
          <template v-else-if="filteredNotifications.length">
            <a 
              v-for="item in filteredNotifications" 
              :key="item.notification_id || item.id" 
              href="#" 
              class="notification-item" 
              :class="item.is_read || item.isRead ? 'read' : 'unread'"
              @click.prevent="handleNotificationClick(item)"
            >
              <div class="item-icon">
                <i :class="categoryIcons[item.type || item.category] || 'fa-solid fa-bell'"></i>
              </div>
              <div class="item-content">
                <div class="item-title">{{ typeof item.title === 'object' ? item.title[currentLanguage] : item.title }}</div>
                <div class="item-desc">{{ typeof item.message === 'object' ? item.message[currentLanguage] : (item.message || item.description) }}</div>
                <div class="item-time">{{ typeof item.created_at === 'object' ? item.created_at[currentLanguage] : (item.created_at || item.time) }}</div>
              </div>
            </a>
          </template>
          <p v-else class="empty-msg">{{ t.emptyMatching }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { notificationService } from '@/services/notificationService';
import { authService } from '@/services/authService';

export default {
  name: 'MadadNotifications',
  setup() {
    const currentLanguage = ref('en');

    const dictionary = {
      en: {
        roleLabel: "User Role",
        roles: {
          hospital: "Hospital",
          blood_bank: "Blood Bank",
          donor: "Donor",
          admin: "Admin"
        },
        notificationsTitle: "Notifications",
        markAllRead: "Mark all as read",
        emptyNotifications: "No notifications found",
        viewAll: "View all notifications",
        notificationsCenter: "Notifications ",
        emptyMatching: "No matching notifications",
        filters: {
          all: "All",
          unread: "Unread",
          blood_request: "Blood Requests",
          donation: "Donations",
          system: "System"
        }
      },
      ar: {
        roleLabel: "نوع المستخدم",
        roles: {
          hospital: "مستشفى",
          blood_bank: "بنك الدم",
          donor: "متبرع",
          admin: "أدمن"
        },
        notificationsTitle: "الإشعارات",
        markAllRead: "تعليم الكل كمقروء",
        emptyNotifications: "لا توجد إشعارات",
        viewAll: "عرض كل الإشعارات",
        notificationsCenter: " الإشعارات",
        emptyMatching: "لا توجد إشعارات مطابقة",
        filters: {
          all: "الكل",
          unread: "غير مقروءة",
          blood_request: "طلبات الدم",
          donation: "التبرعات",
          system: "النظام"
        }
      }
    };

    const t = computed(() => dictionary[currentLanguage.value]);

    const toggleLanguage = () => {
      currentLanguage.value = currentLanguage.value === 'en' ? 'ar' : 'en';
    };

    const notificationsData = ref([]);
    const currentRole = ref('hospital');
    const currentFilter = ref('all');
    const isDropdownActive = ref(false);
    const dropdownWrapper = ref(null);
    
    const loading = ref(false);
    const errorMessage = ref(null);

    const initUserData = async () => {
      try {
        const user = authService.getCurrentUser();
        if (user && user.role) {
          currentRole.value = user.role;
        }
      } catch (err) {
        console.error("Failed to load user session role:", err);
      }
    };

    const fetchNotifications = async () => {
      loading.value = true;
      errorMessage.value = null;
      try {
        const user = authService.getCurrentUser();
        const userId = user ? user.user_id : null;
        const response = await notificationService.getNotifications(userId);
        notificationsData.value = Array.isArray(response) ? response : (response.notifications || []);
      } catch (err) {
        console.error("API Error fetching notifications:", err);
        if (err.response && err.response.status === 401) {
          errorMessage.value = "Unauthorized. Please log in again.";
        } else if (err.response && err.response.status === 403) {
          errorMessage.value = "Forbidden. You do not have permission to view notifications.";
        } else {
          errorMessage.value = "Unable to load data. Please try again.";
        }
      } finally {
        loading.value = false;
      }
    };

    const filters = computed(() => [
      { key: 'all', label: { en: dictionary.en.filters.all, ar: dictionary.ar.filters.all } },
      { key: 'unread', label: { en: dictionary.en.filters.unread, ar: dictionary.ar.filters.unread } },
      { key: 'blood_request', label: { en: dictionary.en.filters.blood_request, ar: dictionary.ar.filters.blood_request } },
      { key: 'donation', label: { en: dictionary.en.filters.donation, ar: dictionary.ar.filters.donation } },
      { key: 'system', label: { en: dictionary.en.filters.system, ar: dictionary.ar.filters.system } }
    ]);

    const categoryIcons = {
      blood_request: "fa-solid fa-hand-holding-medical",
      donation: "fa-solid fa-calendar-check",
      system: "fa-solid fa-circle-exclamation"
    };

    const unreadCount = computed(() => {
      return notificationsData.value.filter(item => {
        const matchesRole = (item.role === currentRole.value) || !item.role;
        const isUnread = !(item.is_read || item.isRead);
        return matchesRole && isUnread;
      }).length;
    });

    const roleDropdownData = computed(() => {
      return notificationsData.value
        .filter(item => (item.role === currentRole.value) || !item.role)
        .slice(0, 5);
    });

    const filteredNotifications = computed(() => {
      return notificationsData.value.filter(item => {
        const matchesRole = (item.role === currentRole.value) || !item.role;
        const itemCategory = item.type || item.category;
        const isReadStatus = item.is_read || item.isRead;
        const matchesFilter = 
          currentFilter.value === 'all' ? true :
          currentFilter.value === 'unread' ? !isReadStatus :
          itemCategory === currentFilter.value;
        return matchesRole && matchesFilter;
      });
    });

    const toggleDropdown = () => {
      isDropdownActive.value = !isDropdownActive.value;
    };

    const markAsRead = async (id) => {
      const item = notificationsData.value.find(n => (n.notification_id === id || n.id === id));
      if (item) {
        item.is_read = true;
        item.isRead = true;
      }
      try {
        await notificationService.markAsRead(id);
      } catch (err) {
        console.error("Failed to mark notification as read on backend:", err);
      }
    };

    const markAllAsRead = async () => {
      notificationsData.value.forEach(item => {
        if ((item.role === currentRole.value) || !item.role) {
          item.is_read = true;
          item.isRead = true;
        }
      });
      try {
        const user = authService.getCurrentUser();
        await notificationService.markAllAsRead(user ? user.user_id : null);
      } catch (err) {
        console.error("Failed to mark all notifications as read on backend:", err);
      }
    };

    const handleNotificationClick = (item) => {
      const id = item.notification_id || item.id;
      markAsRead(id);
      isDropdownActive.value = false;
      if (item.actionUrl || item.related_id) {
        console.log(`Navigating to Odoo Route: ${item.actionUrl || item.related_id}`);
      }
    };

    const showFullPage = () => {
      isDropdownActive.value = false;
      window.scrollTo({ top: 100, behavior: 'smooth' });
    };

    const handleClickOutside = (event) => {
      if (dropdownWrapper.value && !dropdownWrapper.value.contains(event.target)) {
        isDropdownActive.value = false;
      }
    };

    onMounted(() => {
      initUserData();
      fetchNotifications();
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      currentRole,
      currentFilter,
      currentLanguage,
      isDropdownActive,
      dropdownWrapper,
      filters,
      categoryIcons,
      unreadCount,
      roleDropdownData,
      filteredNotifications,
      loading,
      errorMessage,
      t,
      toggleLanguage,
      toggleDropdown,
      markAsRead,
      markAllAsRead,
      handleNotificationClick,
      showFullPage
    };
  }
};
</script>

<style scoped>
:root {
  --primary-color: #730b19;
  --primary-hover: #540812;
  --bg-main: #FFFFFF;
  --bg-unread: #FDF2F4;
  --text-primary: #730b19;
  --text-secondary: #730b19;
  --border-color: #E5E7EB;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
  --transition: all 0.25s ease-in-out;
}

.madad-notifications-container {
  background-color: var(--bg-main);
  color: var(--text-primary);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
}

.madad-notifications-container[dir="rtl"] {
  text-align: right;
}

.madad-notifications-container[dir="ltr"] {
  text-align: left;
}

.madad-notifications-container *, 
.madad-notifications-container *::before, 
.madad-notifications-container *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}



.lang-toggle-btn {
  background-color: var(--primary-color);
  color: #730b19;
  border: 1px solid #730b19;
  padding: 10px ;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: var(--transition);
  align-items:left;

}

.lang-toggle-btn:hover {
  background-color: #730b19;
  color:#fff;
}

.navbar {
  height: 65px;
  background-color: var(--bg-main);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-brand {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--primary-color);
  letter-spacing: 0.5px;
}

.notification-wrapper {
  position: relative;
}

.bell-btn {
  background: transparent;
  border: none;
  font-size: 1.3rem;
  color: #730b19;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  position: relative;
  transition: var(--transition);
}

.bell-btn:hover {
  background-color: #F3F4F6;
}

.badge {
  position: absolute;
  top: 2px;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid var(--bg-main);
}

.madad-notifications-container[dir="rtl"] .badge {
  right: 2px;
}

.madad-notifications-container[dir="ltr"] .badge {
  left: 2px;
}

.notification-dropdown {
  position: absolute;
  top: 50px;
  width: 360px;
  background: var(--bg-main);
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  display: none;
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
}

.madad-notifications-container[dir="rtl"] .notification-dropdown {
  left: 0;
}

.madad-notifications-container[dir="ltr"] .notification-dropdown {
  right: 0;
}

.notification-dropdown.active {
  display: flex;
}

.dropdown-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-header h3 {
  font-size: 1rem;
  color: var(--primary-color);
}

.mark-read-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

.dropdown-body {
  max-height: 380px;
  overflow-y: auto;
}

.dropdown-footer {
  padding: 10px;
  text-align: center;
  border-top: 1px solid var(--border-color);
  background: #FAFAFA;
}

.dropdown-footer a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  color: inherit;
}

.notification-item:hover {
  background-color: #F9FAFB;
}

.notification-item.unread {
  background-color: var(--bg-unread);
}

.item-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #F3F4F6;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.madad-notifications-container[dir="rtl"] .item-icon {
  margin-left: 12px;
}

.madad-notifications-container[dir="ltr"] .item-icon {
  margin-right: 12px;
}

.item-content {
  flex-grow: 1;
}

.item-title {
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 3px;
  color: var(--text-primary);
}

.item-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.3;
  margin-bottom: 5px;
}

.item-time {
  font-size: 0.72rem;
  color: #730b19;
}

.empty-msg, .loading-msg, .error-msg {
  padding: 20px;
  text-align: center;
  color: #730b19;
  font-size: 0.85rem;
}

.error-msg {
  color: #dc2626;
}

.main-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  color: #730b19;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
  width: 100%;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  transition: var(--transition);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  overflow-x: auto;
}

.filter-btn {
  background: #F3F4F6;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.filter-btn.active, .filter-btn:hover {
  background: #730b19;
  color: #FFFFFF;
}

.notifications-list {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-main);
}

@media (max-width: 640px) {
  .navbar {
    padding: 0 1rem;
  }
  .notification-dropdown {
    width: 300px;
  }
  .madad-notifications-container[dir="rtl"] .notification-dropdown {
    left: -10px;
  }
  .madad-notifications-container[dir="ltr"] .notification-dropdown {
    right: -10px;
  }
}
</style>