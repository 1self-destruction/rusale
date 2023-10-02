import React, { useState, useEffect, useCallback } from 'react';
import './ProductList.css';
import ProductItem from '../ProductItem/ProductItem';
import { useTelegram } from '../../hooks/useTelegram';

const API_URL = 'https://ru-testsale.ru/api';

const ProductList = ({ searchQuery, addedItems, cartItems, updateCart, selectedCategory, openProductModal }) => {
  const { tg, queryId, user } = useTelegram();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Ошибка при загрузке продуктов:', error);
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const onSendData = () => {
      if (isCreatingOrder) {
        const data = {
          products: addedItems,
          totalPrice: addedItems.reduce((acc, item) => acc + item.price, 0),
          queryId,
          userId: user?.username,
        };
        fetch(`${API_URL}/web-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
          .then(() => console.log('data sent'))
          .catch((error) => console.error('Ошибка при отправке данных:', error));
      } else {
        setIsCreatingOrder(true);
        tg.MainButton.setParams({
          text: 'Создать заказ?',
        });
      }
    };

    tg.onEvent('mainButtonClicked', onSendData);
    return () => {
      tg.offEvent('mainButtonClicked', onSendData);
    };
  }, [isCreatingOrder, addedItems, queryId, user?.username, tg]);

  const onAdd = (product) => {
    const alreadyAdded = addedItems.some((item) => item.id === product.id);
    const newItems = alreadyAdded
      ? addedItems.filter((item) => item.id !== product.id)
      : [...addedItems, product];

    updateCart(newItems);

    if (newItems.length === 0) {
      tg.MainButton.hide();
    } else {
      tg.MainButton.show();
      tg.MainButton.setParams({
        text: `Купить ${newItems.reduce((acc, item) => acc + item.price, 0)}`,
      });
    }

    setIsCreatingOrder(false);
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      tg.MainButton.hide();
    } else {
      tg.MainButton.show();
      tg.MainButton.setParams({
        text: `Купить ${cartItems.reduce((acc, item) => acc + item.price, 0)}`,
      });
    }
  }, [cartItems, tg.MainButton]);

  useEffect(() => {
    console.log('searchQuery:', searchQuery);
    console.log('selectedCategory:', selectedCategory);
  
    const filteredProducts = products.filter((product) => {
      const isMatchingTitle = product.title.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedCategory === '') {
          return isMatchingTitle;
      } else {
          const isMatchingTag = Array.isArray(product.tags)
              ? product.tags.includes(selectedCategory.toLowerCase())
              : product.tags === selectedCategory.toLowerCase();
          return isMatchingTitle && isMatchingTag;
      }
  });

  setFilteredProducts(filteredProducts);
}, [searchQuery, selectedCategory, products]);
  

return (
  <div className={'list'}>
    {filteredProducts
      .sort((a, b) => b.id - a.id)
      .map((item) => (
        <ProductItem
          product={item}
          onAdd={onAdd}
          className={'item'}
          key={item.id}
          isInCart={addedItems.some((addedItem) => addedItem.id === item.id)}
          openModal={openProductModal}
        />
      ))}
  </div>
);
};

export default ProductList;
