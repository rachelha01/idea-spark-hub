 import { useState } from "react";
 import { format, subDays, startOfQuarter, startOfYear } from "date-fns";
 import { Calendar as CalendarIcon } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Calendar } from "@/components/ui/calendar";
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from "@/components/ui/popover";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { cn } from "@/lib/utils";
 import { DateRange } from "react-day-picker";
 
 interface DateRangeFilterProps {
   dateRange: DateRange | undefined;
   onDateRangeChange: (range: DateRange | undefined) => void;
 }
 
 export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
   const [preset, setPreset] = useState<string>("30");
 
   const handlePresetChange = (value: string) => {
     setPreset(value);
     const today = new Date();
     
     switch (value) {
       case "7":
         onDateRangeChange({ from: subDays(today, 7), to: today });
         break;
       case "30":
         onDateRangeChange({ from: subDays(today, 30), to: today });
         break;
       case "90":
         onDateRangeChange({ from: subDays(today, 90), to: today });
         break;
       case "quarter":
         onDateRangeChange({ from: startOfQuarter(today), to: today });
         break;
       case "year":
         onDateRangeChange({ from: startOfYear(today), to: today });
         break;
       case "custom":
         break;
     }
   };
 
   return (
     <div className="flex items-center gap-2">
       <Select value={preset} onValueChange={handlePresetChange}>
         <SelectTrigger className="w-[160px]">
           <SelectValue placeholder="Select period" />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value="7">Last 7 days</SelectItem>
           <SelectItem value="30">Last 30 days</SelectItem>
           <SelectItem value="90">Last 90 days</SelectItem>
           <SelectItem value="quarter">This quarter</SelectItem>
           <SelectItem value="year">This year</SelectItem>
           <SelectItem value="custom">Custom range</SelectItem>
         </SelectContent>
       </Select>
 
       {preset === "custom" && (
         <Popover>
           <PopoverTrigger asChild>
             <Button
               variant="outline"
               className={cn(
                 "justify-start text-left font-normal",
                 !dateRange && "text-muted-foreground"
               )}
             >
               <CalendarIcon className="mr-2 h-4 w-4" />
               {dateRange?.from ? (
                 dateRange.to ? (
                   <>
                     {format(dateRange.from, "LLL dd, y")} -{" "}
                     {format(dateRange.to, "LLL dd, y")}
                   </>
                 ) : (
                   format(dateRange.from, "LLL dd, y")
                 )
               ) : (
                 <span>Pick a date range</span>
               )}
             </Button>
           </PopoverTrigger>
           <PopoverContent className="w-auto p-0" align="start">
             <Calendar
               initialFocus
               mode="range"
               defaultMonth={dateRange?.from}
               selected={dateRange}
               onSelect={onDateRangeChange}
               numberOfMonths={2}
             />
           </PopoverContent>
         </Popover>
       )}
     </div>
   );
 }