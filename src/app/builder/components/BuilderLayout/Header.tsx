"use client";

import React from 'react';

interface HeaderProps {
  settings?: any;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function Header({ settings = {}, isEditing, isSelected, onSelect }: HeaderProps) {
  const {
    logo = {},
    navigation = { items: [] },
    layout = {}
  } = settings;

  const containerClasses = [
    'relative',
    'bg-white dark:bg-gray-800',
    'border-gray-200',
    layout.sticky ? 'sticky top-0 z-50' : '',
    layout.transparent ? 'bg-transparent' : '',
    isSelected ? 'ring-2 ring-blue-500' : '',
    isEditing ? 'cursor-pointer hover:ring-2 hover:ring-blue-200' : ''
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'flex flex-wrap justify-between items-center',
    'mx-auto',
    layout.maxWidth ? `max-w-[${layout.maxWidth}]` : 'max-w-screen-xl',
    'px-4 lg:px-6 py-2.5'
  ].join(' ');

  const handleClick = () => {
    if (isEditing && onSelect) {
      onSelect();
    }
  };

  return (
    <header className={containerClasses} onClick={handleClick}>
      <nav className={contentClasses}>
        <div className="flex items-center">
          {logo.image && (
            <img src={logo.image} className="mr-3 h-6 sm:h-9" alt="Logo" />
          )}
          {(logo.showText !== false && logo.text) && (
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              {logo.text}
            </span>
          )}
        </div>
        
        <div className="flex items-center lg:order-2">
          {navigation.items.map((item: any, index: number) => (
            item.isButton ? (
              <a
                key={index}
                href={item.url}
                className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
              >
                {item.text}
              </a>
            ) : (
              <a
                key={index}
                href={item.url}
                className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
              >
                {item.text}
              </a>
            )
          ))}
        </div>
      </nav>
      
      {isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 transition-opacity duration-200" />
      )}
    </header>
  );
}
