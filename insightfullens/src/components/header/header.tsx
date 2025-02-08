const Header: React.FC = () => {
    return (
        <header className="text-white p-2 md:p-4 overflow-hidden relative bg-[#d6536d]">
            <div className="marquee-container w-full overflow-hidden">
                <div className="marquee-text-wrapper flex gap-8 border border-white whitespace-nowrap animate-marquee">
                    <p className="marquee-text text-sm md:text-base lg:text-lg font-semibold px-4">
                        📢 Aspect-Based Sentiment Analysis of Online Products – A major project for the
                        Department of Computer and Electronics Engineering, Sagarmatha Engineering College,
                        developed by Sakar Bhandari (077BCT032) | Sagar Lamsal (077BCT031) | Kritika Bhattarai (077BCT021) | Maniraj Katuwal (077BCT026) 🎯.
                    </p>
                    <p className="marquee-text text-sm md:text-base lg:text-lg font-semibold px-4">
                        📢 Aspect-Based Sentiment Analysis of Online Products – A major project for the
                        Department of Computer and Electronics Engineering, Sagarmatha Engineering College,
                        developed by Sakar Bhandari (077BCT032) | Sagar Lamsal (077BCT031) | Kritika Bhattarai (077BCT021) | Maniraj Katuwal (077BCT026) 🎯.
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Header;
