import bgImage from "../assets/img/bgbg2.jpg";

const Background = () => {
  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: "blur(3px)", // Reduced blur
          transform: "scale(1.05)",
        }}
      ></div>

      {/* Lighter overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/20 via-gray-900/10 to-transparent z-10"></div>
    </>
  );
};

export default Background;
