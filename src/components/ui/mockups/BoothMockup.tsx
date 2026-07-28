import React, { memo } from "react";
import LenovoLaptop from "./LaptopMockup";
import PhoneMockup3D from "./PhoneMockup";

interface BoothMockupProps {
    laptopImage?: string[];
    phoneImages?: string[];
    alt?: string;
    className?: string;
}

const BoothMockup: React.FC<BoothMockupProps> = ({
    laptopImage,
    phoneImages = [],
    alt = "Project preview",
    className = "",
}) => {
    return (
        <div
            className={`booth-wrapper ${className} relative justify-center items-center h-[40%] min-h-[400px]  sm:h-[450px]`}
        >
            {/* Laptop — base layer */}
            <div
                className="z-1 relative pointer-events-none 
                w-[90%] max-w-[450] -right-2
                sm:w-[450px] sm:right-1 
                md:right-16 
                left-0
                  xl:w-[380px] xl:pl-0
                  xl:right-40 
                  2xl:w-[400px]
                  "

            >
                <LenovoLaptop screenImage={laptopImage} alt={alt} />
            </div>

            <div
                style={{
                    zIndex: 2,
                    // transform: "translateY(-50%)",
                    filter: "drop-shadow(-10px 15px 25px rgba(0,0,0,0.5))",
                }}
                className="z-40 absolute 
                w-[40%] top-28 -right-[2%] 
                sm:w-[170px] sm:left-80 
                md:left-96
                lg:top-40 lg:left-[65%]
                xl:w-[180px]  xl:left-[60%]
                2xl:w-[200px] 
                  "
            >
                <PhoneMockup3D images={phoneImages} />
            </div>
        </div>
    );
};

export default memo(BoothMockup);