import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="text-gray-600 p-4">
      <div className="flex justify-end items-center max-w-7xl mx-auto">
        <div className="space-x-6">
          <Link to="/" className="hover:text-gray-400">
            Home
          </Link>
          <Link to="/about-us" className="hover:text-gray-400">
            About
          </Link>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
