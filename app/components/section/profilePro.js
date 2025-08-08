import { memo } from 'react';
import Image from "next/image";
import { MyProfileDetailsData } from "@/public/data/myProfileDetailsData";
import { ProTag } from '../ui/ProTag';

export const ProfilePro = memo(() => {
    const verifications = [
        { color: "#87CEEB", text: "Photo verified" },
        { color: "#800080", text: "ID verified" },
        { color: "#FF0000", text: "Email verified" },
        { color: "#008000", text: "Phone verified" }
    ];

    const name = "Virat Singh"

    return (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 flex flex-col justify-center md:px-20 md:py-8">
            <div className="relative bg-white w-full md:py-6 pb-6 md:rounded-xl flex flex-col lg:flex-row justify-evenly gap-10">
                <ProTag bgAndTextColor="bg-amber-500 border border-amber-600 text-white" textAndPadding="text-xl p-3 max-md:top-[230px]" />
                <div className="flex flex-col gap-7 items-center w-full lg:w-fit">
                    <div className="relative w-[600px]">
                        <Image src="/images/virat.jpg" width={600} height={600} alt="Profile picture of Virat Singh" className="rounded-lg bg-cover shadow-md"/>
                    </div>
                    <div className="text-2xl sm:text-4xl text-neutral-800 font-bold">{name}</div>
                    <div className="flex md:flex-col flex-col-reverse md:gap-10 gap-5 items-center w-full">
                        <div className="flex flex-row w-full justify-between text-sm md:text-lg text-neutral-500 md:font-semibold  max-md:px-6">
                            <div>Citizenship: Indian</div>
                            <div>Age: 25</div>
                            <div>Gender: Female</div>
                        </div>
                        <div className="flex flex-col w-full text-start gap-2  max-md:px-6">
                            <div className="font-bold text-xl text-start text-neutral-800 hidden md:block">VERIFICATIONS</div>
                            <div className="flex flex-wrap md:justify-between justify-center md:gap-0 gap-4 items-center">
                                {verifications.map((item, index) => (
                                    <div key={index} className="flex flex-col items-center justify-center m-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-circle-check" aria-label={`${item.text} checkmark`}>
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" fill={item.color}/>
                                        </svg>
                                        <div className="text-neutral-500 text-sm hidden md:block">{item.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" flex flex-col md:gap-12 gap-6  w-full lg:w-[800px] max-md:px-6">
                    <div className="flex flex-col gap-12">
                    <div className="text-2xl sm:text-3xl font-bold text-center hidden md:block text-neutral-500">MY PROFILE</div>
                    <div className="grid grid-cols-4  lg:grid-cols-6 gap-4 gap-y-10">
                        {MyProfileDetailsData.map((obj, index) => (
                            <div key={index} className="flex flex-col items-center justify-center gap-1 text-sm text-neutral-500">
                                <div dangerouslySetInnerHTML={{ __html: obj.icon }} />
                                <div>{obj.text1}</div>
                                <div>{obj.text2}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 text-white text-lg text-center font-semibold">
                        <div className="w-full bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer px-3 py-8 rounded-xl">Analyse Your Personality</div>
                        <div className="w-full bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer px-3 py-8 rounded-xl">Add your Interests & Preferences</div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer px-3 py-4 rounded-xl flex gap-4 text-white font-semibold items-center justify-center">
                        <div>Add more photos</div>
                        <div className="w-20 h-20 rounded-xl text-neutral-600 font-bold bg-white flex justify-center items-center text-3xl">+</div>
                    </div>
                    <div className="flex gap-4 text-white text-lg text-center font-semibold">
                        <div className="w-full bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer px-3 py-8 rounded-xl">Add Horoscope</div>
                        <div className="w-full bg-gradient-to-r from-red-500 to-orange-500 cursor-pointer px-3 py-8 rounded-xl">Add Achievements</div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
});