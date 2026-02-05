 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import {
   PieChart,
   Pie,
   Cell,
   ResponsiveContainer,
   Tooltip,
   Legend,
 } from "recharts";
 
 const data = [
   { name: "Pharmaceuticals", value: 35, color: "hsl(var(--chart-1))" },
   { name: "Medical Devices", value: 25, color: "hsl(var(--chart-2))" },
   { name: "OTC Products", value: 20, color: "hsl(var(--chart-3))" },
   { name: "Healthcare Services", value: 12, color: "hsl(var(--chart-4))" },
   { name: "Supplements", value: 8, color: "hsl(var(--chart-5))" },
 ];
 
 export function CategoryDistributionChart() {
   return (
     <Card className="border-border">
       <CardHeader>
         <CardTitle className="text-foreground">Portfolio Distribution</CardTitle>
       </CardHeader>
       <CardContent>
         <ResponsiveContainer width="100%" height={300}>
           <PieChart>
             <Pie
               data={data}
               cx="50%"
               cy="50%"
               innerRadius={60}
               outerRadius={100}
               paddingAngle={2}
               dataKey="value"
               label={({ name, value }) => `${value}%`}
               labelLine={false}
             >
               {data.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={entry.color} />
               ))}
             </Pie>
             <Tooltip
               contentStyle={{
                 backgroundColor: "hsl(var(--card))",
                 border: "1px solid hsl(var(--border))",
                 borderRadius: "8px",
                 color: "hsl(var(--foreground))",
               }}
               formatter={(value: number) => [`${value}%`, "Share"]}
             />
             <Legend
               verticalAlign="bottom"
               height={36}
               formatter={(value) => (
                 <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
               )}
             />
           </PieChart>
         </ResponsiveContainer>
       </CardContent>
     </Card>
   );
 }