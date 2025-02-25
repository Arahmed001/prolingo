"use client";

import { useState, useEffect } from 'react';

export default function AccessibilityPage() {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedContrast = localStorage.getItem('accessibility-high-contrast');
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
      document.documentElement.style.fontSize = `${savedFontSize}px`;
    }
    
    if (savedContrast === 'true') {
      setHighContrast(true);
      document.body.classList.add('high-contrast');
    }
  }, []);

  // Update font size
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('accessibility-font-size', newSize.toString());
  };

  // Toggle contrast mode
  const toggleContrast = () => {
    const newContrastValue = !highContrast;
    setHighContrast(newContrastValue);
    
    if (newContrastValue) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    localStorage.setItem('accessibility-high-contrast', newContrastValue.toString());
  };

  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Accessibility Settings</h1>
          <p className="text-muted-foreground">
            Customize your experience to make the site more accessible for your needs.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="space-y-8">
            {/* Font Size Control */}
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">Font Size</h2>
              <div className="mb-2 flex justify-between">
                <span className="text-sm">Small</span>
                <span className="text-sm font-medium">{fontSize}px</span>
                <span className="text-sm">Large</span>
              </div>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={fontSize}
                onChange={handleFontSizeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="mt-4 p-4 border border-border rounded-md">
                <p className="text-muted-foreground">
                  This is a preview of how text will appear with your selected font size.
                </p>
              </div>
            </div>

            {/* Contrast Control */}
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">Contrast</h2>
              <div className="flex items-center">
                <button
                  onClick={toggleContrast}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    highContrast ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-3 text-sm font-medium">
                  {highContrast ? 'High Contrast' : 'Normal Contrast'}
                </span>
              </div>
              <div className="mt-4 p-4 border border-border rounded-md">
                <p className="text-muted-foreground">
                  High contrast mode provides better readability with white background and black text.
                </p>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={() => {
                  setFontSize(16);
                  setHighContrast(false);
                  document.documentElement.style.fontSize = '16px';
                  document.body.classList.remove('high-contrast');
                  localStorage.setItem('accessibility-font-size', '16');
                  localStorage.setItem('accessibility-high-contrast', 'false');
                }}
                className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            These settings will be saved and applied whenever you visit our site on this device.
          </p>
        </div>
      </div>
    </div>
  );
} 