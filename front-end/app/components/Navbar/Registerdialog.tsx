import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/20/solid';
import { domainName } from "../DomainName";
import { passwordStrength } from 'check-password-strength';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Register = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [customerID, setCustomerID] = useState("");

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [deviceID, setDeviceID] = useState("");
    const [addedDevices, setAddedDevices] = useState<string[]>([]);

    // Message state for success/error notifications
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
    const [showNextButton, setShowNextButton] = useState(false);

    const strength = passwordStrength(password);

    const closeModal = () => {
        setIsOpen(false);
        resetState();
    };

    const openModal = () => setIsOpen(true);

    const resetState = () => {
        setStep(1);
        setEmail(""); setPhone(""); setCustomerID("");
        setPassword(""); setShowPassword(false);
        setDeviceID(""); setAddedDevices([]);
        setMessage(""); setMessageType('');
        setShowNextButton(false);
    };

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage(text);
        setMessageType(type);
        
        if (type === 'success' && step < 3) {
            setShowNextButton(true);
        } else {
            // Auto-clear error messages after 5 seconds
            if (type === 'error') {
                setTimeout(() => {
                    setMessage("");
                    setMessageType('');
                }, 5000);
            }
        }
    };

    const goToNextStep = () => {
        setStep(step + 1);
        setMessage("");
        setMessageType('');
        setShowNextButton(false);
    };

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    const verifyCustomerDetails = async () => {
        if (!email || !phone || !customerID) {
            showMessage("Please fill in all fields.", 'error');
            return;
        }

        try {
            const response = await fetch(`${domainName}admin-customer-registry/verify-customer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, phone, customerID })
            });
            const data = await response.json();

            if (response.ok) {
                showMessage("User credentials verified successfully.", 'success');
            } else {
                showMessage(data.message || "Verification failed. Please try again.", 'error');

            }
        } catch (err) {
            console.error("Verification error:", err);
            showMessage("Network error. Please check your connection and try again.", 'error');
        }
    };
    
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Allow only Medium and Strong passwords
    if (strength.value === 'Too weak' || strength.value === 'Weak') {
        showMessage("Password is too weak. Please use at least a medium-strength password.", 'error');
        return;
    }

    try {
        // Step 1: Fetch AdminCustomerRegistry entry by email
        const registryResponse = await fetch(`${domainName}admin-customer-registry/getByEmail?email=${encodeURIComponent(email)}`);
        
        if (!registryResponse.ok) {
            showMessage("This email is not pre-approved by the admin. Please contact support.", 'error');
            return;
        }

        const adminData = await registryResponse.json();

        // Step 2: Prepare user data from adminData
        const userPayload = {
            userEmail: adminData.email,
            phone: adminData.phone,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            username: adminData.username,
            organization: adminData.organization,
            address: adminData.address,
            userPassword: password,
            customerID: adminData.id, // Assigning admin's id as customerID
            numberOfDevicePurchased: adminData.numberOfDevicePurchased
        };

        // Step 3: Send POST request to register the user
        const registerResponse = await fetch(`${domainName}user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userPayload),
        });

        const data = await registerResponse.json();

        if (registerResponse.ok) {
            localStorage.setItem("jwtToken", data.data);
            showMessage("Account created successfully!", 'success');
        } else {
            showMessage(data.message || "Registration failed. Please try again.", 'error');
        }

    } catch (err) {
        console.error("Register failed:", err);
        showMessage("Network error. Please check your connection and try again.", 'error');
    }
};

    const addDevice = async () => {
        if (!deviceID.trim()) {
            showMessage("Please enter a device ID.", 'error');
            return;
        }

        try {
            const jwtToken = localStorage.getItem("jwtToken");
            if (!jwtToken) {
                showMessage("Authentication token missing. Please register again.", 'error');
                return;
            }

            // Step 1: Get user ID
            const userIdResponse = await fetch(`${domainName}user/me/userID`, {
                headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                },
            });

            if (!userIdResponse.ok) {
                showMessage("Failed to fetch user ID. Please try again.", 'error');
                return;
            }

            const userIdJson = await userIdResponse.json();
            const userId = userIdJson.data;

            // Step 2: Send device registration as JSON body
            const registerDeviceResponse = await fetch(`${domainName}user/registerUserDevice`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({
                    deviceId: deviceID,
                    userId: userId,
                }),
            });

            if (registerDeviceResponse.ok) {
                setAddedDevices([...addedDevices, deviceID]);
                setDeviceID("");
                showMessage("Device registered successfully!", 'success');
            } else {
                const errorData = await registerDeviceResponse.json().catch(() => null);
                const errorMessage = errorData?.message || "Failed to register device. Please try again.";
                showMessage(errorMessage, 'error');
            }
        } catch (err) {
            console.error("Add device error:", err);
            showMessage("Network error. Please check your connection and try again.", 'error');
        }
    };

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
                        onClick={openModal}
                    >
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

                                            {step === 1 && (
                                                <>
                                                    <div>
                                                        <img
                                                            className="mx-auto h-20 w-auto"
                                                            src="/assets/signin/regi.png"
                                                            alt="Your Company"
                                                        />
                                                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                                                            Verify your details
                                                        </h2>
                                                    </div>
                                                    <div className="mt-8 space-y-6">
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
                                                                <label htmlFor="phone" className="sr-only">
                                                                    Phone Number
                                                                </label>
                                                                <input
                                                                    id="phone"
                                                                    name="phone"
                                                                    type="text"
                                                                    required
                                                                    className="relative block w-full appearance-none rounded-none border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                                    placeholder="Phone Number"
                                                                    value={phone}
                                                                    onChange={(e) => setPhone(e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="customer-id" className="sr-only">
                                                                    Customer ID
                                                                </label>
                                                                <input
                                                                    id="customer-id"
                                                                    name="customer-id"
                                                                    type="text"
                                                                    required
                                                                    className="relative block w-full appearance-none rounded-none rounded-b-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                                    placeholder="Customer ID"
                                                                    value={customerID}
                                                                    onChange={(e) => setCustomerID(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <button
                                                                type="button"
                                                                onClick={verifyCustomerDetails}
                                                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue py-2 px-4 text-sm font-medium text-white hover:bg-darkblue focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                            >
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                                    <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                                                                </span>
                                                                Confirm Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {step === 2 && (
                                                <>
                                                    <div>
                                                        <img
                                                            className="mx-auto h-20 w-auto"
                                                            src="/assets/signin/regi.png"
                                                            alt="Your Company"
                                                        />
                                                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                                                            Create your password
                                                        </h2>
                                                    </div>
                                                    <form onSubmit={handleRegister} className="mt-8 space-y-6">
                                                        <input type="hidden" name="remember" defaultValue="true" />
                                                        <div className="-space-y-px rounded-md shadow-sm">
                                                            <div>
                                                                <label htmlFor="password" className="sr-only">
                                                                    Password
                                                                </label>
                                                                <div className="relative">
                                                                    <input
                                                                        id="password"
                                                                        name="password"
                                                                        type={showPassword ? 'text' : 'password'}
                                                                        autoComplete="new-password"
                                                                        required
                                                                        className="relative block w-full appearance-none rounded-md border border-grey500 px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
                                                </>
                                            )}

                                            {step === 3 && (
                                                <>
                                                    <div>
                                                        <img
                                                            className="mx-auto h-20 w-auto"
                                                            src="/assets/signin/regi.png"
                                                            alt="Your Company"
                                                        />
                                                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                                                            Add your devices
                                                        </h2>
                                                    </div>
                                                    <div className="mt-8 space-y-6">
                                                        <div className="-space-y-px rounded-md shadow-sm">
                                                            <div>
                                                                <label htmlFor="device-id" className="sr-only">
                                                                    Device ID
                                                                </label>
                                                                <input
                                                                    id="device-id"
                                                                    name="device-id"
                                                                    type="text"
                                                                    className="relative block w-full appearance-none rounded-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                                    placeholder="Enter Device ID"
                                                                    value={deviceID}
                                                                    onChange={(e) => setDeviceID(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={addDevice}
                                                                className="group relative flex justify-center rounded-md border border-transparent bg-blue py-2 px-4 text-sm font-medium text-white hover:bg-darkblue focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                            >
                                                                Add Device
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={closeModal}
                                                                className="group relative flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                            >
                                                                Done
                                                            </button>
                                                        </div>
                                                        {addedDevices.length > 0 && (
                                                            <div className="mt-4">
                                                                <p className="text-sm font-medium text-gray-900 mb-2">Added devices:</p>
                                                                <ul className="text-sm text-gray-600 space-y-1">
                                                                    {addedDevices.map((id, index) => (
                                                                        <li key={index} className="flex items-center">
                                                                            <span className="text-green-600 mr-2">✔</span>
                                                                            {id}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                        </div>
                                    </div>

                                    {/* Message display in the center */}
                                    {message && (
                                        <div className="mt-4 flex justify-center">
                                            <div className={`flex items-center space-x-2 text-sm font-medium ${
                                                messageType === 'success' 
                                                    ? 'text-green-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {messageType === 'success' ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                <span>{message}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="mt-4 flex justify-end gap-2">
                                        {showNextButton ? (
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-black hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                onClick={goToNextStep}
                                            >
                                                Next
                                            </button>
                                        ) : step === 3 ? (
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-black hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                onClick={closeModal}
                                            >
                                                Done
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                onClick={closeModal}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default Register;