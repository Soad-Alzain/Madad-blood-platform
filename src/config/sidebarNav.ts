export interface NavItem {
  label: string;
  icon?: string;
  to?: string;
  roles: ('admin' | 'blood_bank' | 'hospital' | 'donor')[];
  children?: NavItem[];
}

export const navigationConfig: NavItem[] = [
  { label: 'Home', to: '/', roles: ['admin', 'blood_bank', 'hospital', 'donor'] },
  { label: 'Dashboard', to: '/dashboard', roles: ['admin', 'blood_bank', 'hospital', 'donor'] },
  {
    label: 'Blood Management', to:'/blood-management', roles: ['admin', 'blood_bank', 'hospital'],
    
  },
  {
    label: 'Users',
    roles: ['admin'],
    children: [
      { label: 'Hospitals', to: '/users/hospitals', roles: ['admin'] },
      { label: 'Donors', to: '/users/donors', roles: ['admin'] }
    ]
  },
  { label: 'My Donations', to: '/my-donations', roles: ['donor'] },
  { label: 'Reports', to: '/reports', roles: ['admin', 'blood_bank', 'hospital', 'donor'] },
  { label: 'Notifications', to: '/notifications', roles: ['admin', 'blood_bank', 'hospital', 'donor'] },
  { label: 'Profile', to: '/profile', roles: ['admin', 'blood_bank', 'hospital', 'donor'] }
];