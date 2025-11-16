import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, BarChart3, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Audience Query Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            AI-powered platform to intelligently classify, prioritize, and manage audience queries with real-time analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg"
              className="gap-2 shadow-elegant"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg"
              variant="outline"
            >
              Sign In
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-lg bg-card shadow-soft hover:shadow-elegant transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Classification</h3>
              <p className="text-muted-foreground">
                Automatically categorize, prioritize, and analyze sentiment of every query using advanced AI.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card shadow-soft hover:shadow-elegant transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Visualize query trends, track status, and gain insights with interactive charts and reports.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card shadow-soft hover:shadow-elegant transition-shadow">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Agent Assignment</h3>
              <p className="text-muted-foreground">
                Efficiently assign queries to team members and track resolution status in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
