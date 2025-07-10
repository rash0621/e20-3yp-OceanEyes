import React, { useEffect, useState } from "react";
import Link from "next/link";
import { isTokenValid } from "../Authentications/tokenValidation";

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

const homeNav: NavigationItem = { name: 'Home', href: '/', current: true };

const guestNavigation: NavigationItem[] = [
  { name: 'About', href: '#about', current: false },
  { name: 'Contact Us', href: '#contactus', current: false },
];

const authNavigation: NavigationItem[] = [
  { name: 'View Map', href: '/map', current: false },
  { name: 'Device Registration', href: '/device-registration', current: false },
  { name: 'Device Management', href: '/device-management', current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Data = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid());

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

  // Combine Home with either guest or auth nav items
  const navigation = [homeNav, ...(isAuthenticated ? authNavigation : guestNavigation)];

  return (
    <div className="rounded-md max-w-sm w-full mx-auto">
      <div className="flex-1 space-y-4 py-1">
        <div className="sm:block">
          <div className="space-y-1 px-5 pt-2 pb-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  item.current ? 'text-black hover:opacity-100' : 'hover:text-black hover:opacity-100',
                  'px-2 py-1 text-lg font-normal opacity-75 block'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4"></div>
            {!isAuthenticated && (
              <>
                <button className="bg-white w-full text-blue border border-lightblue font-medium py-2 px-4 rounded">
                  Sign In
                </button>
                <button className="bg-lightblue w-full hover:bg-blue hover:text-white text-blue font-medium my-2 py-2 px-4 rounded">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Data;