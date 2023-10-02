import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import { FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa';
import CategoryMenu from './CategoryMenu';

const SearchBar = ({ onSearch, cartItems, openCart }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleInputChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        onSearch(query, selectedCategory);
    };

    const handleClearClick = () => {
        setSearchQuery('');
        onSearch('', selectedCategory);
    };

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`search-bar ${isScrolled ? 'scrolled' : ''}`}>
            <button
                className="menu-button"
                onClick={handleMenuClick}
            >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
            <div className="search-input-container">
                <input
                    type="search"
                    placeholder="Поиск по названию"
                    value={searchQuery}
                    onChange={handleInputChange}
                    className="search-input"
                />
            </div>
            <button onClick={openCart} className="cart-button">
                <FaShoppingCart /> ({cartItems.length})
            </button>
            <CategoryMenu
                isOpen={isMenuOpen}
                selectedCategory={selectedCategory}
                onCategorySelect={(category) => setSelectedCategory(category)}
                onSearchByTag={(tag) => onSearch(searchQuery, tag)}
            />
        </div>
    );
};

export default SearchBar;