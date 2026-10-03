/** The brand mark as a divider: three thin glowing ring lines, like the rings on the can (S1 "ring line" edges). */
export default function Rings({ className = "", vertical = false }: { className?: string; vertical?: boolean }) {
  return (
    <div aria-hidden className={`rings ${vertical ? "rings-v" : ""} ${className}`}>
      <i />
      <i />
      <i />
    </div>
  );
}
