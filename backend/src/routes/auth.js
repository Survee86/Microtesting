router.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Проверка существования пользователя
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Создание пользователя
      const user = await User.create({
        name,
        email,
        password: hashedPassword
      });
  
      // Генерация токенов
      const tokens = generateTokens({ userId: user._id });
      
      res.status(201).json(tokens);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });