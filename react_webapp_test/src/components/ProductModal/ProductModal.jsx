import React from 'react';
import './ProductModal.css';

function ProductModal({ product, isOpen, onClose }) {
  const modalClassName = isOpen ? 'product-modal open' : 'product-modal';

  return (
    <div className={modalClassName}>
      <span className="close" onClick={onClose}>
        Вернуться в главное меню
      </span>
      <h1 className='text_modal'>{product.title}</h1>
      <img src={product.img} alt={product.title} className="product-image" />
      <p className='description'>{product.description}</p>
    </div>
    
  );
}

export default ProductModal;