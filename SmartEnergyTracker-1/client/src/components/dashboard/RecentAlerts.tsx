import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentAlertsProps {
  alerts: Alert[];
  isLoading: boolean;
}

const RecentAlerts = ({ alerts, isLoading }: RecentAlertsProps) => {
  const getAlertTypeData = (type: string) => {
    switch (type) {
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          icon: 'fa-exclamation-circle'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          icon: 'fa-exclamation-triangle'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          icon: 'fa-info-circle'
        };
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          icon: 'fa-check-circle'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500',
          iconColor: 'text-gray-500',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
          icon: 'fa-bell'
        };
    }
  };

  const formatAlertTime = (timestamp: Date) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Recent Alerts</h2>
        <Button variant="ghost" className="text-secondary hover:text-secondary-dark text-sm">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <i className="fas fa-check-circle text-success text-3xl mb-2"></i>
            <p>No alerts at this time.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const typeData = getAlertTypeData(alert.type);
            return (
              <div 
                key={alert.id} 
                className={`${typeData.bgColor} border-l-4 ${typeData.borderColor} p-3 rounded`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className={`fas ${typeData.icon} ${typeData.iconColor}`}></i>
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${typeData.titleColor}`}>{alert.title}</h3>
                    <div className={`mt-1 text-xs ${typeData.messageColor}`}>
                      <p>{alert.message}</p>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatAlertTime(alert.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentAlerts;
