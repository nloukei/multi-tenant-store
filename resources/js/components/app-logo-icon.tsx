import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M 15 15 H 65 V 35 H 48 V 90 H 32 V 35 H 15 Z"
                fill="currentColor"
            />
            <circle cx="80" cy="70" r="14" fill="#c084fc" />
        </svg>
    );
}
