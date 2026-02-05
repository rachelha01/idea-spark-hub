 import { Card, CardContent } from "@/components/ui/card";
 import { cn } from "@/lib/utils";
 import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
 
 interface KPICardProps {
   title: string;
   value: string | number;
   change?: number;
   changeLabel?: string;
   icon: LucideIcon;
   className?: string;
 }
 
 export function KPICard({
   title,
   value,
   change,
   changeLabel = "vs last period",
   icon: Icon,
   className,
 }: KPICardProps) {
   const isPositive = change !== undefined && change >= 0;
 
   return (
     <Card className={cn("border-border", className)}>
       <CardContent className="p-6">
         <div className="flex items-start justify-between">
           <div className="space-y-2">
             <p className="text-sm text-muted-foreground">{title}</p>
             <p className="text-2xl font-bold text-foreground">{value}</p>
             {change !== undefined && (
               <div className="flex items-center gap-1 text-sm">
                 {isPositive ? (
                   <TrendingUp className="h-4 w-4 text-success" />
                 ) : (
                   <TrendingDown className="h-4 w-4 text-destructive" />
                 )}
                 <span className={isPositive ? "text-success" : "text-destructive"}>
                   {isPositive ? "+" : ""}{change}%
                 </span>
                 <span className="text-muted-foreground">{changeLabel}</span>
               </div>
             )}
           </div>
           <div className="p-3 rounded-lg bg-primary/10">
             <Icon className="h-6 w-6 text-primary" />
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }