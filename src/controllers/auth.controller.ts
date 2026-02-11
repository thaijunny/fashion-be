import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';
import { generateToken } from '../utils/jwt.js';

const userRepo = () => AppDataSource.getRepository(User);
const GOOGLE_CLIENT_ID = '725448588950-b3mdsmnqj8tj9ttam14c0ajhjk7d4b3j.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;

  try {
    const existingUser = await userRepo().findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = userRepo().create({
      email,
      password: hashedPassword,
      full_name,
      role: req.body.role || 'user',
    });
    await userRepo().save(user);

    const token = generateToken(user.id);

    res.status(201).json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await userRepo().findOneBy({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await userRepo().findOne({
      where: { id: req.user.id },
      select: ['id', 'email', 'full_name', 'role', 'avatar_url'],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  const { credential } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name, picture } = payload;

    // Check if user exists
    let user = await userRepo().findOneBy({ email });

    if (!user) {
      // Create new user from Google profile (no password needed)
      user = userRepo().create({
        email,
        password: '', // Google users have no local password
        full_name: name || '',
        avatar_url: picture || '',
        role: 'user',
      });
      await userRepo().save(user);
    }

    const token = generateToken(user.id);

    res.status(200).json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, avatar_url: user.avatar_url },
      token,
    });
  } catch (error: any) {
    res.status(401).json({ message: 'Google authentication failed', error: error.message });
  }
};
