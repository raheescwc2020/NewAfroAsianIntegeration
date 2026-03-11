import React from 'react';
import Link from 'next/link'; // Changed from react-router-dom

const Footer = () => {
  return (
    <footer className="aan-footer">
      <div className="aan-footer-container">
        <div className="aan-footer-brand">
          <Link href="/">
            <img src="/assets/AFRO_LOGOOO.png" alt="AFRO Logo" className="aan-logo-img footer-logo-size" />
          </Link>
          <p className="aan-footer-tagline">
            Connecting Policy, Diplomacy, and Economy across the globe.
          </p>
        </div>

        <div className="aan-footer-links">
          <h4>Company & Legal</h4>
          <Link href="/about">About Us</Link>
          <Link href="/editorial-policy">Editorial Policy</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>

      <div className="aan-footer-bottom">
        <p>&copy; {new Date().getFullYear()} AFRO News. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;