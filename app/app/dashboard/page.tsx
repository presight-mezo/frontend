export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0ef', color: '#0a0a0a', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', background: 'white', padding: '40px 60px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>Welcome to the Presight app dashboard!</p>
      </div>
    </div>
  );
}
