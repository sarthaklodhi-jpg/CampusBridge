export default function Button({ variant = "primary", className = "", ...props }) {
  const variantClass = variant === "ghost" ? "btn-ghost" : "btn-primary";
  return <button className={`${variantClass} ${className}`} {...props} />;
}
