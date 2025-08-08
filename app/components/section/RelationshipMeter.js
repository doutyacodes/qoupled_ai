

"use client"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"

const options = [
    "RELATIONSHIP METER", "ICE BREAKER", "CHAT", "ACTIVITY 1", "ACTIVITY 2"
]

export function RelationshipMeter(){
    const [option, setOption] = useState("RELATIONSHIP METER")
    const [sliderValue, setSliderValue] = useState(0)
    const sliderRef = useRef(null)
    const isDragging = useRef(false)
    const noSelectStyle = {
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      };

    useEffect(() => {
        const slider = sliderRef.current
        const fill = slider.querySelector('.slider-fill')
        const thumb = slider.querySelector('.slider-thumb')

       

          

        const updateSlider = (clientX) => {
            const rect = slider.getBoundingClientRect()
            let percentage = (clientX - rect.left) / rect.width
            percentage = Math.max(0, Math.min(1, percentage))
            const newValue = Math.round(percentage * 100)
            setSliderValue(newValue)
            fill.style.width = `${percentage * 100}%`
            thumb.style.left = `${percentage * 100}%`
        }

        const handleMouseDown = (e) => {
            isDragging.current = true
            updateSlider(e.clientX)
        }

        const handleMouseMove = (e) => {
            if (isDragging.current && e.buttons === 1) {
              updateSlider(e.clientX);
            }
          };

        const handleMouseUp = () => {
            isDragging.current = false
        }

        const handleTouchStart = (e) => {
            e.preventDefault();
            isDragging.current = true;
            updateSlider(e.touches[0].clientX);
          };
          
          const handleTouchMove = (e) => {
            e.preventDefault();
            if (isDragging.current) {
              updateSlider(e.touches[0].clientX);
            }
          };

        slider.addEventListener('mousedown', handleMouseDown)
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        slider.addEventListener('touchstart', handleTouchStart)
        document.addEventListener('touchmove', handleTouchMove)
        document.addEventListener('touchend', handleMouseUp)

        return () => {
            slider.removeEventListener('mousedown', handleMouseDown)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            slider.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleMouseUp)
        }
    }, [])

    return(
        <div className="bg-gradient-to-r from-red-500 to-orange-500 flex flex-col justify-center md:px-20 md:py-8">
            <div className="relative bg-white w-full md:p-8 md:rounded-xl flex md:flex-row flex-col gap-8 max-md:pb-8">
                <div className="md:pr-3 flex flex-col gap-6 md:w-fit w-full">
                    <div className="flex flex-col max-md:w-full justify-center max-md:items-center gap-4 max-md:py-5">
                        <Image src="/images/likedYou2.jpeg" width={300} height={300} alt="Profile picture of Virat Singh" className="rounded-lg bg-cover shadow-md hidden md:block"/>
                        <Image src="/images/likedYou2.jpeg" width={150} height={300} alt="Profile picture of Virat Singh" className="rounded-lg bg-cover shadow-md md:hidden"/>
                        <div className="text-3xl font-semibold text-center text-neutral-700">Aisha Arora</div>
                        <div className="text-lg text-neutral-500 text-center">Streak: 2 days</div>
                    </div>
                    <div className="md:rounded-md bg-neutral-100 md:border border-b border-b-neutral-300 md:border-neutral-300 md:gap-5 gap-2 md:py-5 flex md:flex-col">
                        {options.map((obj, index)=>(
                            <div key={index} className={`w-full ${option==obj? "bg-gradient-to-r from-red-500 to-orange-500 text-white":"bg-neutral-300 text-neutral-800"} md:py-3 text-center cursor-pointer md:font-semibold max-md:text-[9px] max-md:normal-case px-1 flex items-center justify-center max-md:rounded-sm`} onClick={()=>setOption(obj)}>{obj}</div>
                        ))}  
                    </div>
                </div>
                {option=="RELATIONSHIP METER" &&
                    <div className="w-full justify-start items-center md:gap-40 gap-20 flex flex-col">
                        <h1 className="text-center font-bold md:text-5xl text-xl text-neutral-500">RELATIONSHIP METER</h1>
                        <div className="w-4/5 flex flex-col gap-3" style={noSelectStyle}>
                        <div className="relative w-full h-8">
                            <div className="absolute w-full md:h-10 h-5 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"></div>
                            <div ref={sliderRef} className="slider relative w-full h-4">
                            <div className="slider-fill absolute h-full bg-transparent rounded-full"></div>
                            <div className="slider-thumb absolute md:w-6 md:h-36 w-3 h-20 bg-neutral-400 rounded-md md:top-[-72px] top-[-40px] md:-ml-3 -ml-1 flex items-center justify-center cursor-pointer">
                                <div className="absolute bottom-[-50px] text-3xl font-bold text-neutral-800" style={noSelectStyle}>{sliderValue}</div>
                            </div>
                            </div>
                        </div>
                        <div className="flex justify-between text-md text-gray-500">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                        </div>
                        </div>
                        <div className="flex flex-col md:gap-10 gap-5">
                            <div>
                                <p className="text-center text-gray-600 md:text-3xl text-xl">Reach 50 points to unlock Chat & other activities</p>
                            </div>
                            <div className="flex flex-col md:gap-7 gap-2">
                                <div className="text-center text-gray-500 md:text-xl text-xs ">The slider can only be controlled by <span className="font-bold">Aisha</span></div>
                                <p className="text-center text-gray-500 md:text-xl text-xs">You lose 1 point for every day of inactivity by either of you</p>
                                <p className="text-center text-gray-500 md:text-xl text-xs">This room will shut down when the slider reaches 0</p>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}   