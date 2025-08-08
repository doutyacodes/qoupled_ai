import React from 'react';
import Image from "next/image";
import { Matches, LikedYou, YouLiked } from '@/public/data/myMatches';

export const MyMatches = () => {
    const imageSize = 144; // Define a standard size for all images

    const renderMatchGroup = (title, data) => (
        <div className="flex flex-col gap-2">
            <div className="text-white font-bold text-3xl">{title}</div>
            <div className="bg-white rounded-md p-8 flex flex-wrap gap-3">
                {data.map((obj, index) => (
                    <div key={index} className="flex flex-col text-xs text-neutral-500">
                        <div className="relative w-36 h-36">
                            <Image 
                                src={obj.img} 
                                layout="fill" 
                                objectFit="cover" 
                                alt="matchImage" 
                                className="rounded-md"
                            />
                        </div>
                        <div className="font-bold">{obj.nameAge}</div>
                        <div>{obj.city}</div>
                    </div>
                ))}
                <div className="h-36 w-36 text-4xl text-neutral-800 font-bold flex justify-center items-center border-2 border-neutral-600 rounded-md cursor-pointer">+</div>
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 flex flex-col justify-center px-4 sm:px-20 gap-8 py-16">
            {renderMatchGroup("My Matches", Matches)}
            {renderMatchGroup("Liked You", YouLiked)}
            {renderMatchGroup("You Liked", LikedYou)}
        </div>
    );
};  