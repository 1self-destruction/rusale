FROM node:18
# Создаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json в контейнер
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы из текущей директории в рабочую директорию в контейнере
COPY . .

# Собираем приложение React
RUN npm run build

# Указываем порт, на котором будет работать приложение
EXPOSE 3000

# Запускаем приложение при запуске контейнера
CMD ["npm", "start"]