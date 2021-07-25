import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../public/logo.png'

const Layout: React.FC = function ({ children }) {
  return <div>
      <Link href="/">
        <a className="logo">
            <Image src={logo} alt="logo" />
        </a>
      </Link>
      {children}</div>;
};

export default Layout;
