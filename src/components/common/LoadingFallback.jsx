import React from 'react';

const LoadingFallback = ({ message = "Chargement..." }) => {
    return (
        <div className="flex items-center justify-center py-fluid-xl">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-blue border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                    </span>
                </div>
                <p className="mt-4 text-brand-blue font-semibold text-fluid-body">{message}</p>
            </div>
        </div>
    );
};

export default LoadingFallback;
