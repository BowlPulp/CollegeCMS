import useAuthStore from '../store/authStore';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Briefcase, 
  Users, 
  BarChart3, 
  CheckCircle 
} from 'lucide-react';

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', color: 'var(--neutral)' }}>
        <div className="bg-[var(--secondary)] p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4 text-[var(--accent)]">Profile</h2>
          <p className="text-red-500">You are not logged in.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-[var(--secondary)] rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="h-32 relative">
            <div className="absolute inset-0 "></div>
          </div>
          
          <div className="px-8 pb-8 -mt-16 relative">
            {/* Profile Avatar */}
            <div className="flex items-end space-x-6 mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-white">
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              
              <div className="pb-4 flex-1">
                <h1 className="text-3xl font-bold text-[var(--neutral)] mb-2">{user.name}</h1>
                <p className="text-xl text-[var(--accent)] font-semibold mb-1">{user.designation}</p>
                <p className="text-sm text-[var(--neutral)]/70 uppercase tracking-wider">
                  {user.role} • Staff ID: {user.staffId}
                </p>
                {user.isVerified && (
                  <div className="inline-flex items-center mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified Account
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-2 bg-[var(--secondary)] rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-[var(--accent)] mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--neutral)]/70">Email Address</p>
                    <p className="text-[var(--neutral)] font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--neutral)]/70">Contact Number</p>
                    <p className="text-[var(--neutral)] font-medium">{user.contactNo}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--neutral)]/70">Staff ID</p>
                    <p className="text-[var(--neutral)] font-medium">{user.staffId}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--neutral)]/70">Role</p>
                    <p className="text-[var(--neutral)] font-medium capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Groups */}
          <div className="space-y-6">
            {/* Mentoring Groups */}
            <div className="bg-[var(--secondary)] rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[var(--accent)] mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Mentoring Groups
              </h3>
              
              {user.mentoringGroups && user.mentoringGroups.length > 0 ? (
                <div className="space-y-2">
                  {user.mentoringGroups.map((group, index) => (
                    <div key={index} className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <span className="text-[var(--neutral) font-medium">{group}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--neutral)]/60 text-sm">No mentoring groups assigned</p>
              )}
            </div>

            {/* Account Stats */}
            <div className="bg-[var(--secondary)] rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[var(--accent)] mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Account Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[var(--neutral)]/10">
                  <span className="text-sm text-[var(--neutral)]/70">Member Since</span>
                  <span className="text-sm font-medium text-[var(--neutral)]">
                    {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-[var(--neutral)]/10">
                  <span className="text-sm text-[var(--neutral)]/70">Last Updated</span>
                  <span className="text-sm font-medium text-[var(--neutral)]">
                    {user.updatedAt ? formatDate(user.updatedAt) : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-[var(--neutral)]/70">Pinned Sheets</span>
                  <span className="text-sm font-medium text-[var(--neutral)]">
                    {user.pinnedSheets ? user.pinnedSheets.length : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}