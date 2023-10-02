import React, { useState } from 'react';
import Button from '../Button/Button';
import './ProductItem.css';
import { FaShoppingCart } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';

const ProductItem = ({ product, className, onAdd, isInCart, openModal }) => {
  const [selectedSize, setSelectedSize] = useState(null);

  const toggleSize = (size) => {
    if (selectedSize === size) {
      setSelectedSize(null);
    } else {
      setSelectedSize(size);
    }
  };

  const onAddHandler = () => {
    if (selectedSize === null) {
      alert('Пожалуйста, выберите размер');
    } else {
      onAdd({ ...product, size: selectedSize });
      setSelectedSize(null);
    }
  };

  const availableSizes = product.size.split(',').map((size) => size.trim());

  const isOnSale = product.tags && product.tags.includes('sale');

  return (
    <div className={`product ${className} ${isInCart ? 'in-cart' : ''}`}>
      <img
        className="product-image"
        src={product.img}
        alt={product.title}
        onClick={() => openModal(product)}
        style={{ cursor: 'pointer' }}
      />
      <div className="title">{product.title}</div>
      <div className="price">
      <div className={isOnSale ? 'sale-price' : ''}>
  {isOnSale && <del>{product.price + 3000}</del>}
  {isOnSale ? <br /> : ''}
  {product.price}₽
</div>
      </div>
      <div className="size-buttons">
        {availableSizes.map((size) => (
          <Button
            key={size}
            className={`size-button ${
              selectedSize === size ? 'selected' : ''
            } ${isInCart && selectedSize !== size ? 'in-cart' : ''} ${
              product.size === 'O/S' ? 'disabled-size' : ''
            }`}
            onClick={() => {
              if (product.size !== 'O/S') {
                toggleSize(size);
              }
            }}
            disabled={isInCart && selectedSize !== size}
          >
            <span style={{ textDecoration: product.size === 'O/S' ? 'none' : 'inline' }}>
              {size}
            </span>
          </Button>
        ))}
      </div>
      {isInCart ? (
        <Button className="remove-btn" onClick={() => onAdd({ ...product, size: selectedSize })}>
           <FaTrash />
        </Button>
      ) : (
<Button
  className={`add-btn ${selectedSize !== null || product.size === 'O/S' ? 'red' : ''}`}
  onClick={() => {
    if (product.size.split(',').map((size) => size.trim()).length === 1) {
      onAdd({ ...product, size: product.size.split(',').map((size) => size.trim())[0] });
    } else {
      onAddHandler();
    }
  }}
  disabled={isInCart}
>
  <FaShoppingCart />
</Button>
      )}
    </div>
  );
};

export default ProductItem;
