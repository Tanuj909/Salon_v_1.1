import apiClient from "@/services/apiClient";
import { publicApiClient } from "@/services/apiClient";
import { ENDPOINTS } from "@/services/endpoints";

export const fetchNearbySalons = async (lat, lng, radius = 20) => {
  const response = await publicApiClient.get(
    ENDPOINTS.SALON.NEARBY(lat, lng, radius)
  );
  return response.data;
};

export const searchNearbySalons = async (params) => {
  const response = await publicApiClient.get(
    ENDPOINTS.SALON.SEARCH_NEARBY(params)
  );
  return response.data.content || response.data; // fallback for paginated response
};

export const fetchCategories = async () => {
  const response = await publicApiClient.get(ENDPOINTS.CATEGORIES.ALL);
  return response.data.content;
};

export const fetchActiveCategories = async () => {
  const response = await publicApiClient.get(ENDPOINTS.CATEGORIES.ACTIVE);
  return response.data;
};

export const fetchNearbyByCategory = async (categoryId, lat, lng, radius = 25, size = 4) => {
  const response = await publicApiClient.get(
    ENDPOINTS.SALON.NEARBY_BY_CATEGORY(categoryId, lat, lng, radius, size)
  );
  return response.data.content;
};

export const fetchSalonById = async (id) => {
  const response = await publicApiClient.get(
    ENDPOINTS.SALON.DETAILS(id)
  );
  return response.data;
};

export const getAllSalonStaff = async (id) => {
  const response = await publicApiClient.get(
    ENDPOINTS.SALON.STAFF(id)
  );
  return response.data.body.content;
};

export const getStaffByServiceId = async (serviceId) => {
  const response = await apiClient.get(
    ENDPOINTS.SALON.STAFF_BY_SERVICE(serviceId)
  );
  return response.data;
};

export const getStaffProfile = async (staffId) => {
  const response = await publicApiClient.get(
    ENDPOINTS.SALON.STAFF_PROFILE(staffId)
  );
  return response.data.body;
};

export const getBusinessCategoriesWithDetails = async (businessId) => {
  const response = await publicApiClient.get(
    ENDPOINTS.SALON.CATEGORIES_WITH_DETAILS(businessId)
  );
  return response.data;
};

export const getServicesByCategoryForBusiness = async (businessId, categoryId) => {
  const response = await publicApiClient.get(
    ENDPOINTS.SALON.SERVICES_BY_CATEGORY(businessId, categoryId)
  );
  return response.data;
};

export const fetchStaffSlots = async (staffId, startDate, endDate) => {
  const response = await apiClient.get(
    ENDPOINTS.SLOTS.BY_STAFF(staffId, startDate, endDate)
  );
  return response.data;
};

export const fetchBusinessSlots = async (businessId, startDate, endDate) => {
  const response = await apiClient.get(
    ENDPOINTS.SLOTS.BY_BUSINESS(businessId, startDate, endDate)
  );
  return response.data;
};

export const fetchDistinctServiceNames = async () => {
  const response = await publicApiClient.get(
    '/services/distinct/names'
  );
  return response.data;
};

export const getSalonTimings = async (id) => {
  const response = await publicApiClient.get(
    ENDPOINTS.SALON.TIMINGS(id)
  );
  return response.data;
};
