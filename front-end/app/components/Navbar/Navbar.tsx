"use client"

import { Disclosure } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Drawer from "./Drawer";
import Registerdialog from "./Registerdialog";
import { isTokenValid } from '../Authentications/tokenValidation';
import dynamic from "next/dynamic";
import DeviceManagement from "../../device-management/page";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { domainName } from '../DomainName';

const Drawerdata = dynamic(() => import('./Drawerdata'), {
  ssr: false,
});

const Signdialog = dynamic(() => import('./Signdialog'), {
  ssr: false,
});

const Logout = dynamic(() => import('./Logout'), {
  ssr: false,
});

interface NavigationItem {
    name: string;
    href: string;
    current: boolean;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid());
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showDeviceManagement, setShowDeviceManagement] = React.useState(false);

    // Always show Home
    const homeNav: NavigationItem = { name: 'Home', href: '/', current: true };

    // Navigation for not authenticated users (excluding Home)
    const guestNavigation: NavigationItem[] = [
        { name: 'About', href: '#about', current: false },
        { name: 'Contact Us', href: '#contactus', current: false },
    ];

    // Navigation for authenticated users (excluding Home)
    const authNavigation: NavigationItem[] = [
        { name: 'View Map', href: '/map', current: false },
        { name: 'Device Management', href: '/device-management', current: false },        
        { name: 'Statistics', href: '/Statistics', current: false },
        { name: 'Downloads', href: '/downloads', current: false },
        { name: 'Profile', href: '/profile', current: false },
    ];

    // Only show these for admin
    const adminNavigation: NavigationItem[] = [
        { name: 'Add Customer', href: '/admin-addCustomer', current: false },
        { name: 'Inventory Customer', href: '/admin-inventoryCustomers', current: false },
        { name: 'Profile', href: '/profile', current: false },
    ];

    useEffect(() => {
        const checkAuth = () => {
            if (typeof window !== 'undefined') {
                const valid = isTokenValid();
                setIsAuthenticated(valid);
            }
        };
        window.addEventListener("storage", checkAuth);
        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    useEffect(() => {
        const fetchEmail = async () => {
            if (isTokenValid()) {
                const jwtToken = localStorage.getItem('jwtToken');
                if (jwtToken) {
                    try {
                        const res = await fetch(`${domainName}user/me/email`, {
                            headers: { Authorization: `Bearer ${jwtToken}` }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            const email = data.data;
                            console.log('Navbar - Fetched email:', email); // Debug log
                            console.log('Navbar - Email comparison result:', email === 'oceaneyessrilanka@gmail.com'); // Debug log
                            setUserEmail(email);
                            setIsAdmin(email === 'oceaneyessrilanka@gmail.com');
                        } else {
                            console.log('Navbar - Failed to fetch email, response not ok'); // Debug log
                            setUserEmail(null);
                            setIsAdmin(false);
                        }
                    } catch (err) {
                        console.log('Navbar - Error fetching email:', err); // Debug log
                        setUserEmail(null);
                        setIsAdmin(false);
                    }
                } else {
                    console.log('Navbar - No token found'); // Debug log
                    setUserEmail(null);
                    setIsAdmin(false);
                }
            } else {
                console.log('Navbar - Token not valid'); // Debug log
                setUserEmail(null);
                setIsAdmin(false);
            }
        };
        fetchEmail();
    }, [isAuthenticated]);

    // Build navigation based on user role (inside render for immediate update)
    const navigation: NavigationItem[] = React.useMemo(() => {
        console.log('Navbar - Current state:', { isAuthenticated, userEmail, isAdmin }); // Debug log
        let nav: NavigationItem[] = [];
        if (isAuthenticated && isAdmin) {
            // Admin gets: Home + Auth items (filtered) + Admin specific items, Profile last
            console.log('Navbar - Building admin navigation'); // Debug log
            const filteredAuthNavigation = authNavigation.filter(item =>
                item.name !== 'View Map' &&
                item.name !== 'Device Management' &&
                item.name !== 'Downloads' &&
                item.name !== 'Profile'
            );
            const adminWithoutProfile = adminNavigation.filter(item => item.name !== 'Profile');
            const profileNav = authNavigation.find(item => item.name === 'Profile') || adminNavigation.find(item => item.name === 'Profile');
            nav = [homeNav, ...filteredAuthNavigation, ...adminWithoutProfile];
            if (profileNav) nav.push(profileNav);
        } else if (isAuthenticated) {
            // Regular authenticated users get: Home + Auth items, Profile last
            console.log('Navbar - Building regular user navigation'); // Debug log
            const authWithoutProfile = authNavigation.filter(item => item.name !== 'Profile');
            const profileNav = authNavigation.find(item => item.name === 'Profile');
            nav = [homeNav, ...authWithoutProfile];
            if (profileNav) nav.push(profileNav);
        } else {
            // Guests get: Home + Guest items
            console.log('Navbar - Building guest navigation'); // Debug log
            nav = [homeNav, ...guestNavigation];
        }
        return nav;
    }, [isAuthenticated, isAdmin, userEmail]);

    return (
        <>
            {/* Top Navbar for large screens */}
            <Disclosure as="nav" className="navbar hidden lg:block">
                <div className="mx-20 max-w-7xl px-6 lg:py-4 lg:px-0">
                    <div className="relative flex h-20 items-center justify-between">
                        <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
                            {/* LOGO */}
                            <div className="flex flex-shrink-1 items-center space-x-3">
                                <img
                                    className="hidden h-[200px] w-[200px] lg:block"
                                    src={'/assets/banner/logo.png'}
                                    alt="dsign-logo"
                                />
                                {/* <span className="hidden lg:block ml-3 text-2xl font-bold text-gray-500 opacity-70">OceanEyes</span> */}
                            </div>
                            {/* LINKS */}
                            <div className="m-auto">
                                <div className="flex space-x-4">
                                    {showDeviceManagement && <DeviceManagement />}
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                item.name === 'OceanEyes' ? 'text-2xl font-bold' : 'text-lg font-normal',
                                                'px-3 py-4 opacity-75 space-links',
                                                item.current ? 'text-black hover:opacity-100' : 'hover:text-black hover:opacity-100'
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
                        {/* LOGOUT DIALOG */}
                        {isAuthenticated && <Logout />}
                    </div>
                </div>
            </Disclosure>

            {/* Drawer for small screens */}
            <div className="block lg:hidden">
                <Disclosure as="nav" className="navbar">
                    <div className="mx-4 max-w-full px-2 py-2">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
                                {/* LOGO */}
                                <div className="flex flex-shrink-1 items-center space-x-3">
                                    <img
                                        className="h-[120px] w-[120px]"
                                        src={'/assets/banner/logo.png'}
                                        alt="dsign-logo"
                                    />
                                </div>
                            </div>
                            {/* DRAWER ICON */}
                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" onClick={() => setIsOpen(true)} />
                            {/* DRAWER LINKS DATA */}
                            <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
                                <Drawerdata />
                            </Drawer>
                        </div>
                    </div>
                </Disclosure>
            </div>
        </>
    );
};

export default Navbar;