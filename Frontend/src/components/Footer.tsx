import React from "react";

// Footer shown on all pages (including login).
// Exact wordings (as in the provided image):
// Left: "©Copyrights@artech. All rights are reserved"
// Center: "Private policy | Terms of use"
// Right: "Powered by AR Technologies"
// Font: Inter (fallbacks to Arial, sans-serif)

const Footer: React.FC = () => {
    return (
        // Static footer that sits at the bottom of the page content.
        <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900">
            <div
                className="max-w-7xl mx-auto px-1 py-1 sm:px-3 sm:py-2 flex flex-col items-center sm:flex-row sm:items-center sm:justify-between text-[10px] sm:text-xs text-gray-600 dark:text-gray-300"
                style={{ fontFamily: "'Inter', Arial, sans-serif" }}
            >
                {/* Left - on mobile this will be centered */}
                <div className="w-full text-center mb-0.5 sm:mb-0 sm:w-auto">
                    ©Copyrights@artech. All rights are reserved
                </div>

                {/* Center links - always centered */}
                <div className="flex gap-1 sm:gap-3 items-center justify-center w-full sm:w-auto">
                    <a href="#" className="hover:underline" aria-label="Private policy">
                        Private policy
                    </a>
                    <span className="text-gray-400">|</span>
                    <a href="#" className="hover:underline" aria-label="Terms of use">
                        Terms of use
                    </a>
                </div>

                {/* Right - on mobile this will be centered */}
                <div className="w-full text-center mt-0.5 sm:mt-0 sm:w-auto">
                    Powered by AR Technologies
                </div>
            </div>
        </footer>
    );
};

export default Footer;
