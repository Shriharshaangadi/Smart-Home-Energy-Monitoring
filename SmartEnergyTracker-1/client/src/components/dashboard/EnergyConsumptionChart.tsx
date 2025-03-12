import { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnergyConsumptionChartProps {
  data: number[];
  isLoading: boolean;
}

const EnergyConsumptionChart = ({ data, isLoading }: EnergyConsumptionChartProps) => {
  const [activeTimeframe, setActiveTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((value, index) => {
        // Generate time labels based on 24-hour day
        const hour = index % 24;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const timeLabel = `${formattedHour}${ampm}`;
        
        // Generate average with slight variation
        const average = value * (Math.random() * 0.2 + 0.9);
        
        return {
          time: timeLabel,
          consumption: value,
          average: parseFloat(average.toFixed(2))
        };
      });
      
      setChartData(formattedData);
    }
  }, [data]);

  const handleTimeframeChange = (timeframe: 'day' | 'week' | 'month') => {
    setActiveTimeframe(timeframe);
    // In a real app, this would fetch different data based on timeframe
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Energy Consumption</h2>
        <div className="flex space-x-2">
          <Button
            variant={activeTimeframe === 'day' ? 'default' : 'outline'}
            size="sm"
            className={activeTimeframe === 'day' ? 'bg-secondary bg-opacity-10 text-secondary hover:text-secondary hover:bg-opacity-20' : ''}
            onClick={() => handleTimeframeChange('day')}
          >
            Day
          </Button>
          <Button
            variant={activeTimeframe === 'week' ? 'default' : 'outline'}
            size="sm"
            className={activeTimeframe === 'week' ? 'bg-secondary bg-opacity-10 text-secondary hover:text-secondary hover:bg-opacity-20' : ''}
            onClick={() => handleTimeframeChange('week')}
          >
            Week
          </Button>
          <Button
            variant={activeTimeframe === 'month' ? 'default' : 'outline'}
            size="sm"
            className={activeTimeframe === 'month' ? 'bg-secondary bg-opacity-10 text-secondary hover:text-secondary hover:bg-opacity-20' : ''}
            onClick={() => handleTimeframeChange('month')}
          >
            Month
          </Button>
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#9e9e9e' }} 
              tickMargin={10}
              stroke="#f0f0f0"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#9e9e9e' }} 
              tickFormatter={(value) => `${value} kWh`}
              stroke="#f0f0f0"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
              }}
              labelStyle={{ color: '#333', fontWeight: 'bold' }}
              itemStyle={{ color: '#666' }}
              formatter={(value) => [`${value} kWh`, null]}
            />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 3, strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1000}
              fill="rgba(25, 118, 210, 0.1)"
              fillOpacity={0.1}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#E0E0E0"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={true}
              animationDuration={1000}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center mt-2 space-x-4 text-sm">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-secondary mr-1"></div>
          <span className="text-gray-600">Usage (kWh)</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-gray-300 mr-1"></div>
          <span className="text-gray-600">Average</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyConsumptionChart;
