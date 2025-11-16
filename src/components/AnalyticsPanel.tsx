import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface AnalyticsData {
  categoryData: { name: string; value: number }[];
  priorityData: { name: string; value: number }[];
  statusCounts: { new: number; inProgress: number; resolved: number; closed: number };
}

const COLORS = {
  category: ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'],
  priority: ['#ef4444', '#f59e0b', '#6b7280'],
};

const AnalyticsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    categoryData: [],
    priorityData: [],
    statusCounts: { new: 0, inProgress: 0, resolved: 0, closed: 0 },
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: queries, error } = await supabase
        .from('queries')
        .select('category, priority, status');

      if (error) throw error;

      // Process category data
      const categoryMap = new Map<string, number>();
      const priorityMap = new Map<string, number>();
      const statusCounts = { new: 0, inProgress: 0, resolved: 0, closed: 0 };

      queries?.forEach((query) => {
        // Category counts
        const category = query.category || 'Unknown';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);

        // Priority counts
        const priority = query.priority || 'Unknown';
        priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);

        // Status counts
        const status = query.status.toLowerCase().replace(' ', '');
        if (status === 'new') statusCounts.new++;
        else if (status === 'inprogress') statusCounts.inProgress++;
        else if (status === 'resolved') statusCounts.resolved++;
        else if (status === 'closed') statusCounts.closed++;
      });

      setAnalytics({
        categoryData: Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })),
        priorityData: Array.from(priorityMap.entries()).map(([name, value]) => ({ name, value })),
        statusCounts,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusData = [
    { name: 'New', value: analytics.statusCounts.new },
    { name: 'In Progress', value: analytics.statusCounts.inProgress },
    { name: 'Resolved', value: analytics.statusCounts.resolved },
    { name: 'Closed', value: analytics.statusCounts.closed },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>Breakdown of queries by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.category[index % COLORS.category.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Breakdown of queries by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-soft md:col-span-2">
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
          <CardDescription>Current status of all queries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-primary/10 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">{analytics.statusCounts.new}</p>
              <p className="text-sm text-muted-foreground mt-1">New</p>
            </div>
            <div className="p-6 bg-warning/10 rounded-lg text-center">
              <p className="text-3xl font-bold text-warning">{analytics.statusCounts.inProgress}</p>
              <p className="text-sm text-muted-foreground mt-1">In Progress</p>
            </div>
            <div className="p-6 bg-success/10 rounded-lg text-center">
              <p className="text-3xl font-bold text-success">{analytics.statusCounts.resolved}</p>
              <p className="text-sm text-muted-foreground mt-1">Resolved</p>
            </div>
            <div className="p-6 bg-muted rounded-lg text-center">
              <p className="text-3xl font-bold text-foreground">{analytics.statusCounts.closed}</p>
              <p className="text-sm text-muted-foreground mt-1">Closed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;