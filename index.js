const express = require('express');
const axios = require('axios');
const app = express();

let lastExecutionTime = null; // Initialize lastExecutionTime to null
let isRequestExecuted = false; // Initialize flag variable to track request execution

let tempLink, tempType, tempCookie; // Variables to store temporary values

const executeRequest = async (link, type, cookie) => {
    try {
        const response = await axios.post("https://flikers.net/android/android_get_react.php", {
            post_id: link,
            react_type: type,
            version: "v1.7"
        }, {
            headers: {
                'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; V2134 Build/SP1A.210812.003)",
                'Connection': "Keep-Alive",
                'Accept-Encoding': "gzip",
                'Content-Type': "application/json",
                'Cookie': cookie
            }
        });
        console.log(response.data); // Log the response for debugging
        isRequestExecuted = true; // Set the flag to true after the first execution
        return response.data; // Return the response data
    } catch (error) {
        console.error(error);
        return { status: 'FAILED', message: 'An error occurred during request.', status_cookies: 'KEEP' };
    }
};

// Define the route to execute the request
app.get('/api/react', async (req, res) => {
    const { link, type, cookie } = req.query;
    tempLink = link; // Update temporary link
    tempType = type; // Update temporary type
    tempCookie = cookie; // Update temporary cookie
    const responseData = await executeRequest(link, type, cookie);
    res.json(responseData);
});

// Define the route to get the remaining countdown
app.get('/api/time', (req, res) => {
    if (!isRequestExecuted) {
        res.json({ remainingTime: null }); // Return null if the request hasn't been executed yet
    } else {
        const currentTime = Date.now();
        const nextExecutionTime = lastExecutionTime + (32 * 60 * 1000);
        const remainingTime = nextExecutionTime - currentTime;
        res.json({ remainingTime: remainingTime > 0 ? remainingTime : 0 });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => { 
    console.log(`Server is listening to ${port}`);
    // Execute the request in an infinite loop with a 32-minute interval
    setInterval(async () => {
        const link = tempLink; // Access link from stored temporary value
        const type = tempType; // Access type from stored temporary value
        const cookie = tempCookie; // Access cookie from stored temporary value
        const responseData = await executeRequest(link, type, cookie);
        if (responseData.status !== 'FAILED') {
            lastExecutionTime = Date.now(); // Update the last execution time
        }
    }, 35 * 60 * 1000); // 32 minutes in milliseconds
});
