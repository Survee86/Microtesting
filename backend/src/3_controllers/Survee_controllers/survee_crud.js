export const create_survee = (req, res) => {
    let suervee_card;
    // TODO: реализовать создание опроса
    return suervee_card;
}

export const read_survee = async (req, res) => {
    console.log('[/api/surveys/read] Request received');
    try {
        const mockSurveys = generateMockSurveys();
        
        console.log('Generated mock surveys:', mockSurveys);
        
        // Возвращаем просто массив опросов без обёртки
        res.status(200).json(mockSurveys);
        
    } catch (error) {
        console.error('Error in read_survee:', error);
        // В случае ошибки возвращаем пустой массив
        res.status(500).json([]);
    }
};

// Функция генерации моковых данных (без изменений)
function generateMockSurveys() {
    const mockTitles = [
        "Оценка качества обслуживания",
        "Удовлетворенность продуктом",
        "Опрос для сотрудников",
        "Исследование рынка",
        "Обратная связь о мероприятии"
    ];
    
    const mockAuthors = [
        "Иванов И.И.",
        "Петрова А.С.",
        "Сидоров В.В.",
        "Кузнецова О.П.",
        "Администратор"
    ];
    
    const mockStatuses = ["Черновик", "Активный", "Завершен", "Архив"];
    const mockVisibility = ["Публичный", "Приватный", "По ссылке"];
    
    return Array.from({ length: 5 }, (_, i) => ({
        _id: `mock-id-${i + 1}-${Date.now()}`,
        title: mockTitles[i % mockTitles.length],
        author: mockAuthors[i % mockAuthors.length],
        status: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
        visibility: mockVisibility[Math.floor(Math.random() * mockVisibility.length)],
        sentCount: Math.floor(Math.random() * 100),
        completedCount: Math.floor(Math.random() * 50),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date(),
        questions: generateMockQuestions(),
        __v: 0
    }));
}

// Генерация моковых вопросов для опроса (без изменений)
function generateMockQuestions() {
    const questionTypes = ["text", "radio", "checkbox", "range"];
    const mockQuestions = [
        "Как вы оцениваете наше обслуживание?",
        "Что вам понравилось больше всего?",
        "Порекомендуете ли вы нас друзьям?",
        "Оцените качество продукта по шкале от 1 до 10",
        "Ваши предложения по улучшению"
    ];
    
    return Array.from({ length: 3 }, (_, i) => ({
        _id: `question-id-${i + 1}-${Date.now()}`,
        text: mockQuestions[i % mockQuestions.length],
        type: questionTypes[Math.floor(Math.random() * questionTypes.length)],
        options: i % 2 === 0 ? ["Да", "Нет", "Затрудняюсь ответить"] : [],
        required: Math.random() > 0.5
    }));
}

export const update_survee = (req, res) => {
    let suervee_card;
    // TODO: реализовать обновление опроса
    return suervee_card;
}

export const delete_survee = (req, res) => {
    let suervee_card;
    // TODO: реализовать удаление опроса
    return suervee_card;
}