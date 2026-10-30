export default function Stat({ label, value, warn }) {
  return (
    <div className={`stat ${warn ? 'warn' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
