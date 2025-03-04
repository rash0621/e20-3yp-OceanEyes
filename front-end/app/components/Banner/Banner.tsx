import Image from "next/image";
import { useState, useEffect } from "react";
import { isTokenValid } from "../Authentications/tokenValidation";



const Banner = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid());
    
        useEffect(() => {
            const checkAuth = () => {
                setIsAuthenticated(isTokenValid());
            };
    
            window.addEventListener("storage", checkAuth);
    
            return () => {
                window.removeEventListener("storage", checkAuth);
            };
        }, []);

    return (
        <main>
            <div className="px-6 lg:px-8">
                <div className="mx-auto max-w-7xl pt-16 sm:pt-20 pb-20 banner-image">
                    <div className="text-center">
                        <a href="/"><h1 className="text-4xl font-semibold text-navyblue sm:text-5xl  lg:text-7xl md:4px lh-96">
                            OceanEyes<br />
                        </h1></a>
                        <p className="mt-6 text-lg leading-8 text-bluegray">
                        Sea Pollution Detection & Sea State Monitoring <br />
                        </p>
                    </div>

                    {isAuthenticated && (
                        <>
                        <div className="text-center mt-5">
                        <button type="button" className='text-15px text-white font-medium bg-blue py-5 px-9 mt-2 leafbutton'>
                            View Maps
                        </button>
                        <button type="button" className='text-15px ml-4 mt-2 text-blue transition duration-150 ease-in-out hover:text-white hover:bg-blue font-medium py-5 px-16 border border-lightgrey leafbutton'>
                            Controller
                        </button>
                        
                    </div>
                        </>
                    )}
                    

                    {/* <Image src={'/assets/banner/dashboard.svg'} alt="banner-image" width={1200} height={598} /> */}
                </div>
            </div>
        </main>
    )
}

export default Banner;
