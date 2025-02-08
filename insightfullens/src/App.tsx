import { BrowserRouter as Router } from "react-router-dom";
import AllRoutes from "./components/routes";
import Header from "./components/header/header";
import Navbar from "./components/nav/navbar";
import Footer from "./components/footer/footer";
import { useEffect, useState } from "react";
import Loading from "./components/loading/loading";

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loading />;
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <AllRoutes />
        </main>
        <Header />
        <Footer />
      </div>
    </Router>
  );
};

export default App;