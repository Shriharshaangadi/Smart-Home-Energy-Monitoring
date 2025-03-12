import { 
  User, InsertUser, Device, InsertDevice, EnergyUsage, InsertEnergyUsage, 
  Budget, InsertBudget, Alert, InsertAlert, EnergyHistory, InsertEnergyHistory,
  LoginUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Device methods
  getDevices(userId: number): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDeviceStatus(id: number, status: string, currentPower: number): Promise<Device | undefined>;
  
  // Energy usage methods
  getCurrentEnergyUsage(userId: number): Promise<EnergyUsage | undefined>;
  addEnergyUsage(usage: InsertEnergyUsage): Promise<EnergyUsage>;
  
  // Budget methods
  getBudget(userId: number): Promise<Budget | undefined>;
  createOrUpdateBudget(budget: InsertBudget): Promise<Budget>;
  
  // Alert methods
  getAlerts(userId: number, limit?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<Alert | undefined>;
  
  // Energy history methods
  getEnergyHistory(userId: number, days: number): Promise<EnergyHistory[]>;
  addEnergyHistory(history: InsertEnergyHistory): Promise<EnergyHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private devices: Map<number, Device>;
  private energyUsages: Map<number, EnergyUsage>;
  private budgets: Map<number, Budget>;
  private alerts: Map<number, Alert>;
  private energyHistories: Map<number, EnergyHistory>;
  
  currentUserId: number;
  currentDeviceId: number;
  currentEnergyUsageId: number;
  currentBudgetId: number;
  currentAlertId: number;
  currentEnergyHistoryId: number;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.energyUsages = new Map();
    this.budgets = new Map();
    this.alerts = new Map();
    this.energyHistories = new Map();
    
    this.currentUserId = 1;
    this.currentDeviceId = 1;
    this.currentEnergyUsageId = 1;
    this.currentBudgetId = 1;
    this.currentAlertId = 1;
    this.currentEnergyHistoryId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create default budget for new user
    this.createOrUpdateBudget({
      userId: id,
      dailyKwh: 25,
      monthlyBudget: 120,
      carbonTarget: 150
    });
    
    return user;
  }

  // Device methods
  async getDevices(userId: number): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(
      (device) => device.userId === userId
    );
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    const newDevice: Device = { ...device, id };
    this.devices.set(id, newDevice);
    return newDevice;
  }

  async updateDeviceStatus(id: number, status: string, currentPower: number): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;
    
    const updatedDevice: Device = { 
      ...device, 
      status, 
      currentPower 
    };
    
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  // Energy usage methods
  async getCurrentEnergyUsage(userId: number): Promise<EnergyUsage | undefined> {
    const userUsages = Array.from(this.energyUsages.values()).filter(
      (usage) => usage.userId === userId
    );
    
    // Return the most recent
    if (userUsages.length === 0) return undefined;
    return userUsages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }

  async addEnergyUsage(usage: InsertEnergyUsage): Promise<EnergyUsage> {
    const id = this.currentEnergyUsageId++;
    const newUsage: EnergyUsage = { ...usage, id };
    this.energyUsages.set(id, newUsage);
    return newUsage;
  }

  // Budget methods
  async getBudget(userId: number): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(
      (budget) => budget.userId === userId
    );
  }

  async createOrUpdateBudget(budget: InsertBudget): Promise<Budget> {
    // Check if budget already exists for this user
    const existingBudget = await this.getBudget(budget.userId);
    
    if (existingBudget) {
      // Update existing
      const updatedBudget: Budget = { ...existingBudget, ...budget };
      this.budgets.set(existingBudget.id, updatedBudget);
      return updatedBudget;
    } else {
      // Create new
      const id = this.currentBudgetId++;
      const newBudget: Budget = { ...budget, id };
      this.budgets.set(id, newBudget);
      return newBudget;
    }
  }

  // Alert methods
  async getAlerts(userId: number, limit?: number): Promise<Alert[]> {
    const userAlerts = Array.from(this.alerts.values())
      .filter((alert) => alert.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (limit) {
      return userAlerts.slice(0, limit);
    }
    
    return userAlerts;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const newAlert: Alert = { ...alert, id };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert: Alert = { ...alert, read: true };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Energy history methods
  async getEnergyHistory(userId: number, days: number): Promise<EnergyHistory[]> {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    
    return Array.from(this.energyHistories.values())
      .filter((history) => 
        history.userId === userId && 
        new Date(history.date) >= startDate
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async addEnergyHistory(history: InsertEnergyHistory): Promise<EnergyHistory> {
    const id = this.currentEnergyHistoryId++;
    const newHistory: EnergyHistory = { ...history, id };
    this.energyHistories.set(id, newHistory);
    return newHistory;
  }

  // Initialize demo data for testing
  private initializeDemoData() {
    // Demo user
    const user: User = {
      id: 1,
      username: 'demo',
      password: 'password123',
      name: 'Shri Harsha Angadi',
      email: 'shriharsha@example.com'
    };
    this.users.set(user.id, user);
    this.currentUserId++;

    // Demo devices
    const devices: Device[] = [
      {
        id: 1,
        userId: 1,
        name: 'Refrigerator',
        location: 'Kitchen',
        type: 'refrigerator',
        status: 'active',
        currentPower: 120,
        todayUsage: 2.88,
        isHighPower: false,
        icon: 'fa-refrigerator'
      },
      {
        id: 2,
        userId: 1,
        name: 'TV',
        location: 'Living Room',
        type: 'tv',
        status: 'standby',
        currentPower: 5,
        todayUsage: 1.45,
        isHighPower: false,
        icon: 'fa-tv'
      },
      {
        id: 3,
        userId: 1,
        name: 'Washing Machine',
        location: 'Laundry Room',
        type: 'washer',
        status: 'running',
        currentPower: 850,
        todayUsage: 3.20,
        isHighPower: true,
        icon: 'fa-washing-machine'
      },
      {
        id: 4,
        userId: 1,
        name: 'Smart Lights',
        location: 'Whole House',
        type: 'lights',
        status: 'active',
        currentPower: 75,
        todayUsage: 1.05,
        isHighPower: false,
        icon: 'fa-lightbulb'
      }
    ];

    devices.forEach(device => {
      this.devices.set(device.id, device);
      this.currentDeviceId++;
    });

    // Demo energy usage
    const energyUsage: EnergyUsage = {
      id: 1,
      userId: 1,
      timestamp: new Date(),
      power: 3.42,
      dailyTotal: 18.7,
      monthlyCost: 87.32,
      carbonFootprint: 104.5
    };
    this.energyUsages.set(energyUsage.id, energyUsage);
    this.currentEnergyUsageId++;

    // Demo budget
    const budget: Budget = {
      id: 1,
      userId: 1,
      dailyKwh: 25,
      monthlyBudget: 120,
      carbonTarget: 150
    };
    this.budgets.set(budget.id, budget);
    this.currentBudgetId++;

    // Demo alerts
    const alerts: Alert[] = [
      {
        id: 1,
        userId: 1,
        timestamp: new Date(),
        type: 'error',
        title: 'High Energy Usage Detected',
        message: 'Air conditioner consumption exceeds normal levels by 35%',
        read: false
      },
      {
        id: 2,
        userId: 1,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        type: 'warning',
        title: 'Approaching Daily Limit',
        message: 'You\'ve used 75% of your daily energy budget',
        read: false
      },
      {
        id: 3,
        userId: 1,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        type: 'info',
        title: 'Device Offline',
        message: 'Smart plug in home office disconnected',
        read: false
      },
      {
        id: 4,
        userId: 1,
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
        type: 'success',
        title: 'Weekly Report Available',
        message: 'Your energy savings report for last week is ready',
        read: true
      }
    ];

    alerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
      this.currentAlertId++;
    });

    // Demo energy history - create for last 7 days
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate hourly data - 24 entries
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        // Generate more realistic pattern - low at night, peak in morning and evening
        let baseUsage = 0.7; // Base load
        
        // Morning peak (7-9am)
        if (hour >= 7 && hour <= 9) {
          baseUsage += 1.5;
        }
        // Evening peak (6-10pm)
        else if (hour >= 18 && hour <= 22) {
          baseUsage += 2.0;
        }
        // Midday moderate usage
        else if (hour >= 10 && hour <= 17) {
          baseUsage += 1.0;
        }
        
        // Add some randomization
        const randomVariation = (Math.random() - 0.5) * 0.5;
        return parseFloat((baseUsage + randomVariation).toFixed(2));
      });
      
      const totalKwh = parseFloat(hourlyData.reduce((sum, val) => sum + val, 0).toFixed(2));
      const averageKwh = parseFloat((totalKwh / 24).toFixed(2));
      
      const history: EnergyHistory = {
        id: this.currentEnergyHistoryId++,
        userId: 1,
        date: date,
        hourlyData,
        totalKwh,
        averageKwh
      };
      
      this.energyHistories.set(history.id, history);
    }
  }
}

export const storage = new MemStorage();
