const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config();

const app = express();

app.use(express.json());

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // Add any necessary options here
        });
        console.log('Database Connected');
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

const User = require('./models/login'); // Correct the path to the User model

main();
const port = process.env.PORT || 9000;

app.get('/mobileNumber/:mobileNumber', async (req, res) => {
    try {
        const user = await User.findOne({ mobileNumber: req.params.mobileNumber });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user.mobileNumber);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/login', async (req, res) => {
    const { mobileNumber, password } = req.query;
    try {
        const existingUser = await User.findOne({ mobileNumber });
        if (!existingUser) {
            return res.status(404).send('User not found');
        }

        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordMatch) {
            return res.status(400).send('Invalid password');
        }

        res.status(200).send('Login successful');
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/login', async (req, res) => {
    const { mobileNumber, password } = req.body;
    try {
        const existing = await User
            .findOne({ mobileNumber })
            .select('password')
            .exec();
        if (!existing) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isPasswordMatch = await bcrypt.compare(password, existing.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }

        res.status(200).json({ success: true, message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal server error', error: err });
    }
});

app.post('/register', async (req, res) => {
    const { mobileNumber, password } = req.body;
    try {
        const existingUser = await User.findOne({ mobileNumber });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ ...req.body, password: hashedPassword });
        await user.save();
        res.status(201).send(user);
    } catch (err) {
        res.status(500).send(err);
    }
});

const login = async (mobileNumber, password) => {
    const response = await fetch('http://localhost:9000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mobileNumber, password })
    });

    const data = await response.json();
    if (response.ok) {
        console.log('Login successful:', data);
    } else {
        console.error('Login failed:', data);
    }
};

// Example usage:
//login('1234567890', 'yourpassword');

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port http://localhost:${port}`);
});

// <------------------- Complaints ------------------->

const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 5000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'));
        }
        cb(undefined, true);
    }
});
const Complaint = require('./models/complaint');

app.post('/complaint', upload.single('image'), async (req, res) => {
    const complaint = new Complaint({
        ...req.body,
        image: req.file.buffer
    });
    try {
        await complaint.save();
        res.status(201).send(complaint);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get('/complaint/:mobileNumber', async (req, res) => {
    try {
        const complaints = await Complaint.find({ mobileNumber: req.params.mobileNumber });
        if (!complaints) {
            return res.status(404).send('Complaints not found');
        }
        res.send(complaints);
    } catch (err) {
        res.status(500).send(err);
    }
});
