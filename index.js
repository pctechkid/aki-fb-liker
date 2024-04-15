const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Function to send reactions
function sendReactions(link, type, cookie) {
    console.log('Sending data:', { link, type, cookie }); // Logging the data sent
    return axios.post("https://flikers.net/android/android_get_react.php", {
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
    })
    .then(response => {
        console.log('Response received:', response.data); // Logging the response data
        return response; // Return the response
    })
    .catch(error => {
        console.error('Error sending request:', error); // Log error if request fails
        throw error; // Propagate the error
    });
}

// Endpoint to serve server options
app.get('/api/servers', (req, res) => {
    // Replace this with your logic to fetch server options
    const serverOptions = [
        { name: "Server 1", value: "sb=N2AdZucpNFhsnmpzriEcgzuZ; wd=1920x953; datr=N2AdZmpLvTaJloarc4E1dids; c_user=61558640691524; xs=32%3Ag7MZS0QFH2ChcA%3A2%3A1713201224%3A-1%3A-1; fr=1eCubZq2FcT2hVLvw.AWWP8ivapcXKQyxoqPVMofqDltE.BmHVuw..AAA.0.0.BmHWBK.AWVaG9RI3kc; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1713201227978%2C%22v%22%3A1%7D; m_ls=%7B%2261558640691524%22%3A%7B%22c%22%3A%7B%7D%2C%22d%22%3A%2208e21b3a-c0c9-4df8-9d70-217271118805%22%2C%22s%22%3A%221%22%2C%22u%22%3A%22pr47wm%22%7D%7D" }
        // Add more options as needed
    ];
    res.json(serverOptions);
});

// Endpoint to handle form submission
app.post('/api/react', (req, res) => {
    const { link, type, cookie } = req.body;
    sendReactions(link, type, cookie)
    .then(dat => {
        res.json(dat.data);
        // Schedule the next form submission after 31 minutes
        setInterval(() => {
            sendReactions(link, type, cookie)
            .then(response => console.log("Reactions sent again.", response.data))
            .catch(error => console.error("Error sending reactions:", error));
        }, 31 * 60 * 1000); // 31 minutes in milliseconds
    })
    .catch(e => {
        console.error(e);
        res.json({ error: 'an error occurred' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// connection
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));