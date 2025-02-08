import { Link } from "react-router-dom";

const Footer: React.FC = () => {
    return (
        <footer className="text-[#e43d12] py-4 text-center">
            <div className="container mx-auto px-4">

                <div className="mt-4">
                    <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-400 mx-2">Privacy Policy</Link>
                    <Link to="/contact-us" className="text-sm text-gray-600 hover:text-gray-400 mx-2">Contact Us</Link>
                </div>
                <p className="text-xs opacity-70 mt-4">
                    &copy; {new Date().getFullYear()} Aspect Based Sentiment Analysis Project. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
