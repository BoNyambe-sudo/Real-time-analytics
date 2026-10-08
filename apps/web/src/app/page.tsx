import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import {
  BarChart3,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Terminal,
  Bell,
  Database,
  Globe,
  CheckCircle2,
  LayoutDashboard,
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Metrics',
    description:
      'Live dashboards with sub-second updates. Track active users, revenue, error rates, and latency in real-time.',
  },
  {
    icon: Zap,
    title: 'Instant Alerts',
    description:
      'Configurable threshold-based alerts with acknowledgment workflows. Never miss critical incidents.',
  },
  {
    icon: Terminal,
    title: 'Structured Logs',
    description:
      'Searchable, filterable log streams with virtualized rendering for millions of entries.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description:
      'Role-based access, API key management, and audit trails. Built for enterprise requirements.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Multi-tenant organizations with role-based permissions. Invite and manage team members.',
  },
  {
    icon: Database,
    title: 'Historical Analytics',
    description:
      '24h to 7d time ranges with automated data retention. Export data for deeper analysis.',
  },
];

const integrations = [
  { name: 'Node.js', icon: Globe },
  { name: 'Python', icon: Globe },
  { name: 'Go', icon: Globe },
  { name: 'REST API', icon: Globe },
  { name: 'Webhooks', icon: Globe },
  { name: 'OpenTelemetry', icon: Globe },
];

async function Header() {
  const session = await auth();
  
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl">
            Analytics
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#integrations" className="hover:text-foreground transition-colors">
              Integrations
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard">
              <Button size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default async function Home() {
  const session = await auth();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 lg:py-40">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-3 w-3" />
            <span>Real-time Analytics Dashboard v2.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            See your system <span className="text-primary">in real time</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Production-ready observability for modern teams. Live metrics, instant alerts, and
            searchable logs — all in one beautiful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground/60">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to observe</h2>
            <p className="text-lg text-muted-foreground">
              Built for engineers who need visibility without complexity.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="h-full border-border/50 hover:border-primary/50 transition-colors"
              >
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Works with your stack</h2>
            <p className="text-lg text-muted-foreground">
              Send metrics from any language or framework. Simple HTTP API, OpenTelemetry support,
              and client libraries.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((int, i) => (
              <Card key={i} className="p-6 text-center hover:border-primary/50 transition-colors">
                <int.icon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium">{int.name}</p>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">Or use our simple HTTP API directly</p>
            <div className="bg-muted rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <code>{`curl -X POST https://api.yourapp.com/metrics \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"activeUsers": 1250, "revenue": 45000, "errorRate": 0.2}'`}</code>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 md:py-32 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Beautiful, actionable dashboards
            </h2>
            <p className="text-lg text-muted-foreground">
              Clean, dark-mode first design with responsive layouts that work on any device.
            </p>
          </div>
          <div className="relative rounded-xl border overflow-hidden bg-card">
            <div className="aspect-video bg-muted/50 flex items-center justify-center">
              <div className="text-center p-8">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  Dashboard preview —{' '}
                  <Link href="/signup" className="text-primary hover:underline">
                    try it live
                  </Link>
                </p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
              <button className="w-2 h-2 rounded-full bg-primary" />
              <button className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <button className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to see your data in real time?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of teams already using Analytics. Free 14-day trial, no credit card
              required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Live Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="font-bold text-xl">
                Analytics
              </Link>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Real-time analytics dashboard for modern engineering teams.
              </p>
            </div>
            <nav>
              <h4 className="font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#integrations" className="hover:text-foreground">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#docs" className="hover:text-foreground">
                    Documentation
                  </Link>
                </li>
              </ul>
            </nav>
            <nav>
              <h4 className="font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
            <nav>
              <h4 className="font-medium mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Security
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Analytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
