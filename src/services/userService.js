/**
 * @file userService.js
 * @description Service functions for managing hospitals and donors data.
 * Structured for seamless replacement with backend/Odoo API endpoints later.
 */

const mockHospitals = [
  {
    id: 1,
    name: 'Royal Hospital',
    email: 'royal@gmail.com',
    phone: '+249 123 456 789',
    location: 'Khartoum',
    status: 'Active',
    totalBloodRequests: 28
  },
  {
    id: 2,
    name: 'Al Noor Hospital',
    email: 'alnoor@gmail.com',
    phone: '+249 987 654 321',
    location: 'Omdurman',
    status: 'Active',
    totalBloodRequests: 14
  },
  {
    id: 3,
    name: 'Nile Medical Center',
    email: 'nile.med@gmail.com',
    phone: '+249 555 333 222',
    location: 'Bahri',
    status: 'Inactive',
    totalBloodRequests: 5
  }
];

const mockDonors = [
  {
    id: 1,
    name: 'Sara Ahmed',
    bloodType: 'O+',
    email: 'sara.ahmed@gmail.com',
    phone: '+249 911 222 333',
    location: 'Khartoum',
    lastDonation: '20 Aug 2026',
    status: 'Eligible'
  },
  {
    id: 2,
    name: 'Ahmed Ali',
    bloodType: 'A+',
    email: 'ahmed.ali@gmail.com',
    phone: '+249 922 333 444',
    location: 'Khartoum',
    lastDonation: '15 Aug 2026',
    status: 'Eligible'
  },
  {
    id: 3,
    name: 'Fatima Omar',
    bloodType: 'B-',
    email: 'fatima.omar@gmail.com',
    phone: '+249 933 444 555',
    location: 'Omdurman',
    lastDonation: '10 May 2026',
    status: 'Not Eligible'
  }
];

export function getHospitals() {
  // TODO: Replace with fetch('/api/hospitals') when integrating with Odoo/Backend
  return Promise.resolve(mockHospitals);
}

export function getDonors() {
  // TODO: Replace with fetch('/api/donors') when integrating with Odoo/Backend
  return Promise.resolve(mockDonors);
}

export function getHospitalById(id) {
  // TODO: Replace with fetch(`/api/hospitals/${id}`)
  const hospital = mockHospitals.find(h => h.id === id);
  return Promise.resolve(hospital);
}

export function getDonorById(id) {
  // TODO: Replace with fetch(`/api/donors/${id}`)
  const donor = mockDonors.find(d => d.id === id);
  return Promise.resolve(donor);
}