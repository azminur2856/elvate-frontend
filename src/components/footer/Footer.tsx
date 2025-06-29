import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-8">
        {/* About */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">
            About ELVATE
          </h2>
          <p className="mb-4">
            ELVATE is your trusted platform for innovative digital services and
            secure online shopping in Bangladesh. Empowering creators,
            businesses, and everyday users with powerful tools and seamless
            e-commerce experiences—all in one place.
          </p>
        </div>
        {/* Quick Links */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Quick Links</h2>
          <ul>
            <li>
              <Link
                href="/"
                className="hover:text-white transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors duration-300"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/digitalServices"
                className="hover:text-white transition-colors duration-300"
              >
                Digital Services
              </Link>
            </li>
            <li>
              <Link
                href="/shop"
                className="hover:text-white transition-colors duration-300"
              >
                Shop
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-white transition-colors duration-300"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
        {/* Social */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Follow Us</h2>
          <div className="flex space-x-6 mt-1">
            <a
              href="https://facebook.com/elvatebd"
              target="_blank"
              rel="noopener"
              className="hover:text-blue-500 text-xl transition-colors duration-300"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com/elvatebd"
              target="_blank"
              rel="noopener"
              className="hover:text-sky-400 text-xl transition-colors duration-300"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com/elvatebd"
              target="_blank"
              rel="noopener"
              className="hover:text-pink-500 text-xl transition-colors duration-300"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
        {/* Contact */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Contact Us</h2>
          <p>Ka-96/1, Kazi Bari, Kuril Bisho Road, Dhaka, Bangladesh</p>
          <p>
            Email:{" "}
            <a href="mailto:support@elvate.com" className="hover:text-white">
              support@elvate.com
            </a>
          </p>
          <p>Phone: +880 1234-567890</p>
        </div>
      </div>
      <p className="text-center text-xs pt-8">
        © {new Date().getFullYear()} ELVATE. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
