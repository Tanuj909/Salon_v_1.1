export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  
  USER: {
    PROFILE_IMAGE: "/users/me/profile-image",
  },

  OTP: {
    SEND: "/auth/send-otp"
  },

  CUSTOMER: {
    CURRENT: "/customers/me",
  },

  CATEGORIES: {
    ALL: "/categories",
    ACTIVE: "/categories/active",
  },

  SALON: {
    NEARBY: (lat, lng, radius) => `/businesses/nearby?latitude=${lat}&longitude=${lng}&radiusInKm=${radius}`,
    NEARBY_BY_CATEGORY: (categoryId, lat, lng, radius, size) =>
      `/businesses/nearby/category/${categoryId}?latitude=${lat}&longitude=${lng}&radiusInKm=${radius}&size=${size}&page=0`,
    SEARCH_NEARBY: (params) => {
      const { 
        lat, lng, radius, serviceName, categoryId, 
        minRating, isOpen, date, startTime, endTime,
        page = 0, size = 20, sortBy = 'distance', sortDirection = 'ASC' 
      } = params;
      
      let url = `/businesses/nearby/search?latitude=${lat}&longitude=${lng}&radiusInKm=${radius}&page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
      
      if (serviceName) url += `&serviceName=${encodeURIComponent(serviceName)}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      if (minRating) url += `&minRating=${minRating}`;
      if (isOpen !== undefined) url += `&isOpen=${isOpen}`;
      if (date) url += `&date=${date}`;
      if (startTime) url += `&startTime=${startTime}`;
      if (endTime) url += `&endTime=${endTime}`;
      
      return url;
    },

    DETAILS: (id) => `/businesses/${id}`,

    STAFF: (id) => `/staff/business/${id}`,
    STAFF_PROFILE: (id) => `/staff/${id}`,
    STAFF_BY_SERVICE: (serviceId) => `/staff/service/${serviceId}`,
    CATEGORIES_WITH_DETAILS: (businessId) => `/services/business/${businessId}/categories-with-details`,
    SERVICES_BY_CATEGORY: (businessId, categoryId) => `/services/business/${businessId}/category/${categoryId}/services`,
    TIMINGS: (id) => `/business-timings/business/${id}`,
  },

  REVIEWS: {
    BY_BUSINESS: (businessId) => `/reviews/business/${businessId}`,
    CREATE: "/reviews",
  },

  BOOKINGS: {
    CREATE: "/bookings",
    MY_BOOKINGS: "/bookings/my",
    MY_BUSINESS: (businessId) => `/bookings/my/business/${businessId}`,
    CANCEL: (id) => `/bookings/my/${id}/cancel`,
  },

  SLOTS: {
    BY_STAFF: (staffId, startDate, endDate) => `/slots/staff/${staffId}?startDate=${startDate}&endDate=${endDate}`,
    BY_BUSINESS: (businessId, startDate, endDate) => `/slots/business/${businessId}?startDate=${startDate}&endDate=${endDate}`,
  },

  BUSINESS: {
    REGISTER: "/businesses/register",
    LIST: "/businesses",
    MY_BUSINESS: "/businesses/my-business",
    UPLOAD_DOCUMENT: (id) => `/businesses/verification/${id}/documents`,
    GET_DOCUMENTS: (id) => `/businesses/verification/${id}/documents`,
    MESSAGES: (id) => `/businesses/verification/${id}/messages`,
  },
  AGREEMENTS: {
    BY_BUSINESS: (id) => `/agreements/business/${id}`,
    ACCEPT: (id) => `/agreements/${id}/accept`,
  },
  SUPPORT: {
    SUBMIT: "/contact-us",
    MY_QUERIES: (page = 0, size = 5) => `/contact-us/my-queries?page=${page}&size=${size}`,
  },
};
