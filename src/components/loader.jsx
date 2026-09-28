function Loader({ size = "md", className = "", color = "white", inline = false } = {}) {
  const sizeMap = {
    xs: "w-3.5 h-3.5 border-2",
    sm: "w-5 h-5 border-2",
    md: "w-6 h-6 border-2.5",
    lg: "w-8 h-8 border-3",
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;
  const borderColorClass = color === "dark" 
    ? "border-slate-300 border-t-slate-800"
    : color === "blue"
    ? "border-blue-200 border-t-blue-600"
    : "border-white/30 border-t-white";

  if (inline) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className={`${spinnerSize} ${borderColorClass} rounded-full animate-spin`} />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/90 backdrop-blur-xs ${className}`}>
      <div className={`${spinnerSize} ${borderColorClass} rounded-full animate-spin`} />
    </div>
  );
}

export default Loader;