-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create queries table
CREATE TABLE IF NOT EXISTS public.queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  sentiment TEXT,
  key_phrases TEXT[],
  status TEXT DEFAULT 'New' NOT NULL,
  assigned_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

-- Create policies for agents (read-only for all authenticated users)
CREATE POLICY "Anyone can view agents"
  ON public.agents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create agents"
  ON public.agents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for queries (full access for authenticated users)
CREATE POLICY "Anyone can view queries"
  ON public.queries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create queries"
  ON public.queries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update queries"
  ON public.queries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete queries"
  ON public.queries
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_queries_updated_at
  BEFORE UPDATE ON public.queries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample agents
INSERT INTO public.agents (name, email) VALUES
  ('Sarah Johnson', 'sarah.j@company.com'),
  ('Mike Chen', 'mike.c@company.com'),
  ('Emily Rodriguez', 'emily.r@company.com')
ON CONFLICT (email) DO NOTHING;