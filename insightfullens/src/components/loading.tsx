import '../css/loading.css'; // Import the CSS file

const Loading = () => {
  return (
    <div className="container">
      {/* Title (can be optional based on your design) */}
      <div className="title">
        <h1>Loading...</h1>
      </div>

      {/* Keyboard (INSIGHTFULLENS animation) */}
      <div className="keyboard">
        <span className="key">I</span>
        <span className="key">N</span>
        <span className="key">S</span>
        <span className="key">I</span>
        <span className="key">G</span>
        <span className="key">H</span>
        <span className="key">T</span>
        <span className="key">F</span>
        <span className="key">U</span>
        <span className="key">L</span>
        <span className="key">L</span>
        <span className="key">E</span>
        <span className="key">N</span>
        <span className="key">S</span>
      </div>
    </div>
  );
};

export default Loading;
