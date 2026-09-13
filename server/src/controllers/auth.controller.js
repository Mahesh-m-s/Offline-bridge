const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'offlinebridge_super_secure_jwt_secret_key_rural_services_2026';

const AuthController = {
  async register(req, res, next) {
    try {
      const { name, phone, password, role } = req.body;

      if (!name || !phone || !password) {
        return res.status(400).json({ success: false, message: 'Name, phone, and password are required.' });
      }

      if (phone.length < 10) {
        return res.status(400).json({ success: false, message: 'Phone number must be at least 10 digits.' });
      }

      const existing = await UserModel.findByPhone(phone);
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this phone number already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await UserModel.create({
        name,
        phone,
        passwordHash,
        role: role || 'citizen'
      });

      const token = jwt.sign(
        { id: user.id, name: user.name, phone: user.phone, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ success: false, message: 'Phone and password are required.' });
      }

      const user = await UserModel.findByPhone(phone);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, phone: user.phone, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
      });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
