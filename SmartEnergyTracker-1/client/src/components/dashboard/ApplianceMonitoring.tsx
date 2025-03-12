import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Device } from "@shared/schema";
import { formatNumber } from "@/lib/utils";

interface ApplianceMonitoringProps {
  devices: Device[];
  isLoading: boolean;
}

const ApplianceMonitoring = ({ devices, isLoading }: ApplianceMonitoringProps) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(4)].map((_, index) => (
                <tr key={index}>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-3 w-8 mt-1" />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12 mt-1" />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'standby':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-blue-100 text-blue-800 animate-pulse-slow';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIconBgColor = (type: string) => {
    switch (type) {
      case 'refrigerator':
        return 'bg-blue-100';
      case 'tv':
        return 'bg-red-100';
      case 'washer':
        return 'bg-purple-100';
      case 'lights':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getDeviceIconColor = (type: string) => {
    switch (type) {
      case 'refrigerator':
        return 'text-blue-600';
      case 'tv':
        return 'text-red-600';
      case 'washer':
        return 'text-purple-600';
      case 'lights':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUsageTrend = (device: Device) => {
    // Simulate trend data - in real app this would come from the backend
    const trendValue = (Math.random() * 20 - 10).toFixed(0);
    const isPositive = parseInt(trendValue) < 0;
    
    return (
      <div className={`text-xs ${isPositive ? 'text-success' : 'text-error'}`}>
        {isPositive ? '-' : '+'}
        {Math.abs(parseInt(trendValue))}% vs avg
      </div>
    );
  };

  const getCurrentPowerStatus = (device: Device) => {
    if (device.isHighPower) {
      return <div className="text-xs text-warning">High</div>;
    } else if (device.status === 'standby') {
      return <div className="text-xs text-gray-500">Standby</div>;
    } else {
      return <div className="text-xs text-gray-500">Normal</div>;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Appliance Monitoring</h2>
        <Button variant="ghost" className="text-secondary hover:text-secondary-dark text-sm">
          <i className="fas fa-plus-circle mr-1"></i> Add Device
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.map((device) => (
              <tr key={device.id}>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getDeviceIconBgColor(device.type)} flex items-center justify-center`}>
                      <i className={`fas ${device.icon} ${getDeviceIconColor(device.type)}`}></i>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{device.name}</div>
                      <div className="text-xs text-gray-500">{device.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(device.status)}`}>
                    {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{device.currentPower}W</div>
                  {getCurrentPowerStatus(device)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatNumber(device.todayUsage)} kWh</div>
                  {getUsageTrend(device)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 mr-1">
                    <i className="fas fa-chart-line"></i>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <i className="fas fa-cog"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="ghost" className="text-secondary hover:text-secondary-dark text-sm font-medium">
          View All Devices
        </Button>
      </div>
    </div>
  );
};

export default ApplianceMonitoring;
