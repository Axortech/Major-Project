import { Routes, Route} from "react-router-dom";
import Home from "../pages/home";
import About from "../pages/about";
import ContactUs from "../pages/contactus";
import PrivacyPolicy from "../pages/privacypolicy";
import NotFound from "../pages/404";
import SearchResultsPage from "../pages/searchresultspage";
import ProductDetails from "../pages/productdetails";



function AllRoutes() {
    
    return (<>

        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/about-us" element={<About />}></Route>
            <Route path="/contact-us" element={<ContactUs />}></Route>
            <Route path="/privacy-policy" element={<PrivacyPolicy />}></Route>
            <Route path="/product/:id" element={<ProductDetails/>} />
            {/* Dynamic Search Route */}
            <Route path="/search" element={<SearchResultsPage />} />
            {/* All exceptions Route 404 */}
            <Route path="/*" element={<NotFound />}></Route>
        </Routes>
    </>
    );
}

export default AllRoutes;
