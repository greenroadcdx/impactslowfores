
import React from 'react';

interface HeaderProps {
    projectTitle: string;
    language: 'vi' | 'en';
    onLanguageToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ projectTitle, language, onLanguageToggle }) => {
    return (
        <header className="bg-green-800 text-white shadow-md">
            <div className="container mx-auto px-4 py-2">
                <div className="flex flex-wrap items-center justify-between">
                    <div className="flex items-center">
                        <img src="https://raw.githubusercontent.com/impactslowforest/Coffee-dashboard-v2/refs/heads/main/logo.png" alt="Logo" className="h-12 mr-4" />
                        <h1 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight">
                            {projectTitle}
                        </h1>
                    </div>
                    <button
                        onClick={onLanguageToggle}
                        className="mt-2 sm:mt-0 px-3 py-1 border border-white rounded-md text-sm hover:bg-white hover:text-green-800 transition-colors"
                    >
                        {language === 'vi' ? 'English' : 'Tiếng Việt'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
