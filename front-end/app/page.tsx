"use client"
import Banner from './components/Banner/Banner';
import Companies from './components/Companies/Companies';
import Buyers from './components/Buyers/index';
import Provide from './components/Provide/index';
import Why from './components/Why/index';
import Network from './components/Network/index';
import Clientsay from './components/Clientsay/index';
import Newsletter from './components/Newsletter/Newsletter';
import Instances from './components/Instances/Instances'
import Map from './components/Map/Map';
import Captures from './components/Capture/Captures'
import {isTokenValid} from './components/Authentications/tokenValidation'
import { useState, useEffect } from 'react';
import ContactUs from './components/ContactUs/ContactUs'
import OceanMap from './components/OceanMap/OceanMap'


export default function Home() {

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

    if (isAuthenticated === null) return null; // Avoid rendering mismatched content

  return (
    <main>
      <Banner />
      {isAuthenticated && <Instances/> }
      {isAuthenticated && <Captures /> }
      {/* <Map /> */}
      {/* <Companies /> */}
      <OceanMap/>
      <Why />
      {/* <Buyers /> */}
      {/* <Provide /> */}
      {/* <Network /> */}
      {/* <Clientsay /> */}
      {/* <Newsletter /> */}
      <ContactUs />
    </main>
  )
}
