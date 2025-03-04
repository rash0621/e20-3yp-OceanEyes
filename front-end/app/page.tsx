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
// import GenerateInstances from './components/Instances/Instances';
import {isTokenValid} from './components/Authentications/tokenValidation'
import { useState, useEffect } from 'react';



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


  return (
    <main>
      <Banner />
      {/* <Map /> */}
      {/* <Companies /> */}
      <Why />
      {isAuthenticated && <Instances/> }
      {/* <Buyers /> */}
      {/* <Provide /> */}
      {/* <Network /> */}
      {/* <Clientsay /> */}
      {/* <Newsletter /> */}
      {/* <GenerateInstances/> */}
    </main>
  )
}
