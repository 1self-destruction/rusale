import React, { useState, useEffect } from 'react';
import Button from "../Button/Button";
import { useTelegram } from "../../hooks/useTelegram";
import './Header.css';

const Header = () => {
    const { user, onClose } = useTelegram();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Проверяем, сколько прокрутили от верха страницы
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
        <div className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="right-content">
                <div className="logo-container">
                    <img
                        src="https://sun9-65.userapi.com/impg/rEFmAvJiFhiObx0sfeRQ3XKEtcEs9DEZaJoEvQ/eoquAd6Gknk.jpg?size=1000x166&quality=95&sign=47c89a8fed82b5ef1a449abe12ae1a33&type=album"
                        alt="Логотип"
                        className={'logo'}
                    />
                </div>

            </div>
        </div>
    );
};

export default Header;