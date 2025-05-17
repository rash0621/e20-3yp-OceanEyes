import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import { domainName } from "../DomainName"
import { passwordStrength } from 'check-password-strength'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Register = () => {
    let [isOpen, setIsOpen] = useState(false)
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");


    const closeModal = () => setIsOpen(false)
    const openModal = () => setIsOpen(true)

    const strength = passwordStrength(password);

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Allow only Medium and Strong passwords
        if (strength.value === 'Too weak' || strength.value === 'Weak') {
            alert("Password is too weak. Please use at least a medium-strength password.");
            return;
        }

        try {
            const response = await fetch(`${domainName}user/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ "userEmail": email, "userPassword": password }),
            });

            const data = await response.json();
            console.log(data);
            if (response.ok) {
                localStorage.setItem("user_token", data.data);
                alert(data.message);
                closeModal();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Register failed:", error);
        }
    }

    const getStrengthColor = (value: string) => {
        switch (value) {
            case 'Too weak': return 'text-red-600';
            case 'Weak': return 'text-yellow-600';
            case 'Medium': return 'text-blue-600';
            case 'Strong': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:pr-0">
                <div className='hidden lg:block'>
                    <button
                        className="text-blue text-lg font-medium ml-9 py-5 px-16 transition duration-150 ease-in-out leafbutton bg-lightblue hover:text-white hover:bg-blue"
                        onClick={openModal}>
                        Register
                    </button>
                </div>
            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                                        <div className="w-full max-w-md space-y-8">
                                            <div>
                                                <img
                                                    className="mx-auto h-20 w-auto"
                                                    src="/assets/signin/regi.png"
                                                    alt="Your Company"
                                                />
                                                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                                                    Register your account
                                                </h2>
                                            </div>
                                            <form onSubmit={handleRegister} className="mt-8 space-y-6">
                                                <input type="hidden" name="remember" defaultValue="true" />
                                                <div className="-space-y-px rounded-md shadow-sm">
                                                    <div>
                                                        <label htmlFor="email-address" className="sr-only">
                                                            Email address
                                                        </label>
                                                        <input
                                                            id="email-address"
                                                            name="email"
                                                            type="email"
                                                            autoComplete="email"
                                                            required
                                                            className="relative block w-full appearance-none rounded-none rounded-t-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Email address"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="password" className="sr-only">
                                                            Password
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                id="password"
                                                                name="password"
                                                                type={showPassword ? 'text' : 'password'}
                                                                autoComplete="current-password"
                                                                required
                                                                className="block w-full appearance-none rounded-none rounded-b-md border border-grey500 px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                                placeholder="Password"
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                            />
                                                        <span
                                                            onClick={togglePasswordVisibility}
                                                            style={{
                                                            position: 'absolute',
                                                            right: '0.75rem',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            cursor: 'pointer',
                                                            color: '#666',
                                                            zIndex: 20,  
                                                            }}
                                                            className="text-gray-500"
                                                            >
                                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                        </span>
                                                        </div>
                                                        {password && (
                                                            <div className="mt-2">
                                                                <p className={`text-sm font-medium ${getStrengthColor(strength.value)}`}>
                                                                    Password strength: {strength.value}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Password must be at least 10 characters and include uppercase, lowercase, a number, and a symbol.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <input
                                                            id="remember-me"
                                                            name="remember-me"
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                                            Remember me
                                                        </label>
                                                    </div>
                                                </div>

                                                <div>
                                                    <button
                                                        type="submit"
                                                        disabled={strength.value === 'Too weak' || strength.value === 'Weak'}
                                                        className={`group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                                                            ${(strength.value === 'Medium' || strength.value === 'Strong') ? 'bg-blue hover:bg-darkblue' : 'bg-gray-400 cursor-not-allowed'}`}
                                                    >
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                            <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                                                        </span>
                                                        Register Now
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default Register;
