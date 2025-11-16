import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface SubmitQueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubmitQueryDialog = ({ open, onOpenChange }: SubmitQueryDialogProps) => {
  const { toast } = useToast();
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!queryText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query text",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call the classify-query edge function
      const { data: classification, error: classifyError } = await supabase.functions.invoke('classify-query', {
        body: { queryText },
      });

      if (classifyError) {
        console.error('Classification error:', classifyError);
        throw new Error('Failed to classify query');
      }

      // Insert the query with classification results
      const { error: insertError } = await supabase
        .from('queries')
        .insert({
          text: queryText,
          category: classification.category,
          priority: classification.priority,
          sentiment: classification.sentiment,
          key_phrases: classification.keyPhrases,
          status: 'New',
        });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Query submitted and classified successfully",
      });

      setQueryText("");
      onOpenChange(false);
      
      // Trigger a page reload to refresh the table
      window.location.reload();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit query",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit New Query</DialogTitle>
          <DialogDescription>
            Enter your query below. It will be automatically classified by AI.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Query Text</Label>
            <Textarea
              id="query"
              placeholder="Describe your issue, question, or feedback..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              rows={6}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Query
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitQueryDialog;