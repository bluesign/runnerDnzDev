import React  from 'react';
import Link from 'next/link';

const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-[#1f1f1f] text-[#f4f4f4] m-0 p-0 font-sans">
      <div className="flex justify-center justify-items-center fixed inset-0 flex-row-reverse bg-[#1f1f1f] text-[#f4f4f4]">
        <div className="self-center w-full max-w-[480px]">
          <h1 className="font-mono font-bold text-[6rem] m-0 mb-8 p-0 block [filter:url(#chromatic-aberration)]">
            404!
          </h1>
          <h2 className="m-0 p-0 block text-4xl">Page Not Found</h2>
          <div className="my-4 text-[#999]">
            <p className="m-0 mb-[0.3rem] p-0">
              Requested page does not exist or was deleted.
            </p>
            <p className="m-0 mb-[0.3rem] p-0">
              That's all we know 🤷
            </p>
          </div>
          <div className="mt-16 flex justify-end gap-4">
            <Link href="/" className="border-none no-underline py-2 px-4 text-[#f4f4f4] bg-[#005A9C] rounded-sm hover:bg-[#00498B]">
              Go To Home
            </Link>
          </div>
        </div>
      </div>
      <svg width="0" height="0">
        <filter id="chromatic-aberration">
          <feColorMatrix type="matrix" result="red_"
                         values="4 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/>
          <feOffset in="red_" dx="2" dy="0" result="red"/>
          <feColorMatrix type="matrix" in="SourceGraphic" result="blue_"
                         values="0 0 0 0 0 0 3 0 0 0 0 0 10 0 0 0 0 0 1 0"/>
          <feOffset in="blue_" dx="-3" dy="0" result="blue"/>
          <feBlend mode="screen" in="red" in2="blue"/>
        </filter>
      </svg>
    </div>
  );
};

export default NotFoundPage;
