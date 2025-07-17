import React, { useEffect, useState } from "react";
import Logout from "./Logout";
import Link from "next/link";
import { isTokenValid } from "../Authentications/tokenValidation";
import { domainName } from "../DomainName";


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
  { name: 'Device Management', href: '/device-management', current: false },
  { name: 'Statistics', href: '/Statistics', current: false },
  { name: 'Downloads', href: '/downloads', current: false },
  { name: 'Profile', href: '/profile', current: false },
];

const adminNavigation: NavigationItem[] = [
  { name: 'Add Customer', href: '/admin-addCustomer', current: false },
  { name: 'Inventory Customer', href: '/admin-inventoryCustomers', current: false },
  { name: 'Profile', href: '/profile', current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Data = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
              console.log('Fetched email:', email); // Debug log
              console.log('Email comparison result:', email === 'oceaneyessrilanka@gmail.com'); // Debug log
              setUserEmail(email);
              setIsAdmin(email === 'oceaneyessrilanka@gmail.com');
            } else {
              console.log('Failed to fetch email, response not ok'); // Debug log
              setUserEmail(null);
              setIsAdmin(false);
            }
          } catch (err) {
            console.log('Error fetching email:', err); // Debug log
            setUserEmail(null);
            setIsAdmin(false);
          }
        } else {
          console.log('No token found'); // Debug log
          setUserEmail(null);
          setIsAdmin(false);
        }
      } else {
        console.log('Token not valid'); // Debug log
        setUserEmail(null);
        setIsAdmin(false);
      }
    };
    fetchEmail();
  }, [isAuthenticated]);

  // Build navigation array based on user role (inside render for immediate update)
  const navigation: NavigationItem[] = React.useMemo(() => {
    console.log('Current state:', { isAuthenticated, userEmail, isAdmin }); // Debug log
    if (isAuthenticated && isAdmin) {
      // Admin gets: Home + filtered Auth items + Admin specific items, Profile last
      console.log('Building admin navigation'); // Debug log
      const filteredAuthNavigation = authNavigation.filter(item =>
        item.name !== 'View Map' &&
        item.name !== 'Device Management' &&
        item.name !== 'Downloads' &&
        item.name !== 'Profile'
      );
      const adminWithoutProfile = adminNavigation.filter(item => item.name !== 'Profile');
      const profileNav = authNavigation.find(item => item.name === 'Profile') || adminNavigation.find(item => item.name === 'Profile');
      return [homeNav, ...filteredAuthNavigation, ...adminWithoutProfile, ...(profileNav ? [profileNav] : [])];
    } else if (isAuthenticated) {
      // Regular authenticated users get: Home + Auth items, Profile last
      console.log('Building regular user navigation'); // Debug log
      const authWithoutProfile = authNavigation.filter(item => item.name !== 'Profile');
      const profileNav = authNavigation.find(item => item.name === 'Profile');
      return [homeNav, ...authWithoutProfile, ...(profileNav ? [profileNav] : [])];
    } else {
      // Guests get: Home + Guest items
      console.log('Building guest navigation'); // Debug log
      return [homeNav, ...guestNavigation];
    }
  }, [isAuthenticated, isAdmin, userEmail]);

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
            {isAuthenticated && (
              <div className="mt-2 text-left">
                <div className="inline-block w-full">
                  <Logout />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Data;