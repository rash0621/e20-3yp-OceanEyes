"use client"

import { Disclosure } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Drawer from "./Drawer";
import Drawerdata from "./Drawerdata";
import Signdialog from "./Signdialog";
import Registerdialog from "./Registerdialog";
import Logout from "./Logout";
import {isTokenValid} from '../Authentications/tokenValidation';


interface NavigationItem {
    name: string;
    href: string;
    current: boolean;
}

const navigation: NavigationItem[] = [
    { name: 'OceanEyes', href: '/', current: true },
    { name: 'Home', href: '/', current: true },
    { name: 'Services', href: '#services', current: false },
    { name: 'About', href: '#about', current: false },
    { name: 'Device Management', href: '#about', current: false },
    { name: 'Help', href: '/', current: false },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}


const Navbar = () => {

    const [isOpen, setIsOpen] = React.useState(false);
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
        <>
        <Disclosure as="nav" className="navbar">
            <>
                <div className="mx-auto max-w-7xl px-6 lg:py-4 lg:px-8">
                    <div className="relative flex h-20 items-center justify-between">
                        <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">

                            {/* LOGO */}

                            {/* <div className="flex flex-shrink-0 items-center">
                                <img
                                    className="block h-12 w-40 lg:hidden"
                                    src={'/assets/logo/logo.png'}
                                    alt="dsign-logo"
                                />
                                <img
                                    className="hidden h-full w-full lg:block"
                                    src={'/assets/logo/logo.png'}
                                    alt="dsign-logo"
                                />
                            </div> */}

                            {/* LINKS */}

                            <div className="hidden lg:block m-auto">
                                <div className="flex space-x-4">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                item.name === 'OceanEyes' ? 'text-2xl font-bold' : 'text-lg font-normal','px-3 py-4 opacity-75 space-links',
                                                item.current ? ' text-black hover:opacity-100' : 'hover:text-black hover:opacity-100',
                                                'px-3 py-4 opacity-75 space-links'
                                            )}
                                            aria-current={item.href ? 'page' : undefined}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SIGNIN DIALOG */}

                        {!isAuthenticated && <Signdialog />}

                        {/* REGISTER DIALOG */}

                        {!isAuthenticated && <Registerdialog />}

                        {isAuthenticated && <Logout/>}

                        {/* DRAWER FOR MOBILE VIEW */}

                        {/* DRAWER ICON */}

                        <div className='block lg:hidden'>
                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" onClick={() => setIsOpen(true)} />
                        </div>

                        {/* DRAWER LINKS DATA */}

                        <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
                            <Drawerdata />
                        </Drawer>

                    </div>
                </div>
            </>
        </Disclosure>
      </>
    )
}

export default Navbar;
