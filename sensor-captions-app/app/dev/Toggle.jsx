
const Toggle = ({ labelTrue = "On", labelFalse = "Off", state, setState}) => {
    const handleToggle = () => {
        const newState = !state;
        setState(newState);
      };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-white">
        {state ? labelTrue : labelFalse}
      </span>
      <div
        onClick={handleToggle}
        className={`relative w-14 h-7 flex items-center rounded-full cursor-pointer p-1 transition-colors ${
            state ? "bg-[#2A335C]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-2 text-white text-sm transition-opacity ${
            state ? "opacity-100" : "opacity-0"
          }`}
        >
          {labelTrue}
        </span>
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
            state ? "translate-x-7" : "translate-x-0"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default Toggle;
