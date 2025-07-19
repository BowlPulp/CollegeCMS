import useAuthStore from '../store/authStore';

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

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', color: 'var(--neutral)' }}>
      <div className="bg-[var(--secondary)] p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold mb-2 text-[var(--accent)]">Profile</h2>
          <div className="text-lg text-[var(--neutral)]/80 mb-2">{user.name}</div>
          <div className="text-sm text-[var(--neutral)]/60 mb-4">{user.role?.toUpperCase()}</div>
        </div>
        <div className="space-y-3">
          <div><span className="font-semibold">Email:</span> {user.email}</div>
          <div><span className="font-semibold">Staff ID:</span> {user.staffId}</div>
          <div><span className="font-semibold">Contact No:</span> {user.contactNo}</div>
        </div>
      </div>
    </div>
  );
} 