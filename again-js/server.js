const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files (if your frontend is in a folder like 'public')
app.use(express.static(path.join(__dirname, 'public')));

// GeoNames API endpoint for city lookup (replace with your GeoNames API username)
const geoNamesUserName = 'ucs05';

// Route for the main page (front-end)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Function to fetch GeoName ID based on city
async function getGeoNameId(city) {
    const geoNamesUrl = `http://api.geonames.org/searchJSON?q=${city}&maxRows=1&username=ucs05`;
    try {
        const response = await axios.get(geoNamesUrl);
        if (response.data.geonames && response.data.geonames.length > 0) {
            return response.data.geonames[0].geonameId;
        } else {
            throw new Error('City not found');
        }
    } catch (error) {
        console.error("Error fetching GeoName ID:", error);
        throw error;
    }
}

// Route to fetch Muhurat data with dynamic city and date input
app.post('/fetch_muhurat', async (req, res) => {
    const { city, date } = req.body;  // Get city and date from the request body
    
    try {
        // Get the GeoName ID for the provided city
        const geoNameId = await getGeoNameId(city);

        // Format the URL to include the date and GeoName ID
        const url = `https://www.drikpanchang.com/muhurat/panchaka-rahita-muhurat.html?geoname-id=${geoNameId}&date=${date}`;
        
        // Fetch the HTML content from the website
        const response = await axios.get(url);
        
        // Load the HTML content using cheerio
        const $ = cheerio.load(response.data);
        
        // Extract the required data from the table
        const muhuratData = [];
        $('.dpMuhurtaRow').each((i, element) => {
            const muhurtaName = $(element).find('.dpMuhurtaName').text().trim();
            const muhurtaTime = $(element).find('.dpMuhurtaTime').text().trim();
            
            const [name, category] = muhurtaName.split(' - ');  // Split name and category
            
            muhuratData.push({
                muhurat: name,
                category: category || '',
                time: muhurtaTime
            });
        });
        
        // Return the data as JSON response
        res.json(muhuratData);
    } catch (error) {
        console.error("Error fetching Muhurat data:", error);
        res.status(500).send('Error fetching data');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
