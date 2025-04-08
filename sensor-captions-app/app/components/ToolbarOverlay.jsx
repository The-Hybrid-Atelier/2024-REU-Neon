// ToolbarOverlay.jsx
function ToolbarOverlay({ children, overlay }) {
    return (
      <div className="w-full">
        <div className="toolbar w-full flex justify-between items-center">
            {overlay}
        </div>
        {children}
      </div>
    );
  }
  
  export default ToolbarOverlay;
  