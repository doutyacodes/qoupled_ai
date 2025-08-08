
"use client"


import React, { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { Matches, LikedYou, YouLiked } from '@/public/data/myMatches';

export const MyMatches = () => {
    const CustomSlider = ({ data }) => {
        const [isDragging, setIsDragging] = useState(false);
        const [startX, setStartX] = useState(0);
        const [scrollLeft, setScrollLeft] = useState(0);
        const sliderRef = useRef(null);

        const handleDragStart = (e) => {
            setIsDragging(true);
            setStartX(e.pageX || e.touches[0].pageX - sliderRef.current.offsetLeft);
            setScrollLeft(sliderRef.current.scrollLeft);
        };

        const handleDragMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX || e.touches[0].pageX - sliderRef.current.offsetLeft;
            const walk = (x - startX) * 2; // Adjust sliding speed
            sliderRef.current.scrollLeft = scrollLeft - walk;
        };

        const handleDragEnd = () => {
            setIsDragging(false);
        };

        useEffect(() => {
            const slider = sliderRef.current;
            if (slider) {
                slider.addEventListener('touchstart', handleDragStart, { passive: false });
                slider.addEventListener('touchmove', handleDragMove, { passive: false });
                slider.addEventListener('touchend', handleDragEnd);
            }

            return () => {
                if (slider) {
                    slider.removeEventListener('touchstart', handleDragStart);
                    slider.removeEventListener('touchmove', handleDragMove);
                    slider.removeEventListener('touchend', handleDragEnd);
                }
            };
        }, [isDragging, startX, scrollLeft]);

        return (
            <div 
                className="flex gap-6 overflow-x-auto scrollbar-hide select-none md:pb-2 max-md:py-4"
                ref={sliderRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                }}
            >
                {data.map((obj, index) => (
                    <div key={index} className="flex-shrink-0 w-24 sm:w-36 mr-2">
                        <div className="relative w-24 h-24 sm:w-36 sm:h-36 pointer-events-none">
                            <Image 
                                src={obj.img} 
                                layout="fill" 
                                objectFit="cover" 
                                alt="matchImage" 
                                className="rounded-md"
                                draggable="false"
                            />
                        </div>
                        <div className="text-xs md:text-neutral-500 text-neutral-100 pointer-events-none mt-1">
                            <div className="md:font-bold truncate">{obj.nameAge}</div>
                            <div className="truncate max-md:text-neutral-300">{obj.city}</div>
                        </div>
                    </div>
                ))}
                <div className="flex-shrink-0 w-24 h-24 sm:w-36 sm:h-36 text-4xl text-neutral-800 max-md:bg-white font-bold flex justify-center items-center border-2 md:border-red-500 border-white rounded-md cursor-pointer">+</div>
            </div>
        );
    };

    const renderMatchGroup = (title, data) => (
        <div className="flex flex-col gap-2">
            <div className="text-neutral-800 font-bold text-lg sm:text-3xl sm:text-white md:pl-0 pl-4">{title}</div>
            <div className="md:bg-white md:from-white md:to-white bg-gradient-to-r from-red-500 to-orange-500 md:rounded-md sm:p-8 p-4">
                <CustomSlider data={data} />
            </div>
        </div>
    );

    return (
        <div className="md:bg-gradient-to-r md:from-red-500 md:to-orange-500 bg-white flex flex-col justify-center sm:px-20 gap-12 sm:gap-8 py-8 sm:py-16">
            <div className="hidden sm:block text-center text-white text-3xl font-bold mb-4">My Matches</div>
            <div className="sm:hidden">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-black md:text-xl text-2xl font-bold w-full text-center">MY MATCHES</div>
                    <div className="w-6 h-6"></div> {/* Placeholder for balance */}
                </div>
            </div>
            {renderMatchGroup("Matches", Matches)}
            {renderMatchGroup("Profiles that liked me", LikedYou)}
            {renderMatchGroup("Profiles I liked", YouLiked)}
            {/* <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white flex justify-around items-center py-3">
                <Image src="/puzzle-icon.svg" width={24} height={24} alt="My Matches" />
                <Image src="/search-icon.svg" width={24} height={24} alt="Explore" />
                <Image src="/profile-icon.svg" width={24} height={24} alt="My Profile" />
            </div> */}
        </div>
    );
};