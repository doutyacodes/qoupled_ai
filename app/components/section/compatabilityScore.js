import ModernNavbar from '@/app/_components/Navbar';

import Image from "next/image";

const CompatabilityScore = () => {

    const personalityCompatabilityScore = 65;
    const preferenceCompatabilityScore = 75;
    const relationshipAnalysisScore = 70;

    return(
        <div>
             {/* <ModernNavbar /> */}

            <div className="bg-gradient-to-r from-red-500 to-orange-500 flex flex-col justify-center md:px-20 md:py-8">
                <div className=" bg-white w-full md:py-8 md:px-52 md:rounded-xl flex flex-col justify-center items-center gap-12 max-md:pb-8 ">
                        <div className="flex w-full justify-center text-4xl items-center text-red-500 font-bold">
                            <Image src="/images/logoRed.png" width={70} height={70} alt="logo" />
                            Test
                        </div>
                        <div className=" w-full text-center font-bold md:text-3xl text-2xl text-neutral-700">Your Compatability Score</div>
                        <div className="flex w-full justify-between items-center max-md:px-4">
                            <Image src="/images/virat.jpg" width={300} height={300} alt="Profile picture of Virat Singh" className="rounded-lg   hidden md:block border border-neutral-400 object-cover"/>
                            <Image src="/images/virat.jpg" width={130} height={130} alt="Profile picture of Virat Singh" className="rounded-lg   md:hidden border border-neutral-400 object-cover"/>

                            <div className="md:text-8xl text-4xl text-red-500">❤</div>

                            <Image src="/images/deepika1.jpg" width={300} height={300} alt="Profile picture of Deepika" className="rounded-lg   hidden md:block border border-neutral-400 object-cover"/>
                            <Image src="/images/deepika1.jpg" width={130} height={130} alt="Profile picture of Deepika" className="rounded-lg    md:hidden border border-neutral-400 object-cover"/>
                        </div>
                        <div className="w-full flex flex-col justify-center items-center gap-8 md:px-20 px-6">
                            <div className="flex flex-col gap-8 w-full justify-center items-center">
                                <div className="flex md:text-3xl text-lg w-full items-center justify-between">
                                    <div className="text-neutral-500">Personality Compatability Score:</div>
                                    <div className="font-bold text-neutral-800">{personalityCompatabilityScore}%</div>
                                </div>
                                <div className="flex md:text-3xl text-lg w-full items-center justify-between border-b-2 pb-5 border-b-neutral-500">
                                    <div className="text-neutral-500">Preference Compatability Score:</div>
                                    <div className="font-bold text-neutral-800">{preferenceCompatabilityScore}%</div>
                                </div>
                                <div className="flex md:text-3xl text-lg w-full items-center justify-between">
                                    <div className="font-bold text-neutral-800">Relationship Analysis Score:</div>
                                    <div className="font-bold text-neutral-800">{relationshipAnalysisScore}%</div>
                                </div>
                            </div>
                            <button className="w-fit md:py-4 py-2 px-8 rounded-full bg-red-500 font-bold text-white md:text-xl text-sm max-md:flex max-md:flex-col max-md:items-center">DOWNLOAD <span></span>ADVANCED COMPATABILITY REPORT</button>
                        </div>
                </div>
            </div>
        </div>
    )
} 

export default CompatabilityScore;