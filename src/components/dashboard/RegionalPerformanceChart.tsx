 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
 } from "recharts";
 
 const data = [
   { region: "Jakarta", revenue: 45000, growth: 12 },
   { region: "Surabaya", revenue: 32000, growth: 8 },
   { region: "Bandung", revenue: 28000, growth: 15 },
   { region: "Medan", revenue: 22000, growth: 6 },
   { region: "Semarang", revenue: 18000, growth: 10 },
 ];
 
 export function RegionalPerformanceChart() {
   return (
     <Card className="border-border">
       <CardHeader>
         <CardTitle className="text-foreground">Regional Performance</CardTitle>
       </CardHeader>
       <CardContent>
         <ResponsiveContainer width="100%" height={300}>
           <BarChart data={data} layout="vertical">
             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
             <XAxis
               type="number"
               stroke="hsl(var(--muted-foreground))"
               fontSize={12}
               tickFormatter={(value) => `$${value / 1000}k`}
             />
             <YAxis
               type="category"
               dataKey="region"
               stroke="hsl(var(--muted-foreground))"
               fontSize={12}
               width={80}
             />
             <Tooltip
               contentStyle={{
                 backgroundColor: "hsl(var(--card))",
                 border: "1px solid hsl(var(--border))",
                 borderRadius: "8px",
                 color: "hsl(var(--foreground))",
               }}
               formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
             />
             <Bar
               dataKey="revenue"
               fill="hsl(var(--chart-1))"
               radius={[0, 4, 4, 0]}
             />
           </BarChart>
         </ResponsiveContainer>
       </CardContent>
     </Card>
   );
 }