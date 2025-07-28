import React, { useEffect, useState } from 'react';
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
import axios from '../api/axios';

export default function HomePage() {
  const { theme } = useTheme();
  const location = useLocation();

  // Real stats state
  const [overview, setOverview] = useState({
    total: 0,
    finalized: 0,
    pending: 0,
    percentFinalized: '0.0',
    groupWise: {},
    specializationWise: {}
  });
  const [loadingStats, setLoadingStats] = useState(true);

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

  // Fetch real stats
  useEffect(() => {
    setLoadingStats(true);
    axios.get('/api/students/overview')
      .then(res => setOverview(res.data.data))
      .finally(() => setLoadingStats(false));
  }, []);

  // Real stats data
  const stats = [
    {
      title: 'Total Students',
      value: loadingStats ? '...' : overview.total,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      darkBgColor: 'bg-blue-900/20'
    },
    {
      title: 'Students Placed',
      value: loadingStats ? '...' : overview.finalized,
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      darkBgColor: 'bg-green-900/20'
    },
    {
      title: 'Students Unplaced',
      value: loadingStats ? '...' : overview.pending,
      icon: UserX,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      darkBgColor: 'bg-red-900/20'
    },
    {
      title: 'Placement Rate',
      value: loadingStats ? '...' : `${overview.percentFinalized}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      darkBgColor: 'bg-purple-900/20'
    },
    {
      title: 'Total Teachers',
      value: '312', // Still hardcoded
      icon: GraduationCap,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      darkBgColor: 'bg-indigo-900/20'
    },
    {
      title: 'Total Trainers',
      value: '89', // Still hardcoded
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

  // Group-wise and specialization-wise cards
  const groupCards = Object.entries(overview.groupWise).map(([group, count]) => (
    <div key={group} className="bg-[var(--secondary)] rounded-xl p-4 text-center border border-[var(--accent)]/10">
      <div className="text-lg font-semibold text-[var(--accent)]">Group {group}</div>
      <div className="text-2xl font-bold text-[var(--neutral)]">{count}</div>
    </div>
  ));
  const specCards = Object.entries(overview.specializationWise).map(([spec, count]) => (
    <div key={spec} className="bg-[var(--secondary)] rounded-xl p-4 text-center border border-[var(--accent)]/10">
      <div className="text-lg font-semibold text-[var(--accent)]">{spec}</div>
      <div className="text-2xl font-bold text-[var(--neutral)]">{count}</div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--neutral)] ">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>

          {/* Group-wise stats */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-[var(--neutral)]">Group-wise Students</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupCards.length > 0 ? groupCards : <div className="col-span-full text-center text-[var(--neutral)]/60">No data</div>}
            </div>
          </div>

          {/* Specialization-wise stats */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[var(--neutral)]">Specialization-wise Students</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {specCards.length > 0 ? specCards : <div className="col-span-full text-center text-[var(--neutral)]/60">No data</div>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
