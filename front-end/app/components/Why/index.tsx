'use client'

import { useEffect, useState } from "react";
import { blob } from "stream/consumers";
import { error } from "console";

interface whydata {
    heading: string;
    subheading: string;
}

const whydata: whydata[] = [
    {
        heading: "Quality",
        subheading: "Follow a hashtag growth total posts, videos and images.more revitions",
    },
    {
        heading: "Communication",
        subheading: "Follow a hashtag growth total posts, videos and images.more revitions",
    },
    {
        heading: "Reliability",
        subheading: "Follow a hashtag growth total posts, videos and images.more revitions",
    }
]

const Why = () => {

    const [imageSrc, setImageSrc] = useState<string | null>(null);

    // Fetching image from the backend
    useEffect(() => {
        fetch("http://localhost:8081/api/v1/capture/image/67bef32b8b33e92930cfc52b")
        .then((response) => response.blob())
        .then((blob) => {
            const imageUrl = URL.createObjectURL(blob);
            setImageSrc(imageUrl);
        })
        .catch((error) => console.error("Error fetching image:", error));
    }, []);

    return (
        <div id="about">

            <div className='mx-auto max-w-7xl px-4 my-20 sm:py-20 lg:px-8'>
                <div className='grid grid-cols-1 lg:grid-cols-2'>

                    {/* COLUMN-1 */}
                    <div className="relative lg:-ml-64">
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt="Fetched Image from Backend"
                                style={{ width: '100%', height: 'auto' }}
                            />
                        ) : (
                            <p>Loading image...</p> // Show a loading message until the image is fetched
                        )}
                    </div>

                    {/* COLUMN-2 */}
                    <div>
                        <h3 className="text-4xl lg:text-5xl pt-4 font-semibold sm:leading-tight mt-5 text-center lg:text-start">Why we best?</h3>
                        <h4 className="text-lg pt-4 font-normal sm:leading-tight text-center text-beach lg:text-start">Don't waste time on search manual tasks. Let Automation do it for you. Simplify workflows, reduce errors, and save time.</h4>

                        <div className="mt-10">
                            {whydata.map((items, i) => (
                                <div className="flex mt-4" key={i}>
                                    <div className="rounded-full h-10 w-12 flex items-center justify-center bg-circlebg">
                                        <img src="/assets/why/check.svg" alt="check-image" width={24} height={24} />
                                    </div>
                                    <div className="ml-5">
                                        <h4 className="text-2xl font-semibold">{items.heading}</h4>
                                        <h5 className="text-lg text-beach font-normal mt-2">{items.subheading}</h5>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </div>

        </div>
    )
}

export default Why;
