import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, UserCheck, UserX, ChevronRight } from 'lucide-react';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    totalStudents: 0,
    placedStudents: 0,
    unplacedStudents: 0,
    placementRate: 0
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Animated counters
    const animateCounters = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      const targets = {
        totalStudents: 2847,
        placedStudents: 1523,
        unplacedStudents: 1324,
        placementRate: 53.5
      };
      
      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setCounters({
          totalStudents: Math.floor(targets.totalStudents * progress),
          placedStudents: Math.floor(targets.placedStudents * progress),
          unplacedStudents: Math.floor(targets.unplacedStudents * progress),
          placementRate: Math.floor(targets.placementRate * progress * 10) / 10
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setCounters(targets);
        }
      }, stepDuration);
    };
    
    setTimeout(animateCounters, 500);
  }, []);

  const stats = [
    {
      title: "Total Students",
      value: counters.totalStudents.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Placed Students",
      value: counters.placedStudents.toLocaleString(),
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Unplaced Students",
      value: counters.unplacedStudents.toLocaleString(),
      icon: UserX,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      title: "Placement Rate",
      value: `${counters.placementRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral text-primary"
         style={{
           backgroundColor: '#EEEEEE',
           color: '#222831'
         }}>
      
      {/* Header */}
      <header className="relative">
        <div className="container mx-auto px-6 py-20">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-12">
              <h1 className="text-6xl font-bold mb-6 leading-tight">
                <span className="block">Chitkara</span>
                <span className="block bg-gradient-to-r bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(135deg, #EB1D23, #DC143C)' }}>
                  Cluster Management
                </span>
                <span className="block text-4xl mt-2 opacity-80">System</span>
              </h1>
              <div className="h-1 w-40 mx-auto rounded-full" 
                   style={{ backgroundColor: '#EB1D23' }}></div>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <p className={`text-xl leading-relaxed mb-8 opacity-90 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Empowering students with comprehensive placement management and career development opportunities. 
                Our advanced system streamlines the entire placement process, connecting talented students with 
                leading companies across various industries.
              </p>
              
              <div className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="group p-6 rounded-xl bg-secondary text-neutral hover:scale-105 transition-all duration-300" 
                     style={{ backgroundColor: '#393E46', color: '#EEEEEE' }}>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: '#EB1D23' }}>
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-3 text-lg">Real-time Tracking</h3>
                  <p className="opacity-90 text-sm leading-relaxed">Monitor placement progress and student performance in real-time</p>
                </div>
                
                <div className="group p-6 rounded-xl bg-secondary text-neutral hover:scale-105 transition-all duration-300" 
                     style={{ backgroundColor: '#393E46', color: '#EEEEEE' }}>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: '#EB1D23' }}>
                    <Users size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-3 text-lg">Industry Partnerships</h3>
                  <p className="opacity-90 text-sm leading-relaxed">Strong network of corporate partners and recruitment opportunities</p>
                </div>
                
                <div className="group p-6 rounded-xl bg-secondary text-neutral hover:scale-105 transition-all duration-300" 
                     style={{ backgroundColor: '#393E46', color: '#EEEEEE' }}>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: '#EB1D23' }}>
                    <UserCheck size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-3 text-lg">Career Development</h3>
                  <p className="opacity-90 text-sm leading-relaxed">Comprehensive skill development and career guidance programs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-20 -mt-8">
        <div className="container mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-4xl font-bold mb-6">Placement Statistics</h2>
            <p className="text-xl opacity-75 max-w-2xl mx-auto">Current academic year performance overview with real-time data insights</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className={`group p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    transitionDelay: `${600 + index * 100}ms`
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-105 transition-transform duration-300`}>
                      <IconComponent className={`w-8 h-8 ${stat.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                           style={{ backgroundImage: 'linear-gradient(135deg, #EB1D23, #DC143C)' }}>
                        {stat.value}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4">{stat.title}</h3>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 delay-1000 bg-gradient-to-r ${stat.gradient}`}
                      style={{ 
                        width: isVisible ? (index === 0 ? '100%' : index === 1 ? '75%' : index === 2 ? '65%' : '85%') : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-4xl font-bold mb-6">Quick Actions</h2>
            <p className="text-xl opacity-75 max-w-2xl mx-auto">Access key features and manage your placement activities with ease</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Users, title: "Student Management", desc: "View and manage student profiles and placement status", delay: "900ms" },
              { icon: TrendingUp, title: "Analytics", desc: "View detailed reports and placement analytics", delay: "1000ms" },
              { icon: UserCheck, title: "Placement Drives", desc: "Manage upcoming placement drives and company visits", delay: "1100ms" }
            ].map((action, index) => (
              <button key={index} className={`group p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #EB1D23',
                        transitionDelay: action.delay
                      }}>
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                         style={{ backgroundColor: '#EB1D23' }}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{action.title}</h3>
                  <p className="opacity-75 mb-4 leading-relaxed">{action.desc}</p>
                  <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium mr-2">Get Started</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;