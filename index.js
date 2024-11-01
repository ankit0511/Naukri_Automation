const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views')); // Specify the views directory

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files like CSS

app.get('/', (req, res) => {
    res.render('index'); // Render the EJS template
});

// Start automation on form submission
app.post('/start-automation', async (req, res) => {
    const { username, password, jobtype, location } = req.body;

    if (!username || !password || !jobtype || !location) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        await runPuppeteerAutomation(username, password, jobtype, location);
        res.json({ message: 'Automation completed successfully.' });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

async function runPuppeteerAutomation(username, password, jobtype, location) {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
    });

    const tab = await browser.newPage();
    await tab.goto("https://www.naukri.com/nlogin/login");

    // Enter username and password
    await tab.type("#usernameField", username, { delay: 100 });
    await tab.type("#passwordField", password, { delay: 100 });

    // Click the login button
    await tab.waitForSelector('button[data-ga-track="spa-event|login|login|Save||||true"]', { visible: true });
    await tab.click('button[data-ga-track="spa-event|login|login|Save||||true"]');

    // Wait for navigation to complete after logging in
    await tab.waitForNavigation();

    // Search for job
    await tab.waitForSelector('span.nI-gNb-sb__placeholder');
    await tab.click('span.nI-gNb-sb__placeholder');

    await tab.waitForSelector('input.suggestor-input[placeholder="Enter keyword / designation / companies"]');
    await tab.type('input.suggestor-input[placeholder="Enter keyword / designation / companies"]', jobtype, { delay: 100 });

    await tab.waitForSelector('span.ni-gnb-icn.ni-gnb-icn-expand-more');
    await tab.click('span.ni-gnb-icn.ni-gnb-icn-expand-more');
    
    await tab.waitForSelector('li[title="Fresher"]');
    await tab.click('li[title="Fresher"]');

    await tab.waitForSelector('input.suggestor-input[placeholder="Enter location"]');
    await tab.type('input.suggestor-input[placeholder="Enter location"]', location, { delay: 100 });

    await tab.waitForSelector('button.nI-gNb-sb__icon-wrapper');
    await tab.click('button.nI-gNb-sb__icon-wrapper');

    // Wait for job listings to appear
    await tab.waitForSelector('div.srp-jobtuple-wrapper', { visible: true });

    // Grab job elements by class
    const jobDivs = await tab.$$('.cust-job-tuple.layout-wrapper.lay-2.sjw__tuple');

    for (let i = 0; i < Math.min(10, jobDivs.length); i++) {
        const jobDiv = jobDivs[i];
        
        // Click on the job listing
        await jobDiv.click();

        // Wait for the job details page to load
        await tab.waitForTimeout(2000); // Adjust the timeout as needed

        // Check for the Apply button and click it if available
        try {
            // Wait for Apply button and click if it exists
            await tab.waitForSelector('#apply-button', { visible: true, timeout: 5000 });
            await tab.click('#apply-button');
            console.log(`Clicked Apply button for job ${i + 1}`);
        } catch (error) {
            console.log(`Apply button not found for job ${i + 1}, trying Company Site button...`);
            try {
                // Wait for Company Site button and click if it exists
                await tab.waitForSelector('#company-site-button', { visible: true, timeout: 5000 });
                await tab.click('#company-site-button');
                console.log(`Clicked Company Site button for job ${i + 1}`);
            } catch (error) {
                console.log(`Company Site button not found for job ${i + 1}`);
            }
        }

        // Wait for some time to allow the apply process to begin or show a confirmation
        await tab.waitForTimeout(3000); // Adjust the timeout as needed

        // After clicking apply, go back to the job listings page
        await tab.goBack();

        // Wait for job listings to be visible again
        await tab.waitForSelector('div.srp-jobtuple-wrapper', { visible: true });

        // Refresh the jobDivs in case the DOM has changed
        jobDivs = await tab.$$('.cust-job-tuple.layout-wrapper.lay-2.sjw__tuple');
    }

    // Keep the browser open for user interaction
    // await browser.close(); // Keep the browser open
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
