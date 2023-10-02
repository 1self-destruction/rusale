// Cart.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';
import './Cart.css';
import { FaTimes, FaShoppingCart } from 'react-icons/fa';

const Cart = ({ addedItems, onClose, updateCart }) => {
  const handleRemoveFromCart = (itemId) => {
    const newCart = addedItems.filter(item => item.id !== itemId);
    updateCart(newCart); // Обновляем состояние корзины в ProductList
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2 className='CartButton'><FaShoppingCart /></h2>
        <button onClick={onClose} className="close-button"> <FaTimes /></button>
      </div>
      {addedItems.length === 0 ? (
        <div className="empty-cart-message"><div className='empty-cart-messageText'>Добавьте товары в корзину</div>.</div>
      ) : (
        <div className="cart-items-container">
          <ul className="cart-items">
            {addedItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item-thumbnail">
                  <img src={item.img} alt={item.title} />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-title">
                    <strong>{item.title}</strong>
                  </div>
                  <div className="cart-item-size">
                    <em>Size: {item.size}</em>
                  </div>
                  <div className="cart-item-price">
                    <strong className='priceCart'>{item.price}₽</strong>
                  </div>
                </div>
                <div className="cart-item-remove">
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Cart;
