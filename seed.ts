import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'alex@collabhub.com' },
    update: {},
    create: {
      email: 'alex@collabhub.com',
      password: hashedPassword,
      name: 'Alex Chen',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@collabhub.com' },
    update: {},
    create: {
      email: 'sarah@collabhub.com',
      password: hashedPassword,
      name: 'Sarah Kim',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'mike@collabhub.com' },
    update: {},
    create: {
      email: 'mike@collabhub.com',
      password: hashedPassword,
      name: 'Mike Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    },
  });

  console.log('✅ Users created');

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: 'task-1' },
      update: {},
      create: {
        id: 'task-1',
        title: 'Implement user authentication',
        description: 'Set up OAuth and session management with JWT tokens',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        userId: user1.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-2' },
      update: {},
      create: {
        id: 'task-2',
        title: 'Design dashboard components',
        description: 'Create reusable UI components for the main dashboard',
        status: 'PENDING',
        priority: 'MEDIUM',
        userId: user2.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-3' },
      update: {},
      create: {
        id: 'task-3',
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        status: 'COMPLETED',
        priority: 'HIGH',
        userId: user3.id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-4' },
      update: {},
      create: {
        id: 'task-4',
        title: 'API documentation',
        description: 'Document all REST endpoints and WebSocket events',
        status: 'PENDING',
        priority: 'MEDIUM',
        userId: user1.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
    }),
  ]);

  console.log('✅ Tasks created');

  // Create sample collaboration sessions
  const session1 = await prisma.collaborationSession.upsert({
    where: { id: 'session-1' },
    update: {},
    create: {
      id: 'session-1',
      name: 'Frontend Development',
      code: `// CollabHub Frontend Session
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Initialize real-time collaboration
    console.log('Initializing CollabHub...');
    setIsConnected(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Dashboard connected={isConnected} />
    </div>
  );
}`,
      language: 'javascript',
      users: {
        connect: [{ id: user1.id }, { id: user2.id }],
      },
    },
  });

  const session2 = await prisma.collaborationSession.upsert({
    where: { id: 'session-2' },
    update: {},
    create: {
      id: 'session-2',
      name: 'Backend API Development',
      code: `// CollabHub Backend Session
import Fastify from 'fastify';
import { trpc } from './trpc';

const app = Fastify();

app.register(trpc, {
  prefix: '/trpc',
});

app.listen({ port: 4000 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Server running on port 4000');
});`,
      language: 'javascript',
      users: {
        connect: [{ id: user2.id }, { id: user3.id }],
      },
    },
  });

  console.log('✅ Collaboration sessions created');

  // Create sample deployment logs
  const deploymentLogs = await Promise.all([
    prisma.deploymentLog.upsert({
      where: { id: 'deploy-1' },
      update: {},
      create: {
        id: 'deploy-1',
        status: 'success',
        message: 'Deployment to production completed successfully',
        environment: 'production',
        branch: 'main',
        userId: user1.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.deploymentLog.upsert({
      where: { id: 'deploy-2' },
      update: {},
      create: {
        id: 'deploy-2',
        status: 'success',
        message: 'Deployment to staging completed successfully',
        environment: 'staging',
        branch: 'develop',
        userId: user2.id,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    }),
    prisma.deploymentLog.upsert({
      where: { id: 'deploy-3' },
      update: {},
      create: {
        id: 'deploy-3',
        status: 'failed',
        message: 'Build failed due to TypeScript errors',
        environment: 'staging',
        branch: 'feature/new-ui',
        userId: user3.id,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    }),
  ]);

  console.log('✅ Deployment logs created');

  console.log('🎉 Database seeding completed!');
  console.log('\n📊 Sample Data Summary:');
  console.log(`- Users: 3`);
  console.log(`- Tasks: ${tasks.length}`);
  console.log(`- Collaboration Sessions: 2`);
  console.log(`- Deployment Logs: ${deploymentLogs.length}`);
  console.log('\n🔑 Login Credentials:');
  console.log('Email: alex@collabhub.com | Password: password123');
  console.log('Email: sarah@collabhub.com | Password: password123');
  console.log('Email: mike@collabhub.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 