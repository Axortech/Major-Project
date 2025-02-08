import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center bg-white text-gray-900 px-6 md:px-20">
      {/* Left Section - Illustration */}
      <div className="flex justify-center">
        <img
          src="https://illustrations.popsy.co/amber/product-launch.svg"
          alt="Page Not Found"
          className="w-80 md:w-[400px] lg:w-[500px]"
        />
      </div>

      {/* Right Section - Error Message */}
      <div className="text-center md:text-left md:ml-10 mt-6 md:mt-0">
        <h1 className="text-8xl font-extrabold">404</h1>
        <p className="text-lg text-gray-600 mt-2">
          Oops! The page you're looking for doesn't exist.
        </p>

        {/* Home Button */}
        <Link
          to="/"
          className="mt-3 mb-3 inline-block px-6 py-3 bg-[#101828] text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
