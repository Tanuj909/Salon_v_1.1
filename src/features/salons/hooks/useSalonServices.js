"use client";

import { useEffect, useState } from "react";
import { getBusinessCategoriesWithDetails, getServicesByCategoryForBusiness } from "../services/salonService";

export const useSalonServices = ({ id }) => {
    const [services, setServices] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const handleServices = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch categories
                const categories = await getBusinessCategoriesWithDetails(id);
                
                // 2. Fetch services for each category in parallel
                if (categories && categories.length > 0) {
                    const servicesPromises = categories.map((cat) =>
                        getServicesByCategoryForBusiness(id, cat.id).catch((err) => {
                            console.error(`Error fetching services for category ${cat.id}:`, err);
                            return [];
                        })
                    );
                    const servicesList = await Promise.all(servicesPromises);
                    
                    // 3. Flatten list
                    const flatServices = servicesList.flat();
                    
                    // Filter duplicates just in case a service is under multiple categories
                    const uniqueServices = [];
                    const seenIds = new Set();
                    for (const s of flatServices) {
                        if (s && s.id && !seenIds.has(s.id)) {
                            seenIds.add(s.id);
                            uniqueServices.push(s);
                        }
                    }
                    
                    setServices(uniqueServices);
                } else {
                    setServices([]);
                }
            } catch (err) {
                console.error("Error fetching category-based services:", err);
                setError("Failed to fetch Salon Services!");
            } finally {
                setLoading(false);
            }
        };

        handleServices();
    }, [id]);

    return { services, loading, error };
};
