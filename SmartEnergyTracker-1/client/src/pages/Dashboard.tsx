import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SummaryCard from "@/components/dashboard/SummaryCard";
import EnergyConsumptionChart from "@/components/dashboard/EnergyConsumptionChart";
import EnergyBudget from "@/components/dashboard/EnergyBudget";
import ApplianceMonitoring from "@/components/dashboard/ApplianceMonitoring";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  
  // Fetch all dashboard data in one request for efficiency
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/demo/data'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading dashboard data",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Setup polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <Layout>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Energy Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Monitor and manage your home energy consumption</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Current Power"
          value={data?.energyUsage?.power || 0}
          unit="kW"
          status="Live"
          statusColor="bg-green-100 text-green-800"
          percentage={45}
          percentageColor="bg-success"
          comparison="-12% vs avg"
          isPositive={true}
          min={0}
          max={10}
          target={5.5}
          isLoading={isLoading}
        />
        
        <SummaryCard
          title="Today's Usage"
          value={data?.energyUsage?.dailyTotal || 0}
          unit="kWh"
          status="Today"
          statusColor="bg-blue-100 text-blue-800"
          percentage={62}
          percentageColor="bg-secondary"
          comparison="+5% vs yesterday"
          isPositive={false}
          min={0}
          max={40}
          target={data?.budget?.dailyKwh || 25}
          isLoading={isLoading}
        />
        
        <SummaryCard
          title="Monthly Cost"
          value={data?.energyUsage?.monthlyCost || 0}
          unit="$"
          status="May"
          statusColor="bg-purple-100 text-purple-800"
          percentage={58}
          percentageColor="bg-purple-500"
          comparison="-8% vs last month"
          isPositive={true}
          min={0}
          max={200}
          target={data?.budget?.monthlyBudget || 120}
          isLoading={isLoading}
          isCurrency={true}
        />
        
        <SummaryCard
          title="Carbon Footprint"
          value={data?.energyUsage?.carbonFootprint || 0}
          unit="kg CO₂"
          status="This Month"
          statusColor="bg-gray-100 text-gray-800"
          percentage={42}
          percentageColor="bg-primary"
          comparison="-15% vs last month"
          isPositive={true}
          min={0}
          max={300}
          target={data?.budget?.carbonTarget || 150}
          isLoading={isLoading}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Energy Consumption Chart */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <EnergyConsumptionChart 
            data={data?.history || []} 
            isLoading={isLoading} 
          />
        </div>

        {/* Energy Budget Panel */}
        <div className="bg-white rounded-lg shadow">
          <EnergyBudget 
            dailyUsage={data?.energyUsage?.dailyTotal || 0}
            dailyLimit={data?.budget?.dailyKwh || 25}
            monthlyCost={data?.energyUsage?.monthlyCost || 0}
            monthlyBudget={data?.budget?.monthlyBudget || 120}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Appliance Monitoring & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Appliance Monitoring */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <ApplianceMonitoring 
            devices={data?.devices || []} 
            isLoading={isLoading} 
          />
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow">
          <RecentAlerts 
            alerts={data?.alerts || []} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
