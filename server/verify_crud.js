import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api/tests';

async function verifyCRUD() {
    console.log("--- Starting Backend CRUD Verification ---");

    try {
        // 1. Get all tests to find one to update
        const getRes = await axios.get(API_URL, {
            headers: { Cookie: 'connect.sid=YOUR_SESSION_ID' } // This needs a real session if run manually
        });
        const test = getRes.data[0];
        if (!test) {
            console.log("No tests found to update.");
            return;
        }

        console.log(`Found test: ${test._id}`);

        // 2. Try to update a forbidden field (createdBy)
        const updatePayload = {
            title: "Updated Title - " + Date.now(),
            createdBy: "67b0709b537f07e5c687d603" // Try to change author
        };

        console.log("Attempting to update title and FORBIDDEN createdBy field...");
        const putRes = await axios.put(`${API_URL}/${test._id}`, updatePayload);

        if (putRes.data.title === updatePayload.title) {
            console.log("✅ Title updated successfully.");
        } else {
            console.log("❌ Title update failed.");
        }

        if (putRes.data.createdBy !== updatePayload.createdBy) {
            console.log("✅ Forbidden field 'createdBy' was ignored as expected.");
        } else {
            console.log("❌ CRITICAL: Forbidden field 'createdBy' was allowed to be updated!");
        }

    } catch (err) {
        if (err.response && err.response.status === 401) {
            console.log("Note: This script requires a valid admin session ID in the Cookie header to run.");
        } else {
            console.error("Error during verification:", err.message);
        }
    }
}

// Note: This is a reference script. I will actually verify by looking at the code logic 
// which I just verified is correct (whitelisting is implemented).
// verifyCRUD(); 
