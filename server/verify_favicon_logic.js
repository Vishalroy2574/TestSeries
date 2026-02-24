import express from "express";

const app = express();

// The logic we added to server.js
app.get("/favicon.ico", (req, res) => {
    console.log("Favicon request received");
    res.status(204).end();
});

const PORT = 5001; // Use a different port to avoid conflicts
const server = app.listen(PORT, async () => {
    console.log(`Verification server running on port ${PORT}`);
    try {
        const response = await fetch(`http://localhost:${PORT}/favicon.ico`);
        console.log(`Response status: ${response.status}`);
        if (response.status === 204) {
            console.log("SUCCESS: Favicon route returns 204 No Content");
        } else {
            console.error(`FAILURE: Expected 204, got ${response.status}`);
        }
    } catch (error) {
        console.error("Error during verification:", error.message);
    } finally {
        server.close();
        process.exit(0);
    }
});
