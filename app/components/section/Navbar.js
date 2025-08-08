import Image from "next/image"

export function Navbar(){
    return(
        <nav className="text-white  font-semibold bg-gradient-to-r from-red-500 to-orange-500 px-10 ">
            <div className="md:mx-10 md:border-b-2 flex md:justify-between justify-center items-center md:border-white md:py-8 py-4">
                <div className="text-4xl items-center flex">
                    <Image src="/images/logo.png" width={70} height={70} alt="logo image" / >
                    <div className="-ml-2">oupled</div>
                </div>
                <div className="flex gap-8 ">
                    <div className="text-xl hidden md:block">My Matches</div>
                    <div className="text-xl hidden md:block">Explore</div>
                    <div className="text-xl hidden md:block">My Profile</div>
                </div>
                <Image src="/images/logo.png" width={80} height={80} alt="logo" className="md:hidden" />
            </div>
        </nav>
    )
}