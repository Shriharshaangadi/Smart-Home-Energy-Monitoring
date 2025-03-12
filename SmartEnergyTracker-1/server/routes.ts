import express, { Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import { loginUserSchema, insertUserSchema, insertBudgetSchema } from "@shared/schema";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

// Simulate real-time IoT data
function setupIoTSimulation() {
  // Simulate power fluctuations and update device statuses periodically
  setInterval(async () => {
    try {
      // Get demo user devices
      const devices = await storage.getDevices(1);
      
      for (const device of devices) {
        // Add small random power fluctuations
        let newPower = device.currentPower;
        
        // For active devices, add fluctuations
        if (device.status === 'active' || device.status === 'running') {
          const fluctuation = (Math.random() - 0.5) * (device.currentPower * 0.15);
          newPower = Math.max(0, device.currentPower + fluctuation);
          
          // Update device with new power reading
          await storage.updateDeviceStatus(device.id, device.status, parseFloat(newPower.toFixed(2)));
        }
      }
      
      // Update overall energy usage based on device changes
      const currentUsage = await storage.getCurrentEnergyUsage(1);
      if (currentUsage) {
        // Calculate new total power based on all devices
        const updatedDevices = await storage.getDevices(1);
        const totalPower = updatedDevices.reduce((sum, device) => sum + device.currentPower, 0) / 1000; // Convert to kW
        
        // Insert new energy usage record
        await storage.addEnergyUsage({
          userId: 1,
          timestamp: new Date(),
          power: parseFloat(totalPower.toFixed(2)),
          dailyTotal: currentUsage.dailyTotal + (totalPower * (10 / (60 * 60 * 24))), // Add 10 seconds worth of kWh
          monthlyCost: currentUsage.monthlyCost + (totalPower * (10 / (60 * 60 * 24)) * 0.15), // Assume $0.15 per kWh
          carbonFootprint: currentUsage.carbonFootprint + (totalPower * (10 / (60 * 60 * 24)) * 0.5) // Assume 0.5 kg CO2 per kWh
        });
        
        // Check if we should generate alerts
        const budget = await storage.getBudget(1);
        if (budget) {
          const updatedUsage = await storage.getCurrentEnergyUsage(1);
          if (updatedUsage && updatedUsage.dailyTotal >= budget.dailyKwh * 0.7 && Math.random() < 0.1) {
            const percentage = ((updatedUsage.dailyTotal / budget.dailyKwh) * 100).toFixed(0);
            await storage.createAlert({
              userId: 1,
              timestamp: new Date(),
              type: updatedUsage.dailyTotal >= budget.dailyKwh * 0.9 ? 'error' : 'warning',
              title: 'Energy Budget Alert',
              message: `You've used ${percentage}% of your daily energy budget`,
              read: false
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in IoT simulation:', error);
    }
  }, 10000); // Update every 10 seconds
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "energy-monitoring-secret",
    })
  );
  
  // Authentication middleware
  const authenticate = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Register API routes
  const apiRouter = express.Router();
  
  // Auth routes
  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const data = loginUserSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const user = await storage.createUser(data);
      
      // Set user session
      req.session.userId = user.id;
      
      return res.status(201).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // User routes
  apiRouter.get("/user", authenticate, async (req, res) => {
    const userId = req.session.userId as number;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    });
  });
  
  // Energy data routes
  apiRouter.get("/energy/current", authenticate, async (req, res) => {
    const userId = req.session.userId as number;
    const energyUsage = await storage.getCurrentEnergyUsage(userId);
    
    if (!energyUsage) {
      return res.status(404).json({ message: "Energy data not found" });
    }
    
    return res.status(200).json(energyUsage);
  });
  
  apiRouter.get("/energy/history", authenticate, async (req, res) => {
    const userId = req.session.userId as number;
    const days = parseInt(req.query.days as string) || 7;
    
    const history = await storage.getEnergyHistory(userId, days);
    
    return res.status(200).json(history);
  });
  
  // Devices routes
  apiRouter.get("/devices", authenticate, async (req, res) => {
    const userId = req.session.userId as number;
    const devices = await storage.getDevices(userId);
    
    return res.status(200).json(devices);
  });
  
  apiRouter.get("/devices/:id", authenticate, async (req, res) => {
    const userId = req.session.userId as number;
    const deviceId = parseInt(req.params.id);
    
    const device = await storage.getDevice(deviceId);
    
    if (!device || device.userId !== userId) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    return res.status(200).json(device);
  });
  
  // Budget routes
  apiRouter.get("/budget", authenticate, async (req, res) => {
    const userId = req.session.userId as number;
    const budget = await storage.getBudget(userId);
    
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    return res.status(200).json(budget);
  });
  
  apiRouter.post("/budget", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const data = insertBudgetSchema.parse({
        ...req.body,
        userId
      });
      
      const budget = await storage.createOrUpdateBudget(data);
      
      return res.status(200).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Alerts routes
  apiRouter.get("/alerts", authenticate, async (req, res) => {
    const userId = req.session.userId as number;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const alerts = await storage.getAlerts(userId, limit);
    
    return res.status(200).json(alerts);
  });
  
  apiRouter.post("/alerts/:id/read", authenticate, async (req, res) => {
    const alertId = parseInt(req.params.id);
    
    const alert = await storage.markAlertAsRead(alertId);
    
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    
    return res.status(200).json(alert);
  });

  // Demo data route - gets data for demo purposes without authentication
  apiRouter.get("/demo/data", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      
      const [energyUsage, devices, budget, alerts, history] = await Promise.all([
        storage.getCurrentEnergyUsage(userId),
        storage.getDevices(userId),
        storage.getBudget(userId),
        storage.getAlerts(userId, 4),
        storage.getEnergyHistory(userId, 1)
      ]);
      
      return res.status(200).json({
        energyUsage,
        devices,
        budget,
        alerts,
        history: history.length > 0 ? history[0].hourlyData : []
      });
    } catch (error) {
      console.error('Error fetching demo data:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mount API routes
  app.use("/api", apiRouter);

  // Start the IoT simulation
  setupIoTSimulation();

  const httpServer = createServer(app);
  return httpServer;
}
