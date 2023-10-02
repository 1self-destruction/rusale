import React, { useState, useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import Header from './components/Header/Header';
import { Route, Routes } from 'react-router-dom';
import ProductList from './components/ProductList/ProductList';
import SearchBar from './components/SearchBar/SearchBar';
import Cart from './components/Cart/Cart';
import ProductModal from './components/ProductModal/ProductModal';

function App() {
  const { onToggleButton, tg } = useTelegram();
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    tg.ready();
  }, []);

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };
  
  const performSearch = (query, category) => {
    setSearchQuery(query);
    setSelectedCategory(category);
  };

  const updateCart = (newCartItems) => {
    setAddedItems(newCartItems);
    setCartItems(newCartItems);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  return (
    <div className="App">
      <Header />
      <SearchBar
        onSearch={performSearch}
        cartItems={cartItems}
        openCart={openCart}
      />
      <Routes>
        <Route
          index
          element={
            <ProductList
              searchQuery={searchQuery}
              addedItems={addedItems}
              cartItems={cartItems}
              updateCart={updateCart}
              openCart={openCart}
              openProductModal={openProductModal}
              selectedCategory={selectedCategory}
            />
          }
        />
      </Routes>
      {isCartOpen && <Cart addedItems={addedItems} onClose={closeCart} updateCart={updateCart} />}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={closeProductModal} />
      )}
    </div>
  );
}

export default App;
