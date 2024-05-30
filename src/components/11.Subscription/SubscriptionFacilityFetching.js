// apiUtils.js
import axios from 'axios';

let authHeaders = "";
// Function to get subscription facility details from the database
export const SubscriptionFacilityFetching = async () => {
    const data = JSON.parse(localStorage.getItem("data")); 
    if (data) {
        authHeaders = { Authorization: data.loginToken };
    }
    try {
        const response = await axios.get("/sam/v1/customer-registration/auth/get-subscription-facility", {
            headers: authHeaders,
        });

        const facilityDetails = response.data;
        return facilityDetails ? facilityDetails.reverse() : [];
    } catch (error) {
        console.error("Error fetching subscription facility details:", error);
        return []; // Return an empty array in case of error
    }
};
