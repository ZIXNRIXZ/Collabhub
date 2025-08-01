import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
};

export type TestResult = {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration?: number;
  message?: string;
};

export type DeploymentStatus = {
  status: 'idle' | 'building' | 'testing' | 'deploying' | 'success' | 'failed';
  progress: number;
  logs: string[];
  lastDeployed?: string;
};

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Dashboard tab
  activeTab: 'code' | 'design' | 'tasks' | 'deploy';
  setActiveTab: (tab: 'code' | 'design' | 'tasks' | 'deploy') => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Task['status']) => void;

  // Code Editor
  mainCode: string;
  sandboxCode: string;
  setMainCode: (code: string) => void;
  setSandboxCode: (code: string) => void;
  
  // Test Results
  testResults: TestResult[];
  setTestResults: (results: TestResult[]) => void;
  runTests: () => void;

  // Deployment
  deploymentStatus: DeploymentStatus;
  setDeploymentStatus: (status: DeploymentStatus) => void;
  deploy: () => void;

  // System Design
  designElements: any[];
  addDesignElement: (element: any) => void;
  updateDesignElement: (id: string, updates: any) => void;
  deleteDesignElement: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      isDarkMode: false,
      toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Navigation
      currentPage: 'landing',
      setCurrentPage: (page) => set({ currentPage: page }),

      // Sidebar
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Dashboard tab
      activeTab: 'code',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Tasks
      tasks: [
        {
          id: '1',
          title: 'Implement user authentication',
          description: 'Set up OAuth and session management',
          status: 'inprogress',
          priority: 'high',
          assignee: 'Alex Chen'
        },
        {
          id: '2',
          title: 'Design dashboard components',
          description: 'Create reusable UI components for the main dashboard',
          status: 'todo',
          priority: 'medium',
          assignee: 'Sarah Kim'
        },
        {
          id: '3',
          title: 'Set up CI/CD pipeline',
          description: 'Configure automated testing and deployment',
          status: 'done',
          priority: 'high',
          assignee: 'Mike Johnson'
        },
        {
          id: '4',
          title: 'API documentation',
          description: 'Document all REST endpoints and WebSocket events',
          status: 'todo',
          priority: 'medium',
          assignee: 'Emma Wilson'
        }
      ],
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task => task.id === id ? { ...task, ...updates } : task)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),
      moveTask: (id, status) => set((state) => ({
        tasks: state.tasks.map(task => task.id === id ? { ...task, status } : task)
      })),

      // Code Editor
      mainCode: `// CollabHub Main Editor
import React, { useState, useEffect } from 'react';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Initialize real-time collaboration
    console.log('Initializing CollabHub...');
    setIsConnected(true);
  }, []);

  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-background">
        <Dashboard connected={isConnected} />
      </div>
    </WebSocketProvider>
  );
}`,
      sandboxCode: `// Personal Sandbox - Experiment Here
import React from 'react';

export default function Sandbox() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4">
      <h2>Personal Sandbox</h2>
      <p>Counter: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
      setMainCode: (code) => set({ mainCode: code }),
      setSandboxCode: (code) => set({ sandboxCode: code }),

      // Test Results
      testResults: [],
      setTestResults: (results) => set({ testResults: results }),
      runTests: () => {
        set({ testResults: [
          { id: '1', name: 'Component rendering', status: 'running' },
          { id: '2', name: 'API integration', status: 'pending' },
          { id: '3', name: 'User authentication', status: 'pending' },
          { id: '4', name: 'Database connections', status: 'pending' }
        ]});

        // Simulate test execution
        setTimeout(() => {
          set({ testResults: [
            { id: '1', name: 'Component rendering', status: 'passed', duration: 125 },
            { id: '2', name: 'API integration', status: 'running' },
            { id: '3', name: 'User authentication', status: 'pending' },
            { id: '4', name: 'Database connections', status: 'pending' }
          ]});
        }, 1000);

        setTimeout(() => {
          set({ testResults: [
            { id: '1', name: 'Component rendering', status: 'passed', duration: 125 },
            { id: '2', name: 'API integration', status: 'passed', duration: 89 },
            { id: '3', name: 'User authentication', status: 'running' },
            { id: '4', name: 'Database connections', status: 'pending' }
          ]});
        }, 2000);

        setTimeout(() => {
          set({ testResults: [
            { id: '1', name: 'Component rendering', status: 'passed', duration: 125 },
            { id: '2', name: 'API integration', status: 'passed', duration: 89 },
            { id: '3', name: 'User authentication', status: 'failed', duration: 203, message: 'Token validation failed' },
            { id: '4', name: 'Database connections', status: 'running' }
          ]});
        }, 3000);

        setTimeout(() => {
          set({ testResults: [
            { id: '1', name: 'Component rendering', status: 'passed', duration: 125 },
            { id: '2', name: 'API integration', status: 'passed', duration: 89 },
            { id: '3', name: 'User authentication', status: 'failed', duration: 203, message: 'Token validation failed' },
            { id: '4', name: 'Database connections', status: 'passed', duration: 67 }
          ]});
        }, 4000);
      },

      // Deployment
      deploymentStatus: {
        status: 'idle',
        progress: 0,
        logs: [],
        lastDeployed: undefined
      },
      setDeploymentStatus: (status) => set({ deploymentStatus: status }),
      deploy: () => {
        const logs: string[] = [];
        
        set({ deploymentStatus: { status: 'building', progress: 10, logs: ['Starting build process...'], lastDeployed: undefined }});
        
        setTimeout(() => {
          logs.push('Installing dependencies...');
          set({ deploymentStatus: { status: 'building', progress: 30, logs: [...logs], lastDeployed: undefined }});
        }, 1000);

        setTimeout(() => {
          logs.push('Building application...');
          set({ deploymentStatus: { status: 'building', progress: 60, logs: [...logs], lastDeployed: undefined }});
        }, 2000);

        setTimeout(() => {
          logs.push('Running tests...');
          set({ deploymentStatus: { status: 'testing', progress: 80, logs: [...logs], lastDeployed: undefined }});
        }, 3000);

        setTimeout(() => {
          logs.push('Deploying to production...');
          set({ deploymentStatus: { status: 'deploying', progress: 95, logs: [...logs], lastDeployed: undefined }});
        }, 4000);

        setTimeout(() => {
          logs.push('Deployment successful!');
          set({ deploymentStatus: { 
            status: 'success', 
            progress: 100, 
            logs: [...logs], 
            lastDeployed: new Date().toISOString() 
          }});
        }, 5000);
      },

      // System Design
      designElements: [],
      addDesignElement: (element) => set((state) => ({
        designElements: [...state.designElements, { ...element, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateDesignElement: (id, updates) => set((state) => ({
        designElements: state.designElements.map(el => el.id === id ? { ...el, ...updates } : el)
      })),
      deleteDesignElement: (id) => set((state) => ({
        designElements: state.designElements.filter(el => el.id !== id)
      })),
    }),
    {
      name: 'collabhub-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        tasks: state.tasks,
        mainCode: state.mainCode,
        sandboxCode: state.sandboxCode,
        designElements: state.designElements,
      }),
    }
  )
);