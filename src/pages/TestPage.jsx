import { useNavigate } from 'react-router-dom';

export default function TestPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="mb-4">This is a simple test page to verify routing works.</p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go to Auth
          </button>
        </div>
      </div>
    </div>
  );
}
