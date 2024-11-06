# Используем официальный образ Node.js
FROM node:18

# Рабочая директория
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Копируем весь проект
COPY . ./

# Запускаем приложение
CMD ["npm", "start"]

# Открываем порт
EXPOSE 3000