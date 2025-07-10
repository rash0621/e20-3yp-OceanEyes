"use client"
import Awareness from './components/Awareness/Awareness';
// import Buyers from './components/Buyers/index';
// import Provide from './components/Provide/index';
import Why from './components/Why/index';
// import Network from './components/Network/index';
// import Clientsay from './components/Clientsay/index';
// import Newsletter from './components/Newsletter/Newsletter';
// import Map from './components/Map/Map';
import {isTokenValid} from './components/Authentications/tokenValidation'
import { useState, useEffect } from 'react';
import ContactUs from './components/ContactUs/ContactUs'
// import OceanMap from './components/OceanMap/OceanMap'
import dynamic from "next/dynamic";

const Banner = dynamic(() => import('./components/Banner/Banner'), {
  ssr: false,
});


export default function Home() {

 const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid());//<boolean | null>(null);

    useEffect(() => {
        const checkAuth = () => {
          if (typeof window !== 'undefined') {
            const valid = isTokenValid();
            setIsAuthenticated(valid);}
        };

        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    if (isAuthenticated === null) return null; // Avoid rendering mismatched content

  return (
    <main>
      <Banner />
      {/* {isAuthenticated && <Instances/> }
      {isAuthenticated && <Captures /> } */}
      {/* <Map /> */}
      <Why />
      {/* <Buyers /> */}
      {/* <Provide /> */}
      {/* <Network /> */}
      {/* <Clientsay /> */}
      {/* <Newsletter /> */}
      <Awareness />
      <ContactUs />
    </main>
  )
}
