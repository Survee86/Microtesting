import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/user.js';
import {generateTokens} from '../utils/jwt.js'

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Проверка существования пользователя
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя
    const user = await createUser({
      email,
      password: hashedPassword,
      name
    });

    // Генерация токена
    const token = generateTokens(user.id);

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Генерация токена
    const token = generateToken(user.id);

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};