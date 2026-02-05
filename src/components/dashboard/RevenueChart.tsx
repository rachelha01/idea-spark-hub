 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
 } from "recharts";
 
 const data = [
   { month: "Jan", revenue: 12500, target: 11000 },
   { month: "Feb", revenue: 14200, target: 12000 },
   { month: "Mar", revenue: 13800, target: 13000 },
   { month: "Apr", revenue: 16500, target: 14000 },
   { month: "May", revenue: 15200, target: 14500 },
   { month: "Jun", revenue: 18900, target: 15000 },
   { month: "Jul", revenue: 17800, target: 15500 },
   { month: "Aug", revenue: 21200, target: 16000 },
   { month: "Sep", revenue: 19500, target: 17000 },
   { month: "Oct", revenue: 22800, target: 18000 },
   { month: "Nov", revenue: 24100, target: 19000 },
   { month: "Dec", revenue: 26500, target: 20000 },
 ];
 
 export function RevenueChart() {
   return (
     <Card className="border-border">
       <CardHeader>
         <CardTitle className="text-foreground">Revenue Trend</CardTitle>
       </CardHeader>
       <CardContent>
         <ResponsiveContainer width="100%" height={300}>
           <LineChart data={data}>
             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
             <XAxis
               dataKey="month"
               stroke="hsl(var(--muted-foreground))"
               fontSize={12}
             />
             <YAxis
               stroke="hsl(var(--muted-foreground))"
               fontSize={12}
               tickFormatter={(value) => `$${value / 1000}k`}
             />
             <Tooltip
               contentStyle={{
                 backgroundColor: "hsl(var(--card))",
                 border: "1px solid hsl(var(--border))",
                 borderRadius: "8px",
                 color: "hsl(var(--foreground))",
               }}
               formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
             />
             <Line
               type="monotone"
               dataKey="revenue"
               stroke="hsl(var(--chart-1))"
               strokeWidth={2}
               dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2 }}
               name="Revenue"
             />
             <Line
               type="monotone"
               dataKey="target"
               stroke="hsl(var(--chart-2))"
               strokeWidth={2}
               strokeDasharray="5 5"
               dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
               name="Target"
             />
           </LineChart>
         </ResponsiveContainer>
       </CardContent>
     </Card>
   );
 }