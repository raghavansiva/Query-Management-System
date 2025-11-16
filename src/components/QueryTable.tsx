import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QueryDetailDialog from "./QueryDetailDialog";
import { format } from "date-fns";

interface Query {
  id: string;
  text: string;
  category: string;
  priority: string;
  sentiment: string;
  key_phrases: string[];
  status: string;
  assigned_agent_id: string | null;
  created_at: string;
  updated_at: string;
}

const QueryTable = () => {
  const { toast } = useToast();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueries(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load queries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'complaint': return 'destructive';
      case 'technical issue': return 'warning';
      case 'feature request': return 'accent';
      case 'billing': return 'primary';
      default: return 'secondary';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'success';
      case 'negative': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleViewDetails = (query: Query) => {
    setSelectedQuery(query);
    setShowDetailDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No queries yet. Submit your first query!</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Query</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queries.map((query) => (
              <TableRow key={query.id}>
                <TableCell className="font-medium">
                  <div className="truncate max-w-[300px]" title={query.text}>
                    {query.text}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getCategoryColor(query.category) as any}>
                    {query.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(query.priority) as any}>
                    {query.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getSentimentColor(query.sentiment) as any}>
                    {query.sentiment}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{query.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(query.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(query)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedQuery && (
        <QueryDetailDialog
          query={selectedQuery}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          onUpdate={fetchQueries}
        />
      )}
    </>
  );
};

export default QueryTable;