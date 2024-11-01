# Naukri Automation Project

This project automates the process of logging into Naukri.com, searching for jobs based on a specific job title and location, and applying to available job posts. Built using **Node.js**, **Express**, and **Puppeteer**, the script handles web navigation, job searching, and conditional job application.

## Features

- **Automated Login**: Logs into Naukri.com with provided credentials.
- **Job Search**: Searches for jobs based on user-defined keywords and location.
- **Job Application**: Opens each job post, applies using either the "Apply" or "Company Site" button, and moves to the next listing.
- **Error Handling**: Handles scenarios where buttons are missing or pages fail to load.

## Prerequisites

- **Node.js** and **npm** installed
- A **Naukri.com** account with valid login credentials

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Internshala-Automation.git
   cd Internshala-Automation
