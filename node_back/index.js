const { getProducts, addProduct, deleteProductById, deleteAllProducts, updateProductById } = require('./db');
const { addOrder, getOrders, deleteOrderById, updateOrderStatus, getOrdersByUserId, isUserAuthorizedForOrder } = require('./order_db');

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config({ path: '.env' });
const winston = require('winston');

const token = dotenv.parsed.TOKEN;
const webAppUrl = dotenv.parsed.WEB_APP_URL;
const PORT = dotenv.parsed.PORT;

const bot = new TelegramBot(token, { polling: true });

const app = express();

const corsOptions = {
  origin: [
    'https://master--enchanting-fox-9cc04d.netlify.app',
    'https://enchanting-fox-9cc04d.netlify.app',
    'http://localhost',
    'http://193.57.138.13',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
};
function corsWrapper(handler) {
  return (req, res) => {
    const origin = req.headers.origin;

    // Проверяем, что origin соответствует вашим настройкам CORS
    if (corsOptions.origin.indexOf(origin) !== -1) {
      handler(req, res); // Выполняем обработчик, если CORS прошел проверку
    } else {
      // Если origin не соответствует настройкам CORS, возвращаем ошибку CORS
      res.status(403).json({ error: 'Not authorized' });
    }
  };
}

app.use(cors(corsOptions));
app.use(express.json());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(), // Добавляем временную метку
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(403).json({ error: 'Недопустимый источник запроса' });
  } else {
    next(err);
  }
});

// Добавляем middleware для логгирования запросов
app.use((req, res, next) => {
  const now = new Date();
  now.setHours(now.getHours() + 3); // Добавляем 3 часа к текущей дате и времени
  const logMessage = `${now.toISOString()} ${req.method} ${req.url}`;
  logger.info(logMessage);
  next();
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Заходи в наш интернет магазин.');
    await bot.sendMessage(chatId, '/help - помощь');
  }

  if (text === '/help') {
    await bot.sendMessage(chatId, 'Добавить товары к корзину и сделать заказ можно через приложение');
    await bot.sendMessage(chatId, 'В течении 5 минут после создания заказа с вами свяжется наш менеджер');
    await bot.sendMessage(chatId, '/orders - показать текущие заказы');
    await bot.sendMessage(chatId, '/delete 1 - отменить заказ по ID');
    await bot.sendMessage(chatId, '/help - помощь');
  }


  if (text === '/orders') {
    const nickname = msg.from.username || 'Ник не указан'; // Если ник не установлен, используется фраза "Ник не указан"

    // Получаем заказы пользователя из базы данных
    getOrdersByUserId(nickname, (err, orders) => {
      if (err) {
        console.error('Error getting orders:', err);
        bot.sendMessage(chatId, 'Произошла ошибка при получении заказов.');
      } else {
        // Создаем сообщение с информацией о заказах
        let message = `Заказы пользователя ${nickname}:\n\n`;

        // Если нет заказов, добавляем сообщение о их отсутствии
        if (orders.length === 0) {
          message += 'Заказов еще нет.';
        } else {
          // Добавляем информацию о каждом заказе
          orders.forEach((order) => {
            message += `ID${order.id} ${order.totalPrice}₽ Статус: ${order.status}\n`;
          });
        }

        // Отправляем сообщение с информацией о заказах
        bot.sendMessage(chatId, message);
        
      }
      
    });
  }

  if (text === '/delete') {
    bot.sendMessage(chatId, 'Добавьте номер заказа');
  }

  // if (text.startsWith('/delete ')) {
  //   const nickname = msg.from.username
  //   const parts = text.split(' ');
  //   if (parts.length === 2 && parts[0] === '/delete') {
  //     const orderId = parseInt(parts[1]); // Преобразуем текст в число
  
  //     // Проверяем, совпадает ли ник пользователя с ником в заказе
  //     isUserAuthorizedForOrder(nickname, orderId, (err, isAuthorized) => {
  //       if (err) {
  //         logger.error('Error checking user authorization:', err);
  //         bot.sendMessage(chatId, 'Ошибка. Обратитесь в поддержку');
  //       } else {
  //         if (isAuthorized) {
  //           // Обновляем статус заказа на "Cancelled"
  //           updateOrderStatus(orderId, 'Cancelled', (err) => {
  //             if (err) {
  //               logger.error('Error updating order status:', err);
  //               bot.sendMessage(chatId, 'Ошибка. Обратитесь в поддержку');
  //             } else {
  //               bot.sendMessage(chatId, `Заказ #${orderId} успешно отменен.`);
  //             }
  //           });
  //         } else {
  //           bot.sendMessage(chatId, 'Ошибка. Обратитесь в поддержку');
  //         }
  //       }
  //     });
  //   } else {
  //     bot.sendMessage(chatId, 'Неверный формат команды. Используйте: /delete <номер заказа>');
  //   }
  // }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      console.log(data);

      const order = {
        userId: chatId,
        products: [],
        totalPrice: 0,
      };

      await addOrder(order, (err) => {
        if (err) {
          const errorMessage = `Error adding order: ${err}`;
          logger.error(errorMessage);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const username1 = dotenv.parsed.NGL;
  const pswd2 = dotenv.parsed.WPSD;

  if (username === username1 && password === pswd2) {
    res.json({ token, user: { username } });
  } else {
    // Если аутентификация не удалась, отправьте ошибку
    res.status(401).json({ error: 'Аутентификация не удалась'});
    logger.info(req.body);
  }
});

app.put('/api/products/:id', corsWrapper((req, res) => {
  const productId = req.params.id;
  const updatedProduct = req.body;

  updateProductById(productId, updatedProduct, (err) => {
    if (err) {
      const errorMessage = `Error updating product with ID ${productId}: ${err}`;
      logger.error(errorMessage);
      res.status(500).json({ error: 'Error updating product' });
    } else {
      const successMessage = `Product with ID ${productId} updated successfully`;
      logger.info(successMessage);
      res.json({ message: successMessage });
    }
  });
}));

app.put('/api/orders/:id/status', (req, res) => {
  const orderId = req.params.id;
  const newStatus = req.body.status;

  updateOrderStatus(orderId, newStatus, (err) => {
    if (err) {
      const errorMessage = `Error updating order status for order with ID ${orderId}: ${err}`;
      logger.error(errorMessage);
      res.status(500).json({ error: 'Error updating order status' });
    } else {
      const successMessage = `Order status for order with ID ${orderId} updated successfully`;
      logger.info(successMessage);
      res.json({ message: successMessage });
    }
  });
});

app.delete('/api/orders/:id', corsWrapper((req, res) => {
  const orderId = req.params.id;

  deleteOrderById(orderId, (err) => {
    if (err) {
      const errorMessage = `Error deleting order with ID ${orderId}: ${err}`;
      logger.error(errorMessage);
      res.status(500).json({ error: 'Error deleting order' });
    } else {
      const successMessage = `Order with ID ${orderId} deleted successfully`;
      logger.info(successMessage);
      res.json({ message: successMessage });
    }
  });
}));

app.get('/api/orders', corsWrapper((req, res) => {
  getOrders((err, orders) => {
    if (err) {
      const errorMessage = `Error getting orders: ${err}`;
      logger.error(errorMessage);
      res.status(500).json({ error: 'Error getting orders' });
    } else {
      const ordersWithoutImg = orders.map((order) => {
        const { img, ...orderWithoutImg } = order;
        return orderWithoutImg;
      });

      logger.info('Orders retrieved successfully');
      res.json(ordersWithoutImg);
    }
  });
}));

app.delete('/api/harderace', corsWrapper((req, res) => {
  deleteAllProducts((err) => {
    if (err) {
      const errorMessage = `Error deleting all products: ${err}`;
      logger.error(errorMessage);
      res.status(500).json({ error: 'Error deleting all products' });
    } else {
      const successMessage = 'All products deleted successfully';
      logger.info(successMessage);
      res.json({ message: successMessage });
    }
  });
}));

app.delete('/api/products/:id', corsWrapper((req, res) => {
  const productId = req.params.id;

  deleteProductById(productId, (err) => {
    if (err) {
      const errorMessage = `Error deleting product with ID ${productId}: ${err}`;
      logger.error(errorMessage);
      res.status(500).json({ error: 'Error deleting product' });
    } else {
      const successMessage = `Product with ID ${productId} deleted successfully`;
      logger.info(successMessage);
      res.json({ message: successMessage });
    }
  });
}));

app.post('/api/products', corsWrapper((req, res) => {
  const newProduct = req.body;

  addProduct(newProduct, (err) => {
    if (err) {
      const errorMessage = `Error adding product: ${err}`;
      logger.error(errorMessage);
      res.status(500).json({ error: 'Error adding product' });
    } else {
      const successMessage = 'Product added successfully';
      logger.info(successMessage);
      res.status(201).json({ message: successMessage });
    }
  });
}));

app.get('/api/products', (req, res) => {
  getProducts((err, products) => {
    if (err) {
      const errorMessage = `Error getting products: ${err}`;
      logger.error(errorMessage);
      res.status(500).json({ error: 'Error getting products' });
    } else {
      res.json(products);
    }
  });
});

app.post('/api/web-data', async (req, res) => {
  const { queryId, products = [], totalPrice, userId } = req.body;

  const order = {
    userId: userId,
    products: products,
    totalPrice: totalPrice,
  };

  await addOrder(order, async (err) => {
    if (err) {
      const errorMessage = `Error adding order: ${err}`;
      logger.error(errorMessage);
    } else {
      // Определяем информацию для отправки сообщения
      const botTokenAlarm = '6316465274:AAF9Tm5rAVwTTVaoO4SjgqqCTdluM1o-IWI';
      const chatIdAlarm = '452009220'; // Замените на реальный ID пользователя

      const botTokenAlarm2 = '6316465274:AAF9Tm5rAVwTTVaoO4SjgqqCTdluM1o-IWI';
      const chatIdAlarm2 = '1322724442'; // Замените на реальный ID пользователя
  
      try {
        const bot = new TelegramBot(botTokenAlarm);
        await bot.sendMessage(chatIdAlarm, `Новый заказ от пользователя ${userId} на сумму ${totalPrice}`);
        const bot2 = new TelegramBot(botTokenAlarm2);
        await bot2.sendMessage(chatIdAlarm2, `Новый заказ от пользователя ${userId} на сумму ${totalPrice}`);
      } catch (e) {
        console.error(`Ошибка отправки уведомления: ${e.message}`);
      }
    }
  });

  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: {
        message_text: ` Поздравляю с покупкой, в ближайшее время с вами свяжется менеджер https://t.me/ruussx. Вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
      }
    });
    return res.status(200).json({});
  } catch (e) {
    return res.status(500).json({})
  }
});

app.listen(PORT, () => console.log('Rocket launched on ' + PORT));