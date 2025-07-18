import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  GraduationCap, 
  BookOpen,
  BarChart3,
  Award
} from 'lucide-react';

export default function HomePage() {
  const { theme } = useTheme();
  const location = useLocation();

  // Handle scrolling to sections when navigating from other pages
  useEffect(() => {
    if (location.state?.scrollToFeatures) {
      const section = document.getElementById('features');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (location.state?.scrollToAbout) {
      const section = document.getElementById('about');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  // Hardcoded stats data
  const stats = [
    {
      title: 'Total Students',
      value: '2,847',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      darkBgColor: 'bg-blue-900/20'
    },
    {
      title: 'Students Placed',
      value: '2,156',
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      darkBgColor: 'bg-green-900/20'
    },
    {
      title: 'Students Unplaced',
      value: '691',
      icon: UserX,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      darkBgColor: 'bg-red-900/20'
    },
    {
      title: 'Placement Rate',
      value: '75.7%',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      darkBgColor: 'bg-purple-900/20'
    },
    {
      title: 'Total Teachers',
      value: '312',
      icon: GraduationCap,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      darkBgColor: 'bg-indigo-900/20'
    },
    {
      title: 'Total Trainers',
      value: '89',
      icon: BookOpen,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      darkBgColor: 'bg-orange-900/20'
    }
  ];

  const StatCard = ({ stat }) => {
    const Icon = stat.icon;
    return (
      <div className={`
        bg-[var(--secondary)] 
        rounded-xl 
        p-6 
        shadow-lg 
        hover:shadow-xl 
        transition-all 
        duration-300 
        hover:scale-105 
        border 
        border-[var(--accent)]/10
      `}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--neutral)]/70 text-sm font-medium mb-1">
              {stat.title}
            </p>
            <p className="text-3xl font-bold text-[var(--neutral)]">
              {stat.value}
            </p>
          </div>
          <div className={`
            p-3 
            rounded-full 
            ${theme === 'dark' ? stat.darkBgColor : stat.bgColor}
          `}>
            <Icon className={`h-6 w-6 ${stat.color}`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--neutral)] pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-[var(--accent)]  bg-clip-text text-transparent">
            ChitkaraCMS
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[var(--neutral)]/80 max-w-3xl mx-auto">
            Comprehensive Cluster Management System for Chitkara University
          </p>
          <p className="text-lg mb-12 text-[var(--neutral)]/60 max-w-2xl mx-auto">
            Streamline student management, track placements, and optimize educational outcomes with our advanced analytics dashboard.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[var(--neutral)]">
              System Overview
            </h2>
            <p className="text-[var(--neutral)]/70 text-lg">
              Real-time statistics and insights from our management system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--secondary)]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-[var(--neutral)]">
              Key Features
            </h2>
            <p className="text-[var(--neutral)]/70 text-lg max-w-2xl mx-auto">
              Powerful tools designed to enhance educational management and student success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[var(--primary)] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-[var(--accent)]/10 rounded-lg mb-6">
                <BarChart3 className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--neutral)]">
                Analytics Dashboard
              </h3>
              <p className="text-[var(--neutral)]/70">
                Comprehensive analytics and reporting tools for data-driven decision making.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--primary)] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-[var(--accent)]/10 rounded-lg mb-6">
                <Users className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--neutral)]">
                Student Management
              </h3>
              <p className="text-[var(--neutral)]/70">
                Efficient student lifecycle management from enrollment to placement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--primary)] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-[var(--accent)]/10 rounded-lg mb-6">
                <Award className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--neutral)]">
                Placement Tracking
              </h3>
              <p className="text-[var(--neutral)]/70">
                Real-time placement monitoring and career progression tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-[var(--neutral)]">
              About ChitkaraCMS
            </h2>
            <div className="text-lg text-[var(--neutral)]/70 space-y-6">
              <p>
                ChitkaraCMS is a comprehensive cluster management system designed specifically 
                for Chitkara University to streamline educational operations and enhance student outcomes.
              </p>
              <p>
                Our platform provides real-time insights into student performance, placement statistics, 
                and faculty management, enabling data-driven decisions that improve educational quality and 
                student success rates.
              </p>
              <p>
                With advanced analytics, intuitive dashboards, and seamless integration capabilities, 
                ChitkaraCMS empowers educational institutions to optimize their operations and 
                achieve better results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--accent)]/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-[var(--neutral)]">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 text-[var(--neutral)]/70">
            Join thousands of educators and students already using ChitkaraCMS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-colors">
              Get Started
            </button>
            <button className="px-8 py-3 border-2 border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
