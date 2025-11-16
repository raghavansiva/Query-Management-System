import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Agent {
  id: string;
  name: string;
  email: string;
}

interface QueryDetailDialogProps {
  query: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const QueryDetailDialog = ({ query, open, onOpenChange, onUpdate }: QueryDetailDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(query.status);
  const [selectedAgentId, setSelectedAgentId] = useState(query.assigned_agent_id || "");

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    setSelectedStatus(query.status);
    setSelectedAgentId(query.assigned_agent_id || "");
  }, [query]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      console.error('Fetch agents error:', error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('queries')
        .update({
          status: selectedStatus,
          assigned_agent_id: selectedAgentId || null,
        })
        .eq('id', query.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Query updated successfully",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update query",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Query Details</DialogTitle>
          <DialogDescription>
            View and update query information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Query Text</Label>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{query.text}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Badge className="w-fit">{query.category}</Badge>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Badge className="w-fit">{query.priority}</Badge>
            </div>
            <div className="space-y-2">
              <Label>Sentiment</Label>
              <Badge className="w-fit">{query.sentiment}</Badge>
            </div>
            <div className="space-y-2">
              <Label>Created</Label>
              <p className="text-sm text-muted-foreground">
                {format(new Date(query.created_at), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Key Phrases</Label>
            <div className="flex flex-wrap gap-2">
              {query.key_phrases?.map((phrase: string, index: number) => (
                <Badge key={index} variant="outline">{phrase}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent">Assigned Agent</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Query
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QueryDetailDialog;