import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Health check endpoint pour le monitoring
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Vérifier la connexion MongoDB
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Vérifier l'uptime
    const uptime = process.uptime();
    
    // Vérifier la mémoire
    const memoryUsage = process.memoryUsage();
    
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'unknown'
      },
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    res.status(200).json({
      success: true,
      data: healthStatus,
      message: 'Service healthy'
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Simple health check pour load balancers
 */
export const simpleHealthCheck = (req: Request, res: Response) => {
  res.status(200).send('OK');
};
