import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { formatDate } from "../../utils/formatters";

export default function ActivityChart({ data = [] }) {
  const chartData = data.map(x => ({ ...x, label: formatDate(x.date) }));
  return <div className="chart-box">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{top:10,right:10,left:-20,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{fontSize:11}} />
        <YAxis allowDecimals={false} tick={{fontSize:11}} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="residents" name="Residents" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="letters" name="Letters" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="issues" name="Issues" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="announcements" name="Announcements" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}
