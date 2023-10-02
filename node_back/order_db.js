const sqlite3 = require('sqlite3').verbose();

// Создаем подключение к базе данных (если файла с базой не существует, он будет создан автоматически)
const db = new sqlite3.Database('orders.db');

// Создаем таблицу "orders" (если она не существует)
db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productsId TEXT,
        productsName TEXT,
        productsSize TEXT,
        totalPrice INTEGER,
        status TEXT
      )
    `);
  });
  

// Функция для сохранения заказа в базу данных
function addOrder(order, callback) {
  const { userId, products, totalPrice } = order;
  const productsId = products.map(product => product.id).join(',');
  const productsName = products.map(product => product.title, ).join(',');
  const productsSize = products.map(product => product.size).join(',');
  const status = 'Created';

  db.run(
    'INSERT INTO orders (userId, productsId, productsName, productsSize, totalPrice, status) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, productsId, productsName, productsSize, totalPrice, status],
    (err) => {
      if (err) {
        console.error('Error adding order:', err);
        callback(err);
      } else {
        console.log('Order added successfully');
        callback(null);
      }
    }
  );
}
function getOrdersByUserId(userId, callback) {
  // Получаем заказы пользователя из базы данных
  db.all('SELECT * FROM orders WHERE userId = ?', userId, (err, userOrders) => {
    if (err) {
      callback(err, []);
    } else {
      // Форматируем информацию о заказах
      const formattedOrders = userOrders.map(order => {
        return {
          id: order.id,
          userId: order.userId,
          productsId: order.productsId,
          productsName: order.productsName,
          productsSize: order.productsSize,
          totalPrice: order.totalPrice,
          status: order.status
        };
      });

      callback(null, formattedOrders);
    }
  });
}
function getOrders(callback) {
  db.all('SELECT * FROM orders', (err, orders) => {
    if (err) {
      console.error('Error getting orders:', err);
      callback(err, null);
    } else {
      // Преобразуем данные заказов
      const formattedOrders = orders.map(order => {
        const productNames = order.productsName.split(','); // Разбиваем названия на массив
        const productSizes = order.productsSize.split(','); // Разбиваем размеры на массив

        // Создаем массив из названий и размеров продуктов, учитывая порядок
        const combinedProducts = productNames.map((name, index) => {
          return `${name.trim()} - ${productSizes[index].trim()}`;
        });

        return {
          id: order.id,
          userId: order.userId,
          productsId: order.productsId,
          productsName: combinedProducts.join(', '), // Объединяем массив в строку
          totalPrice: order.totalPrice,
          status: order.status,
        };
      });

      callback(null, formattedOrders);
    }
  });
}

  function deleteOrderById(orderId, callback) {
    db.run('DELETE FROM orders WHERE id = ?', orderId, (err) => {
      if (err) {
        console.error('Error deleting order:', err);
        callback(err);
      } else {
        console.log('Order deleted successfully');
        callback(null);
      }
    });
  }

  function updateOrderStatus(orderId, newStatus, callback) {
    // Проверяем, существует ли заказ с указанным orderId
    db.get('SELECT id FROM orders WHERE id = ?', orderId, (err, existingOrder) => {
      if (err) {
        console.error('Error checking order existence:', err);
        callback(err);
      } else {
        if (existingOrder) {
          // Заказ существует, поэтому обновляем его статус
          db.run('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId], (err) => {
            if (err) {
              console.error('Error updating order status:', err);
              callback(err);
            } else {
              console.log('Order status updated successfully');
              callback(null);
            }
          });
        } else {
          // Заказ с указанным orderId не найден
          const notFoundError = new Error(`Order with ID ${orderId} not found.`);
          callback(notFoundError);
        }
      }
    });
  }
  function isUserAuthorizedForOrder(userId, orderId, callback) {
    db.get('SELECT userId FROM orders WHERE id = ?', orderId, (err, order) => {
      if (err) {
        console.error('Error checking order user:', err);
        callback(err, false);
      } else {
        if (order && order.userId === userId) {
          // Ник совпадает с ником в заказе
          callback(null, true);
        } else {
          // Ник не совпадает с ником в заказе или заказ не найден
          callback(null, false);
        }
      }
    });
  }
  module.exports = {
    deleteOrderById,
    addOrder,
    getOrders,
    updateOrderStatus,
    getOrdersByUserId,
    isUserAuthorizedForOrder,
  };