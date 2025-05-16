"use client";

import React from "react";

interface IconProps {
  className?: string;
}

export const IconCar = ({ className = "" }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2m2 4h12a2 2 0 002-2v-3H2v3a2 2 0 002 2z" />
      <circle cx="6.5" cy="16.5" r="1.5" />
      <circle cx="16.5" cy="16.5" r="1.5" />
    </svg>
  );
};

export const IconTruck = ({ className = "" }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 16.5v-11a1.5 1.5 0 011.5-1.5h7a1.5 1.5 0 011.5 1.5v9.5M2 16.5h18.5M18.5 16.5a2 2 0 104 0M18.5 9.5h4v4" />
      <circle cx="6.5" cy="16.5" r="2" />
      <circle cx="14.5" cy="16.5" r="2" />
    </svg>
  );
};

export const IconTools = ({ className = "" }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      <path d="M9 12l-1.5 1.5M8 9l-2-2M12 12l1.5 1.5M14.5 17.5L16 16" />
    </svg>
  );
};

export const IconChart = ({ className = "" }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17l-3-5-4 3-5-5" />
    </svg>
  );
};

export const IconCalendar = ({ className = "" }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
};

export function IconBrain(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

export function IconCode(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function IconDatabase(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function IconRocket(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function IconPolicy(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
      <path d="M9 15l2 2l4 -4" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

export function IconLeaf(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M19.0278 19.1444L18.5856 19.5865C17.2198 20.9524 12.169 21.42 7.12737 16.3783C2.08571 11.3366 2.54395 6.29488 3.91895 4.91988L4.36908 4.46975C5.08489 3.75395 6.27618 3.87238 6.83771 4.71465L8.68952 7.49229C9.1137 8.12855 9.02981 8.97577 8.48908 9.51648L7.52792 10.4776C7.28239 10.7231 7.20015 11.0855 7.36041 11.3935C7.65256 11.955 8.26197 12.9296 9.41904 14.0866C10.5761 15.2437 11.5505 15.8531 12.112 16.1452C12.42 16.3054 12.7824 16.2232 13.0279 15.9777L13.989 15.0165C14.5297 14.4758 15.3769 14.392 16.0132 14.8161L18.7815 16.6616C19.6286 17.2263 19.7477 18.4245 19.0278 19.1444Z"
        fill="white"
      />
    </svg>
  );
}
export function IconPlugCar(props: IconProps) {
  return (
    <svg width="123" height="123" viewBox="0 0 123 123" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M28.0361 122.33C21.0021 122.33 15.2934 116.621 15.2934 109.587C15.2934 102.553 21.0021 96.8447 28.0361 96.8447C35.0701 96.8447 40.7788 102.553 40.7788 109.587C40.7788 116.621 35.0701 122.33 28.0361 122.33ZM28.0361 101.942C23.831 101.942 20.3905 105.382 20.3905 109.587C20.3905 113.793 23.831 117.233 28.0361 117.233C32.2412 117.233 35.6817 113.793 35.6817 109.587C35.6817 105.382 32.2412 101.942 28.0361 101.942Z"
        fill="white"
      />
      <path
        d="M84.1041 122.33C77.0701 122.33 71.3614 116.621 71.3614 109.587C71.3614 102.553 77.0701 96.8447 84.1041 96.8447C91.1381 96.8447 96.8468 102.553 96.8468 109.587C96.8468 116.621 91.1381 122.33 84.1041 122.33ZM84.1041 101.942C79.899 101.942 76.4585 105.382 76.4585 109.587C76.4585 113.793 79.899 117.233 84.1041 117.233C88.3092 117.233 91.7497 113.793 91.7497 109.587C91.7497 105.382 88.3092 101.942 84.1041 101.942Z"
        fill="white"
      />
      <path d="M73.9099 107.039H38.2303V112.136H73.9099V107.039Z" fill="white" />
      <path
        d="M109.59 112.135H94.2983V107.038H106.965C106.659 102.935 105.41 94.6522 100.185 89.3002C96.8468 85.8597 92.2849 84.1267 86.6526 84.1267C85.2764 84.1267 84.1551 83.0308 84.1041 81.6801C84.0786 80.8645 82.8808 61.1898 56.0701 61.1898C31.8844 61.1898 28.138 81.1449 28.0106 82.0114C27.8067 83.2347 26.7363 84.1267 25.4875 84.1267C19.8552 84.1267 15.3188 85.8597 11.9548 89.3002C6.73024 94.6777 5.48145 102.96 5.17563 107.064H17.8419V112.161H2.55062C1.17441 112.161 0.0530478 111.065 0.00207685 109.689C0.00207685 109.077 -0.35472 94.6777 8.28485 85.7832C12.2096 81.731 17.3322 79.4883 23.4742 79.106C25.2582 73.0915 32.3941 56.1182 56.0446 56.1182C81.9888 56.1182 87.6466 72.8111 88.8444 79.1315C94.9099 79.5648 99.9306 81.8075 103.83 85.8087C112.469 94.7031 112.138 109.102 112.113 109.714C112.062 111.09 110.94 112.186 109.564 112.186L109.59 112.135Z"
        fill="white"
      />
      <path
        d="M109.59 25.4855H101.944C99.4208 25.4855 91.7497 25.4855 91.7497 12.7427C91.7497 0 99.4208 0 101.944 0H109.59C110.991 0 112.138 1.14685 112.138 2.54855V22.9369C112.138 24.3386 110.991 25.4855 109.59 25.4855ZM101.944 5.09709C99.5483 5.09709 96.8468 5.09709 96.8468 12.7427C96.8468 20.3884 99.5483 20.3884 101.944 20.3884H107.041V5.09709H101.944Z"
        fill="white"
      />
      <path
        d="M119.784 10.1943H109.59C108.188 10.1943 107.041 9.04741 107.041 7.64571C107.041 6.24401 108.188 5.09717 109.59 5.09717H119.784C121.185 5.09717 122.332 6.24401 122.332 7.64571C122.332 9.04741 121.185 10.1943 119.784 10.1943Z"
        fill="white"
      />
      <path
        d="M119.784 20.3886H109.59C108.188 20.3886 107.041 19.2418 107.041 17.84C107.041 16.4383 108.188 15.2915 109.59 15.2915H119.784C121.185 15.2915 122.332 16.4383 122.332 17.84C122.332 19.2418 121.185 20.3886 119.784 20.3886Z"
        fill="white"
      />
      <path
        d="M109.59 25.4855H101.944C99.4208 25.4855 91.7497 25.4855 91.7497 12.7427C91.7497 0 99.4208 0 101.944 0H109.59C110.991 0 112.138 1.14685 112.138 2.54855V22.9369C112.138 24.3386 110.991 25.4855 109.59 25.4855ZM101.944 5.09709C99.5483 5.09709 96.8468 5.09709 96.8468 12.7427C96.8468 20.3884 99.5483 20.3884 101.944 20.3884H107.041V5.09709H101.944Z"
        fill="white"
      />
      <path
        d="M119.784 10.1943H109.59C108.188 10.1943 107.041 9.04741 107.041 7.64571C107.041 6.24401 108.188 5.09717 109.59 5.09717H119.784C121.185 5.09717 122.332 6.24401 122.332 7.64571C122.332 9.04741 121.185 10.1943 119.784 10.1943Z"
        fill="white"
      />
      <path
        d="M119.784 20.3886H109.59C108.188 20.3886 107.041 19.2418 107.041 17.84C107.041 16.4383 108.188 15.2915 109.59 15.2915H119.784C121.185 15.2915 122.332 16.4383 122.332 17.84C122.332 19.2418 121.185 20.3886 119.784 20.3886Z"
        fill="white"
      />
      <path
        d="M105.996 95.7486C104.926 95.7486 103.957 95.086 103.575 94.0156C103.116 92.6904 103.83 91.2377 105.155 90.779C112.367 88.3069 117.235 81.5277 117.235 73.8821C117.235 61.2413 106.939 50.9452 94.2983 50.9452H86.6526C75.4135 50.9452 66.2643 41.7959 66.2643 30.5568C66.2643 19.3177 75.4135 10.1685 86.6526 10.1685H94.2983C95.7 10.1685 96.8468 11.3153 96.8468 12.717C96.8468 14.1187 95.7 15.2655 94.2983 15.2655H86.6526C78.2169 15.2655 71.3614 22.1211 71.3614 30.5568C71.3614 38.9925 78.2169 45.8481 86.6526 45.8481H94.2983C109.768 45.8481 122.332 58.4124 122.332 73.8821C122.332 83.694 116.088 92.4355 106.812 95.5957C106.531 95.6976 106.251 95.7231 105.996 95.7231V95.7486Z"
        fill="white"
      />
    </svg>
  );
}
