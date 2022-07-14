import { FC } from 'react';
import Link from "next/link";
export const ContentContainer: FC = props => {

  return (
    <div className="flex-1 drawer h-52">
      {/* <div className="h-screen drawer drawer-mobile w-full"> */}
      <input id="my-drawer" type="checkbox" className="grow drawer-toggle" />
      <div className="items-center  drawer-content">
        {props.children}
      </div>

      {/* SideBar / Drawer */}
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <ul className="p-4 overflow-y-auto menu w-80 bg-base-100">
          <li>
            <h1>Menu</h1>
          </li>
          <li>
            <Link href="/">
              <a className="btn btn-ghost btn-sm rounded-btn">Home</a>
            </Link>
          </li>

          <li>
            <Link href="https://vaults.mercurial.finance">
              <a target={'_blank'} className="btn btn-ghost btn-sm rounded-btn">Visit Mercurial Finance</a>
            </Link>
          </li>

          <li>
            <Link href="/affiliate">
              <a className="btn btn-ghost btn-sm rounded-btn">Affiliate demo</a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
