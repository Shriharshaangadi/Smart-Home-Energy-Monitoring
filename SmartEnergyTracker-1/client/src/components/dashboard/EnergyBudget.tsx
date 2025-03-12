import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatNumber } from "@/lib/utils";

interface EnergyBudgetProps {
  dailyUsage: number;
  dailyLimit: number;
  monthlyCost: number;
  monthlyBudget: number;
  isLoading: boolean;
}

const EnergyBudget = ({
  dailyUsage,
  dailyLimit,
  monthlyCost,
  monthlyBudget,
  isLoading,
}: EnergyBudgetProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [newDailyLimit, setNewDailyLimit] = useState(dailyLimit);
  const [newMonthlyBudget, setNewMonthlyBudget] = useState(monthlyBudget);

  const dailyPercentage = Math.min(Math.round((dailyUsage / dailyLimit) * 100), 100);
  const monthlyPercentage = Math.min(Math.round((monthlyCost / monthlyBudget) * 100), 100);
  
  const dailyStatus = dailyPercentage < 70 ? 'On Track' : dailyPercentage < 90 ? 'Caution' : 'Warning';
  const dailyStatusColor = dailyPercentage < 70 ? 'text-success' : dailyPercentage < 90 ? 'text-warning' : 'text-error';
  
  const monthlyStatus = monthlyPercentage < 70 ? 'On Track' : monthlyPercentage < 90 ? 'Caution' : 'Warning';
  const monthlyStatusColor = monthlyPercentage < 70 ? 'text-success' : monthlyPercentage < 90 ? 'text-warning' : 'text-error';

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await apiRequest("POST", "/api/budget", {
        dailyKwh: newDailyLimit,
        monthlyBudget: newMonthlyBudget,
        carbonTarget: 150 // Hardcoded for simplicity
      });
      
      toast({
        title: "Budget Updated",
        description: "Your energy budget has been updated successfully.",
      });
      
      // Invalidate queries that use the budget data
      queryClient.invalidateQueries({ queryKey: ['/api/demo/data'] });
      
    } catch (error) {
      toast({
        title: "Failed to Update Budget",
        description: "There was an error updating your energy budget.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full mb-1" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full mb-1" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="space-y-3">
              <div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Energy Budget</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Daily Limit</span>
          <span className="text-sm font-medium">{dailyLimit} kWh</span>
        </div>
        <div className="h-[6px] rounded-[3px] bg-gray-200 overflow-hidden">
          <div 
            className={`h-full bg-${dailyPercentage < 70 ? 'success' : dailyPercentage < 90 ? 'warning' : 'error'}`}
            style={{ width: `${dailyPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Current: {formatNumber(dailyUsage)} kWh ({dailyPercentage}%)</span>
          <span className={`text-xs ${dailyStatusColor} font-medium`}>{dailyStatus}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Monthly Budget</span>
          <span className="text-sm font-medium">${monthlyBudget.toFixed(2)}</span>
        </div>
        <div className="h-[6px] rounded-[3px] bg-gray-200 overflow-hidden">
          <div 
            className={`h-full bg-${monthlyPercentage < 70 ? 'success' : monthlyPercentage < 90 ? 'warning' : 'error'}`}
            style={{ width: `${monthlyPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Current: ${formatNumber(monthlyCost)} ({monthlyPercentage}%)</span>
          <span className={`text-xs ${monthlyStatusColor} font-medium`}>{monthlyStatus}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-medium mb-3">Adjust Budgets</h3>
        
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Daily Energy Limit (kWh)</label>
          <div className="flex items-center space-x-2">
            <Slider
              value={[newDailyLimit]}
              min={10}
              max={50}
              step={1}
              onValueChange={(value) => setNewDailyLimit(value[0])}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-right">
              {newDailyLimit}
            </span>
          </div>
        </div>
        
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Monthly Budget ($)</label>
          <div className="flex items-center space-x-2">
            <Slider
              value={[newMonthlyBudget]}
              min={50}
              max={200}
              step={5}
              onValueChange={(value) => setNewMonthlyBudget(value[0])}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-right">
              ${newMonthlyBudget}
            </span>
          </div>
        </div>
        
        <Button 
          className="mt-2 w-full bg-primary hover:bg-primary-dark text-white"
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EnergyBudget;
