const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - Direct
mongoose.connect('mongodb+srv://rudraravi121:samsungz12@cluster0.jlpop06.mongodb.net/sparkinvoice?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err.message));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    businessName: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
    email: String,
    phone: String,
    otp: String,
    expiry: Date,
    createdAt: { type: Date, default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);

// OTP Send - Simple
app.post('/api/send-otp', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email is required' 
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        
        // Save to MongoDB
        await OTP.findOneAndUpdate(
            { email: email },
            { email, otp, expiry },
            { upsert: true, new: true }
        );
        
        // Return OTP in response
        res.json({ 
            success: true, 
            message: 'OTP generated successfully',
            otp: otp
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate OTP'
        });
    }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and OTP are required' 
            });
        }
        
        const otpRecord = await OTP.findOne({ email: email });
        
        if (!otpRecord) {
            return res.status(400).json({ 
                success: false, 
                error: 'OTP not found' 
            });
        }
        
        if (new Date() > otpRecord.expiry) {
            await OTP.deleteOne({ email: email });
            return res.status(400).json({ 
                success: false, 
                error: 'OTP expired' 
            });
        }
        
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid OTP' 
            });
        }
        
        await OTP.deleteOne({ email: email });
        
        res.json({ 
            success: true, 
            message: 'OTP verified successfully' 
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Verification failed' 
        });
    }
});

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, businessName, email, phone, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists'
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newUser = new User({
            name,
            businessName,
            email,
            phone,
            password: hashedPassword,
            verified: true
        });
        
        await newUser.save();
        
        res.json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});