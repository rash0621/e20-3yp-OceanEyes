import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import { domainName } from "../DomainName"

const AddInstance = () => {
    let [isOpen, setIsOpen] = useState(false)

    // State variables for the form data
    const [deviceName, setDeviceName] = useState("");
    const [startGpsLocation, setStartGpsLocation] = useState("");
    const [distanceBetweenPoints, setDistanceBetweenPoints] = useState(0);
    const [map, setMap] = useState(0);
    const [description, setDescription] = useState("");
    const [operator, setOperator] = useState("");
    const [locationDistrict, setLocationDistrict] = useState("");

    const closeModal = () => {
        setIsOpen(false)
    }

    const openModal = () => {
        setIsOpen(true)
    }

    const handleStartDevice = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        // Create FormData object
        const formData = new FormData();
        formData.append("deviceName", deviceName);
        formData.append("startGpsLocation", startGpsLocation);
        formData.append("distanceBetweenPoints", distanceBetweenPoints.toString());
        formData.append("map", map.toString());
        formData.append("description", description);
        formData.append("operator", operator);
        formData.append("locationDistrict", locationDistrict);
    
        try {
            const response = await fetch(`${domainName}instance/save`, {
                method: "POST",
                body: formData, // No need for headers, FormData sets them automatically
            });
    
            const data = await response.json();
            console.log(data);
    
            if (response.ok) {
                alert(data.message);
                closeModal();
                window.location.reload();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Device start failed:", error);
        }
    };
    

    return (
        <>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto  sm:pr-0">
                <div className='hidden lg:block'>
                    <button
                        className='text-15px ml-4 mt-2 text-blue transition duration-150 ease-in-out hover:text-white hover:bg-blue font-medium py-5 px-16 border border-lightgrey leafbutton my-10'
                        onClick={openModal}
                    >
                        Start a Device
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
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">

                                    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                                        <div className="w-full max-w-md space-y-8">
                                            <div>
                                                {/* <img
                                                    className="mx-auto h-12 w-auto"
                                                    src="/assets/logo/logo.png"
                                                    alt="Your Company"
                                                /> */}
                                                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                                                    Enter Instance Details
                                                </h2>
                                            </div>
                                            <form onSubmit={handleStartDevice} className="mt-8 space-y-6" action="#" method="POST">
                                                <input type="hidden" name="remember" defaultValue="true" />
                                                <div className="-space-y-px rounded-md shadow-sm">
                                                    <div>
                                                        <label htmlFor="deviceName" className="sr-only">
                                                            Device Name
                                                        </label>
                                                        <input
                                                            id="deviceName"
                                                            name="deviceName"
                                                            type="text"
                                                            required
                                                            className="relative block w-full appearance-none rounded-none rounded-t-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Device Name"
                                                            value={deviceName}
                                                            onChange={(e) => setDeviceName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="startGpsLocation" className="sr-only">
                                                            Start GPS Location
                                                        </label>
                                                        <input
                                                            id="startGpsLocation"
                                                            name="startGpsLocation"
                                                            type="text"
                                                            required
                                                            className="relative block w-full appearance-none rounded-none rounded-b-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Start GPS Location"
                                                            value={startGpsLocation}
                                                            onChange={(e) => setStartGpsLocation(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="distanceBetweenPoints" className="sr-only">
                                                            Distance Between Points
                                                        </label>
                                                        <input
                                                            id="distanceBetweenPoints"
                                                            name="distanceBetweenPoints"
                                                            type="number"
                                                            required
                                                            className="relative block w-full appearance-none rounded-none rounded-b-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Distance Between Points"
                                                            value={distanceBetweenPoints}
                                                            onChange={(e) => setDistanceBetweenPoints(Number(e.target.value))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="map" className="sr-only">
                                                            Map
                                                        </label>
                                                        <input
                                                            id="map"
                                                            name="map"
                                                            type="number"
                                                            required
                                                            className="relative block w-full appearance-none rounded-none rounded-b-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Map"
                                                            value={map}
                                                            onChange={(e) => setMap(Number(e.target.value))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="description" className="sr-only">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            id="description"
                                                            name="description"
                                                            required
                                                            className="relative block w-full appearance-none rounded-none rounded-b-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Description"
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="operator" className="sr-only">
                                                            Operator
                                                        </label>
                                                        <input
                                                            id="operator"
                                                            name="operator"
                                                            type="text"
                                                            required
                                                            className="relative block w-full appearance-none rounded-none rounded-b-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Operator"
                                                            value={operator}
                                                            onChange={(e) => setOperator(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="locationDistrict" className="sr-only">
                                                            Location District
                                                        </label>
                                                        <input
                                                            id="locationDistrict"
                                                            name="locationDistrict"
                                                            type="text"
                                                            required
                                                            className="relative block w-full appearance-none rounded-none rounded-b-md border border-grey500 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Location District"
                                                            value={locationDistrict}
                                                            onChange={(e) => setLocationDistrict(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <button
                                                        type="submit"
                                                        onClick={() => console.log("Start Device button clicked")}
                                                        className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    >
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                            <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                                                        </span>
                                                        Start Device
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

export default AddInstance;
