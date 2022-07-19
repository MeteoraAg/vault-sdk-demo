import { FC } from 'react';
import Link from "next/link";
import dynamic from 'next/dynamic';

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAutoConnect } from '../contexts/AutoConnectProvider';
import NetworkSwitcher from './NetworkSwitcher';
import { useNetworkConfiguration } from 'contexts/NetworkConfigurationProvider';

const WalletAndSettingsNoSSR = dynamic(() => Promise.resolve(WalletAndSettings), {
  ssr: false
})

const WalletAndSettings: FC = ({ }) => {
  const { autoConnect, setAutoConnect } = useAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();

  return (
    <div className='flex'>
      <WalletMultiButton className="btn btn-ghost" />

      <div className="dropdown dropdown-end flex">
        <div tabIndex={0} className="btn btn-ghost text-right flex items-center space-x-2">
          <span>{networkConfiguration}</span>
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <ul tabIndex={0} className="p-2 shadow menu dropdown-content bg-base-100 rounded-box sm:w-52">
          <li>
            <div className="form-control">
              <label className="cursor-pointer label">
                <a>Autoconnect</a>
                <input type="checkbox" checked={autoConnect} onChange={(e) => setAutoConnect(e.target.checked)} className="toggle" />
              </label>

              <NetworkSwitcher />
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export const AppBar: FC = props => {
  return (
    <div className='justify-between flex h-16 w-full'>
      {/* NavBar / Header */}
      <div className="w-full flex justify-between items-center md:mb-2 shadow-lg bg-neutral text-neutral-content">
        <div className="">
          <label htmlFor="my-drawer" className="btn btn-square btn-ghost">

            <svg className="inline-block w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
        </div>

        {/* Nav Links */}
        <div className="hidden md:inline">
          <div className="flex space-x-2 items-center">
            <div>
              <svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_4706_2718)">
                  <path d="M33.8961 0C25.5082 0.66173 16.8789 1.68116 10.6774 5.40115C0.979472 11.2136 -0.393161 18.0366 0.0807805 22.5793C1.28799 15.2824 8.99178 10.4222 22.6601 8.41918C25.0866 8.0647 27.3859 7.10865 29.3485 5.63812C31.311 4.1676 32.8743 2.22935 33.8961 0Z" fill="#29DBAE" />
                  <path d="M24.4921 16.5073C11.7538 17.6341 4.37192 21.1394 2.50298 26.9251C2.32696 27.4924 2.28462 28.0928 2.37925 28.6792C2.47388 29.2656 2.70292 29.8221 3.04846 30.3053C3.16918 30.4752 3.28991 30.6451 3.4151 30.8105C3.43534 30.5051 3.49855 30.2041 3.60288 29.9163C4.38086 27.7254 7.36312 25.861 11.9952 24.6538C16.9461 23.3927 21.3403 20.5282 24.4921 16.5073Z" fill="#6580E0" />
                  <path d="M5.94142 31.2934C10.6004 29.7643 14.5171 27.4885 17.5932 24.5151C9.33055 25.5301 5.42724 27.9713 4.52854 29.9878C4.37751 30.3016 4.30095 30.646 4.30483 30.9942C4.30871 31.3424 4.39292 31.685 4.5509 31.9954C4.96976 31.6818 5.44041 31.4442 5.94142 31.2934Z" fill="#6A4DC8" />
                  <path d="M18.2426 16.4C20.5928 15.977 22.8272 15.0625 24.7996 13.7165C26.7721 12.3704 28.4381 10.6231 29.6887 8.58887C18.8283 9.28637 1.52051 12.2373 0.831949 23.9294C0.767171 25.1327 0.973451 26.3352 1.43556 27.4482C2.72325 21.8726 8.36583 18.1571 18.2426 16.4Z" fill="#30B7D2" />
                </g>
                <defs>
                  <clipPath id="clip0_4706_2718">
                    <rect width="33.8958" height="32" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>

            <Link href="/">
              <a className="btn btn-ghost btn-xs rounded-btn">Home</a>
            </Link>

            <Link href="https://vaults.mercurial.finance">
              <a target={'_blank'} className="btn btn-ghost btn-xs rounded-btn">Visit Mercurial Finance</a>
            </Link>

            <Link href="/affiliate">
              <a className="btn btn-ghost btn-xs rounded-btn">Affiliate demo</a>
            </Link>
          </div>
        </div>

        {/* Wallet & Settings */}
        <WalletAndSettingsNoSSR />
      </div>
      {props.children}
    </div>
  );
};
