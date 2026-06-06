export function StatCard({
  title,
  value,
  sub,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base text-gray-500 font-medium">{title}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-sm text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
