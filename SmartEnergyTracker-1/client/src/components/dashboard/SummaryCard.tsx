import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: number;
  unit: string;
  status: string;
  statusColor: string;
  percentage: number;
  percentageColor: string;
  comparison: string;
  isPositive: boolean;
  min: number;
  max: number;
  target: number;
  isLoading: boolean;
  isCurrency?: boolean;
}

const SummaryCard = ({
  title,
  value,
  unit,
  status,
  statusColor,
  percentage,
  percentageColor,
  comparison,
  isPositive,
  min,
  max,
  target,
  isLoading,
  isCurrency = false,
}: SummaryCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-600">{title}</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>{status}</span>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <span className="text-2xl font-bold">
                {isCurrency ? '$' : ''}
                {formatNumber(value)}
              </span>
              <span className="text-sm text-gray-600 ml-1">{unit}</span>
            </>
          )}
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          <i className={`fas fa-arrow-${isPositive ? 'down' : 'up'} ${isPositive ? 'text-success' : 'text-error'} mr-1`}></i>
          <span>{comparison}</span>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="h-[6px] rounded-[3px] bg-gray-200 overflow-hidden">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <div 
              className={`h-full ${percentageColor} transition-all duration-500`} 
              style={{ width: `${percentage}%` }}
            ></div>
          )}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{min} {unit}</span>
          <span>Target: {isCurrency ? '$' : ''}{target} {unit}</span>
          <span>{max} {unit}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
