import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';
import { SuperAdmin } from './models';
import bcrypt from 'bcryptjs';

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase();

    // Create initial super admin if doesn't exist
    const existingAdmin = await SuperAdmin.findOne({ email: config.superAdmin.email });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(config.superAdmin.password, 12);
      await SuperAdmin.create({
        email: config.superAdmin.email,
        passwordHash,
        name: 'Super Admin',
        permissions: ['*'],
      });
      console.log('Initial super admin created:', config.superAdmin.email);
    }

    // Start server
    app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Hisobchi API Server                                     ║
║                                                            ║
║   Environment: ${config.env.padEnd(40)}║
║   Port: ${config.port.toString().padEnd(47)}║
║   URL: ${config.apiUrl.padEnd(48)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap();
