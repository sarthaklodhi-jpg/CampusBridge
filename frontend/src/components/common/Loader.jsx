export default function Loader({ fullScreen = false }) {
  return (
    <div className={fullScreen ? "grid min-h-screen place-items-center" : "grid min-h-40 place-items-center"}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
    </div>
  );
}
