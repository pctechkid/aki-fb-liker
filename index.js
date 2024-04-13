const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const Swal = require('sweetalert2');

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define the array of cookie options
const cookies = [
    {
        name: 'Server 1',
        value: 'sb=frAaZmAzphr4jcHOSBWOHCkz; wd=958x951; datr=frAaZkxFT20DOABcn4QbojLy; ps_l=0; ps_n=0; locale=en_US; m_ls=%7B%2261558640691524%22%3A%7B%22c%22%3A%7B%221%22%3A%22HCwAABZaFujNwYgKEwUWiKXKzpf_GwA%22%2C%222%22%3A%22GSwVQBxMAAAWARawstXhDBYAABV-HEwAABYAFrCy1eEMFgAAFigA%22%2C%2295%22%3A%22HCwAABYEFozusLUDEwUWiKXKzpf_GwA%22%7D%2C%22d%22%3A%223fdbd821-0053-4267-b9c9-e082d6d94ee7%22%2C%22s%22%3A%220%22%2C%22u%22%3A%222guuwr%22%7D%7D; c_user=61557459458701; xs=20%3AA-1rZGMB3c53Rw%3A2%3A1713025234%3A-1%3A10352; fr=0jcEGRzLsWNyzltCE.AWXSDrg8x20Rv0MauDyEf8Plwc4.BmGrB-..AAA.0.0.BmGrDY.AWWwvlXyg_0; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1713025243877%2C%22v%22%3A1%7D',
    },
    {
        name: 'Server 2',
        value: 'wd=958x951; datr=ZqwaZvp3IbAmm9_UDIJuCgix; sb=fqwaZg8zgCn5uMum6hhchD8H; c_user=61558640691524; xs=40%3ABPBmbfTQY6JJkA%3A2%3A1713024143%3A-1%3A-1; fr=0RxrJneiqMUtwz7nt.AWUOsvY5-flDV4OpWbjbl0elOG0.BmGqx-..AAA.0.0.BmGqyO.AWWNwWgwEIU; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1713024147248%2C%22v%22%3A1%7D; m_ls=%7B%2261558640691524%22%3A%7B%22c%22%3A%7B%7D%2C%22d%22%3A%223fdbd821-0053-4267-b9c9-e082d6d94ee7%22%2C%22s%22%3A%221%22%2C%22u%22%3A%222guuwr%22%7D%7D',
    },
    // Add more cookie options if needed
];

// Route to serve the HTML form
app.get('/form', (req, res) => {
    // Generate the options for the cookie select element
    const cookieOptions = cookies.map(cookie => `<option value="${cookie.value}">${cookie.name}</option>`).join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Auto liker by Ronnel</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
        <!-- SweetAlert2 CDN -->
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <!-- Custom CSS -->
        <style>
            /* Spinner container */
            .spinner-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5); /* Transparent black */
                display: none;
                justify-content: center;
                align-items: center;
            }

            /* Spinner */
            .spinner-border-white {
                width: 3rem;
                height: 3rem;
                border-width: 0.25em;
                border-color: white;
                border-top-color: transparent !important; /* Retain default animation properties */
                animation: spinner-border 0.75s linear infinite; /* Retain default animation properties */
            }

            @keyframes spinner-border {
                to { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="container mt-5">
            <form id="reactForm" action="/api/react" method="POST">
                <div class="mb-3">
                    <label for="link" class="form-label">Link:</label>
                    <input type="text" class="form-control shadow-none" id="link" name="link">
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Type:</label>
                    <select class="form-select shadow-none" id="type" name="type">
                        <option value="LIKE">👍 Like</option>
                        <option value="LOVE" selected>❤️ Love</option>
                        <option value="WOW">😲 Wow</option>
                        <option value="ANGRY">😡 Angry</option>
                        <option value="SAD">😢 Sad</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="cookie" class="form-label">Server:</label>
                    <select class="form-select shadow-none" id="cookie" name="cookie">
                        ${cookieOptions}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary" id="submitBtn">Submit</button>
            </form>
        </div>

        <!-- Spinner container -->
        <div class="spinner-container" id="spinnerContainer">
            <div class="spinner-border spinner-border-white" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <!-- Script to handle form submission and display SweetAlert2 messages -->
        <script>
            document.getElementById('reactForm').addEventListener('submit', function(event) {
                event.preventDefault();

                // Show loading spinner
                document.getElementById('spinnerContainer').style.display = 'flex';

                // Retrieve form data
                const link = document.getElementById('link').value;
                const type = document.getElementById('type').value;
                const cookie = document.getElementById('cookie').value;

                // Send fetch request
                fetch('/api/react', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ link, type, cookie })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Hide loading spinner
                    document.getElementById('spinnerContainer').style.display = 'none';
                
                    let messageText = data.message;
                
                    if (messageText === 'Please wait until the countdown finishes.') {
                        messageText = 'Too fast. Try again later!';
                    }
                
                    if (data.status === 'FAILED') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: messageText,
                            allowOutsideClick: false // Prevent dismissing by clicking outside
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Reacts sent successfully!',
                            allowOutsideClick: false // Prevent dismissing by clicking outside
                        });
                    }
                })                
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while submitting reaction.',
                        allowOutsideClick: false // Prevent dismissing by clicking outside
                    });
                });
            });
        </script>
    </body>
    </html>

    `);
});

// Route to handle form submission and make axios.post request
app.post('/api/react', (req, res) => {
    const { link, type, cookie } = req.body;
    console.log('Form Data Received:', { link, type, cookie });

    axios.post("https://flikers.net/android/android_get_react.php", {
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
            res.json(response.data); // Send response from the external API to the client
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'An error occurred' }); // Send error response to the client
        });
});

// connection
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
