export default function Card({ children, className = "" }) {
  return <section className={`surface rounded-lg p-5 ${className}`}>{children}</section>;
}
