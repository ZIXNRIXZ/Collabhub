import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Square, Circle, ArrowRight, Trash2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

interface DesignElement {
  id: string;
  type: 'box' | 'circle' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  color: string;
}

export function SystemDesign() {
  const { designElements, addDesignElement, updateDesignElement, deleteDesignElement } = useAppStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'box' | 'circle' | 'arrow'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragElement, setDragElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool === 'select') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newElement: Omit<DesignElement, 'id'> = {
      type: selectedTool as 'box' | 'circle' | 'arrow',
      x,
      y,
      label: `${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} ${designElements.length + 1}`,
      color: selectedTool === 'box' ? '#3b82f6' : selectedTool === 'circle' ? '#10b981' : '#f59e0b',
      ...(selectedTool === 'box' && { width: 120, height: 80 }),
      ...(selectedTool === 'circle' && { radius: 40 }),
    };

    addDesignElement(newElement);
    setSelectedTool('select');
  };

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    if (selectedTool === 'select') {
      setIsDragging(true);
      setDragElement(elementId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragElement) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    updateDesignElement(dragElement, { x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragElement(null);
  };

  const tools = [
    { id: 'select', icon: Move, label: 'Select' },
    { id: 'box', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  ];

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">System Design</h1>
          <p className="text-muted-foreground mt-1">Interactive system architecture canvas</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            Zoom Out
          </Button>
          <span className="text-sm text-muted-foreground px-2">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            Zoom In
          </Button>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Toolbar */}
        <Card className="p-4 w-64">
          <h3 className="font-semibold mb-4">Tools</h3>
          <div className="space-y-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? 'default' : 'ghost'}
                  onClick={() => setSelectedTool(tool.id as any)}
                  className="w-full justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tool.label}
                </Button>
              );
            })}
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Elements</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {designElements.map((element) => (
                <div
                  key={element.id}
                  className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">{element.label}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteDesignElement(element.id)}
                    className="w-6 h-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Instructions</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Select a tool from above</p>
              <p>• Click on canvas to add elements</p>
              <p>• Use select tool to drag elements</p>
              <p>• Zoom with buttons or scroll wheel</p>
            </div>
          </div>
        </Card>

        {/* Canvas */}
        <Card className="flex-1 overflow-hidden">
          <div className="h-full relative">
            <div
              ref={canvasRef}
              className="w-full h-full bg-muted/10 cursor-crosshair relative overflow-hidden"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Design Elements */}
              {designElements.map((element) => (
                <motion.div
                  key={element.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute cursor-grab active:cursor-grabbing"
                  style={{
                    left: element.x,
                    top: element.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                >
                  {element.type === 'box' && (
                    <div
                      className="border-2 rounded-lg flex items-center justify-center text-white font-medium text-sm hover:shadow-lg transition-shadow"
                      style={{
                        width: element.width,
                        height: element.height,
                        backgroundColor: element.color,
                        borderColor: element.color
                      }}
                    >
                      {element.label}
                    </div>
                  )}
                  
                  {element.type === 'circle' && (
                    <div
                      className="border-2 rounded-full flex items-center justify-center text-white font-medium text-xs hover:shadow-lg transition-shadow"
                      style={{
                        width: element.radius! * 2,
                        height: element.radius! * 2,
                        backgroundColor: element.color,
                        borderColor: element.color
                      }}
                    >
                      {element.label}
                    </div>
                  )}
                  
                  {element.type === 'arrow' && (
                    <div className="flex items-center space-x-2">
                      <div 
                        className="px-3 py-1 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: element.color }}
                      >
                        {element.label}
                      </div>
                      <ArrowRight 
                        className="w-6 h-6"
                        style={{ color: element.color }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Instructions */}
              {designElements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Start designing your system</p>
                    <p className="text-sm">Select a tool and click to add elements</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}