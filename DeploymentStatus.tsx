import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  Upload, 
  GitBranch, 
  Globe, 
  Server, 
  Loader2,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';

export function DeploymentStatus() {
  const { toast } = useToast();
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    environment: 'staging' as 'staging' | 'production',
    branch: 'main',
  });

  // TRPC queries and mutations
  const { data: deploymentLogs = [], refetch: refetchLogs } = trpc.deployment.getLogs.useQuery();
  const { data: deploymentStats } = trpc.deployment.getStats.useQuery();
  const triggerDeploymentMutation = trpc.deployment.triggerDeployment.useMutation({
    onSuccess: (deployment) => {
      refetchLogs();
      setShowDeployDialog(false);
      toast({
        title: 'Deployment triggered',
        description: `Deployment to ${deploymentConfig.environment} has been started.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to trigger deployment.',
        variant: 'destructive',
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'building':
      case 'testing':
      case 'deploying':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'building':
      case 'testing':
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleTriggerDeployment = () => {
    triggerDeploymentMutation.mutate({
      environment: deploymentConfig.environment,
      branch: deploymentConfig.branch,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deployment Status</h2>
          <p className="text-muted-foreground">Monitor and manage your application deployments</p>
        </div>
        <Button onClick={() => setShowDeployDialog(true)}>
          <Play className="w-4 h-4 mr-2" />
          Trigger Deployment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deploymentStats?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Total Deployments</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deploymentStats?.successful || 0}</p>
              <p className="text-sm text-muted-foreground">Successful</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deploymentStats?.failed || 0}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deploymentStats?.inProgress || 0}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Success Rate */}
      {deploymentStats && deploymentStats.total > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Success Rate</h3>
            <span className="text-2xl font-bold text-green-600">
              {deploymentStats.successRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={deploymentStats.successRate} className="h-2" />
        </Card>
      )}

      {/* Recent Deployments */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Deployments</h3>
          <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="space-y-3">
          {deploymentLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No deployments yet</p>
              <p className="text-xs">Trigger your first deployment to get started</p>
            </div>
          ) : (
            deploymentLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${getStatusColor(log.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="font-medium">{log.status.toUpperCase()}</p>
                      <p className="text-sm opacity-75">{log.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDate(log.createdAt)}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {log.id.slice(0, 8)}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {/* Environment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Staging Environment</h3>
            <Badge variant="secondary">v1.2.3</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Live
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Deployed</span>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Uptime</span>
              <span className="text-sm text-muted-foreground">99.9%</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Production Environment</h3>
            <Badge variant="secondary">v1.2.2</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Live
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Deployed</span>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Uptime</span>
              <span className="text-sm text-muted-foreground">99.8%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Deployment Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trigger New Deployment</DialogTitle>
            <DialogDescription>
              Trigger a new deployment for your application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Environment</label>
              <Select
                value={deploymentConfig.environment}
                onValueChange={(value: 'staging' | 'production') =>
                  setDeploymentConfig({ ...deploymentConfig, environment: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Branch</label>
              <Select
                value={deploymentConfig.branch}
                onValueChange={(value) =>
                  setDeploymentConfig({ ...deploymentConfig, branch: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="develop">develop</SelectItem>
                  <SelectItem value="feature/new-ui">feature/new-ui</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeployDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleTriggerDeployment}
                disabled={triggerDeploymentMutation.isPending}
              >
                {triggerDeploymentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Deploy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}