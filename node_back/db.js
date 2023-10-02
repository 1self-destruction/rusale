const sqlite3 = require('sqlite3').verbose();

// Создаем подключение к базе данных (если файла с базой не существует, он будет создан автоматически)
const db = new sqlite3.Database('products.db');

// Создаем таблицу "products" (если она не существует)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      img TEXT,
      title TEXT,
      price INTEGER,
      description TEXT,
      size TEXT,
      tags TEXT
    )
  `);
});

// Функция для добавления нового продукта в базу данных
function addProduct(product, callback) {
  const { img, title, price, description, size, tags } = product;
  let sizeString = '';
  let tagsString = '';

  if (Array.isArray(size)) {
    sizeString = size.join(', '); // Преобразование массива размеров в строку
  } else if (typeof size === 'string') {
    sizeString = size; // Если size - строка, оставляем ее без изменений
  }
  if (Array.isArray(tags)) {
    tagsString = tags.join(', '); // Преобразование массива размеров в строку
  } else if (typeof tags === 'string') {
    tagsString = tags; // Если tags - строка, оставляем ее без изменений
  }
  db.run(
    'INSERT INTO products (img, title, price, description, size, tags) VALUES (?, ?, ?, ?, ?, ?)',
    [img, title, price, description, sizeString, tagsString],
    (err) => {
      if (err) {
        console.error('Error adding product:', err);
        callback(err);
      } else {
        console.log('Product added successfully');
        callback(null);
      }
    }
  );
}
// Функция для получения списка всех продуктов
function getProducts(callback) {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      console.error('Error getting products:', err);
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}
// Функция для удаления продукта по ID
function deleteProductById(id, callback) {
    db.run('DELETE FROM products WHERE id = ?', id, (err) => {
      if (err) {
        console.error('Error deleting product:', err);
        callback(err);
      } else {
        console.log('Product deleted successfully');
        callback(null);
      }
    });
  }
  // Функция для удаления всех продуктов и сброса автоинкрементного счетчика
function deleteAllProducts(callback) {
    db.serialize(() => {
        db.run('DELETE FROM products', (err) => {
            if (err) {
                console.error('Error deleting all products:', err);
                callback(err);
            } else {
                // Сброс автоинкрементного счетчика
                db.run('DELETE FROM sqlite_sequence WHERE name="products"', (err) => {
                    if (err) {
                        console.error('Error resetting autoincrement:', err);
                        callback(err);
                    } else {
                        console.log('All products deleted and autoincrement reset successfully');
                        callback(null);
                    }
                });
            }
        });
    });
}

function updateProductById(id, updatedProduct, callback) {
  const { img, title, price, description, size, tags } = updatedProduct;
  let sizeString = '';
  let tagsString = '';

  if (Array.isArray(size)) {
    sizeString = size.join(', '); // Преобразование массива размеров в строку
  } else if (typeof size === 'string') {
    sizeString = size; // Если size - строка, оставляем ее без изменений
  }

  if (Array.isArray(tags)) {
    tagsString = tags.join(', '); // Преобразование массива размеров в строку
  } else if (typeof tags === 'string') {
    tagsString = tags; // Если tags - строка, оставляем ее без изменений
  }
  
  db.run(
    'UPDATE products SET img = ?, title = ?, price = ?, description = ?, size = ?, tags = ? WHERE id = ?',
    [img, title, price, description, sizeString, tagsString, id],
    (err) => {
      if (err) {
        console.error('Error updating product:', err);
        callback(err);
      } else {
        console.log('Product updated successfully');
        callback(null);
      }
    }
  );
}

module.exports = { addProduct, getProducts, deleteProductById, deleteAllProducts, updateProductById, updateProductById};
