const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000; 



// Logging Middleware
app.use((req, res, next) => {
    const logDetails = `${new Date().toISOString()} - Method: ${req.method} - Route: ${req.url}\n`;
    
    console.log(`Incoming Request -> Method: ${req.method}, Route: ${req.url}`);
    
    fs.appendFile(path.join(__dirname, 'requests.log'), logDetails, (err) => {
        if (err) console.error("Failed to write to log file");
    });
    
    next();
});

// Middleware to parse incoming form data 
app.use(express.urlencoded({ extended: true }));

// Routes

app.get('/', (req, res) => {
    res.send("Welcome to the Express Server!");
});


app.get('/about', (req, res) => {
    res.send("This is the About page.");
});


app.get('/contact', (req, res) => {
    res.send("Contact us at contact@domain.com");
});


app.get('/greet', (req, res) => {
    const name = req.query.name;
    if (name) {
        res.send(`Hello, ${name}!`); 
    } else {
        res.send("Hello, Stranger!"); 
    }
});


app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Form Submission 
app.post('/submit', (req, res) => {
    const { name, email } = req.body;
    res.send(`Form submitted! Name: ${name}, Email: ${email}`); 
});

// Error Handling

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "An unexpected error occurred on the server." }); // JSON response [cite: 27]
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});