const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Function to send reactions
async function sendReactions(link, type, cookie) {
    console.log('Sending data:', { link, type, cookie }); // Logging the data sent
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
        console.log('Response received:', response.data); // Logging the response data
        return response; // Return the response
    } catch (error) {
        console.error('Error sending request:', error); // Log error if request fails
        throw error; // Propagate the error
    }
}

// Endpoint to handle form submission
app.post('/api/react', async (req, res) => {
    const { link, type, cookie } = req.body;
    try {
        const response = await sendReactions(link, type, cookie);
        res.json(response.data);

        // Schedule the next form submission after 31 minutes
        setInterval(async () => {
            console.log("Countdown started."); // Console log notification
            try {
                const response = await sendReactions(link, type, cookie);
                console.log("Reactions sent again.", response.data);
            } catch (error) {
                console.error("Error sending reactions:", error);
            }
        }, 31 * 60 * 1000); // 31 minutes in milliseconds
    } catch (error) {
        console.error(error);
        res.json({ error: 'an error occurred' });
    }
});

// Endpoint to serve server options
app.get('/api/servers', (req, res) => {
    // Replace this with your logic to fetch server options
    const serverOptions = [
        { name: "Server 1", value: "sb=5-shZhvdD--gEw5MDmhLoqwd; wd=1920x953; datr=5-shZiw2SvXThJ1d_Bx9QsCe; ps_n=1; ps_l=1; c_user=61558640691524; xs=6%3AN_wuA4XBAbXMZg%3A2%3A1713616136%3A-1%3A-1%3A%3AAcXQOSZHjxdyRIaSIijDuZVUWRotxsyppEKOPb86Rw; fr=1Ixl5F7RY8l6ptbTh.AWXJ3dE1jH9-5KkQCTVP-bo5iao.BmI8sJ..AAA.0.0.BmI8sJ.AWXvBILju1I; m_ls=%7B%2261558640691524%22%3A%7B%22c%22%3A%7B%221%22%3A%22HCwAABZwFszI5CUTBRaIpcrOl_8bAA%22%2C%222%22%3A%22GSwVQBxMAAAWARao1J3iDBYAFqjUneIMABV-HEwAABYAFqjUneIMFgAWqNSd4gwAFigA%22%2C%2295%22%3A%22HCwAABYUFt74nNoBEwUWiKXKzpf_GwA%22%7D%2C%22d%22%3A%22591be8a8-aee9-417e-a7e0-5a48ba3c5c5f%22%2C%22s%22%3A%221%22%2C%22u%22%3A%22v0n167%22%7D%7D; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1713625001397%2C%22v%22%3A1%7D" }
        // Add more options as needed
    ];
    res.json(serverOptions);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// connection
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
