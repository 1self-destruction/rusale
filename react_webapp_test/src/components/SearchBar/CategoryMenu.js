import React from 'react';
import './CategoryMenu.css';

const CategoryMenu = ({ isOpen, selectedCategory, onCategorySelect, onSearchByTag }) => {
    const categories = [
        { label: 'Все', tag: '' },
        { label: 'Футболки', tag: 'tee' },
        { label: 'Штаны', tag: 'pants' },
        { label: 'Худи', tag: 'hoodie' },
        { label: 'Свитера', tag: 'sweater' },
        { label: 'Куртки', tag: 'jacket' },
        { label: 'Обувь', tag: 'shoes'},
        { label: 'Аксессуары', tag: 'accs'},
        { label: 'Головные уборы', tag: 'head'},
        { label: 'Предзаказ', tag: 'preorder'},
    ];

    if (!isOpen) {
        return null;
    }

    const handleCategoryClick = (category) => {
      onCategorySelect(category.tag.toLowerCase());
      onSearchByTag(category.tag.toLowerCase());
  };
    
    return (
        <div className="category-menu">
            {categories.map((category, index) => (
                <button
                    key={index}
                    className={`category-item ${selectedCategory === category.label ? 'selected' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                >
                    {category.label}
                </button>
            ))}
        </div>
    );
};

export default CategoryMenu;
