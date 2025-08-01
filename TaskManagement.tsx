import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, User, Clock, AlertCircle, CheckCircle2, Circle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';

function SortableTask({ task, onDelete }: { task: any; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'inprogress':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(task.status)}
          <h4 className="font-medium text-sm">{task.title}</h4>
        </div>
        <Badge variant="outline" className={getPriorityColor(task.priority)}>
          {task.priority}
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {task.description}
      </p>
      
      {task.assignee && (
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span>{task.assignee}</span>
        </div>
      )}
      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => onDelete(task.id)}>
        <X className="w-4 h-4" />
      </Button>
    </Card>
  );
}

export function TaskManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED',
  });
  const { toast } = useToast();

  // TRPC queries and mutations
  const { data: tasks = [], isLoading, refetch } = trpc.task.getAll.useQuery();
  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      setNewTask({ title: '', description: '', status: 'PENDING' });
      toast({
        title: 'Task created',
        description: 'New task has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task.',
        variant: 'destructive',
      });
    },
  });

  const updateTaskMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: 'Task updated',
        description: 'Task has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task.',
        variant: 'destructive',
      });
    },
  });

  const deleteTaskMutation = trpc.task.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: 'Task deleted',
        description: 'Task has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete task.',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = trpc.task.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task status.',
        variant: 'destructive',
      });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
      
      updateStatusMutation.mutate({ id: taskId, status: newStatus });
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: 'Error',
        description: 'Task title is required.',
        variant: 'destructive',
      });
      return;
    }

    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate({ id: taskId });
  };

  // Group tasks by status
  const tasksByStatus = {
    PENDING: tasks.filter(task => task.status === 'PENDING'),
    IN_PROGRESS: tasks.filter(task => task.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter(task => task.status === 'COMPLETED'),
    ARCHIVED: tasks.filter(task => task.status === 'ARCHIVED'),
  };

  const columns = [
    { id: 'PENDING', title: 'To Do', icon: Circle, color: 'bg-blue-50 border-blue-200' },
    { id: 'IN_PROGRESS', title: 'In Progress', icon: Clock, color: 'bg-yellow-50 border-yellow-200' },
    { id: 'COMPLETED', title: 'Done', icon: CheckCircle2, color: 'bg-green-50 border-green-200' },
    { id: 'ARCHIVED', title: 'Archived', icon: AlertCircle, color: 'bg-gray-50 border-gray-200' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Management</h2>
          <p className="text-muted-foreground">Organize and track your development tasks</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center space-x-2">
                <column.icon className="w-5 h-5" />
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary">{tasksByStatus[column.id as keyof typeof tasksByStatus]?.length || 0}</Badge>
              </div>
              
              <div className={`p-4 rounded-lg border-2 border-dashed ${column.color} min-h-[200px]`}>
                <SortableContext items={tasksByStatus[column.id as keyof typeof tasksByStatus]?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
                  <AnimatePresence>
                    {tasksByStatus[column.id as keyof typeof tasksByStatus]?.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SortableTask 
                          task={task} 
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </div>
            </div>
          ))}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <Card className="p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Circle className="w-4 h-4" />
                <span className="font-medium">
                  {tasks.find(t => t.id === activeId)?.title}
                </span>
              </div>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={newTask.status}
                onValueChange={(value: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED') =>
                  setNewTask({ ...newTask, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Done</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
                             <Button 
                 onClick={handleAddTask}
                 disabled={createTaskMutation.isPending}
               >
                 {createTaskMutation.isPending ? (
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                 ) : (
                   <Plus className="w-4 h-4 mr-2" />
                 )}
                 Add Task
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}