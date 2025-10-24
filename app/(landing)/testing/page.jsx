'use client';

import { useState } from 'react';

export default function TestingPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(32);
  const [includeTestData, setIncludeTestData] = useState(true);
  const [error, setError] = useState(null);
  
  // Delete functionality state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteStartId, setDeleteStartId] = useState('');
  const [deleteEndId, setDeleteEndId] = useState('');
  const [deleteResults, setDeleteResults] = useState(null);

  // Mark test completed state
  const [markTestLoading, setMarkTestLoading] = useState(false);
  const [markTestStartId, setMarkTestStartId] = useState('');
  const [markTestEndId, setMarkTestEndId] = useState('');
  const [markTestResults, setMarkTestResults] = useState(null);

  const generateUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count, includeTestData }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setDeleteResults(null); // Clear delete results when generating new users
      } else {
        setError(data.message || 'Failed to insert users');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error inserting users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUsers = async (deleteAll = false) => {
    setDeleteLoading(true);
    setError(null);
    setDeleteResults(null);
    
    try {
      const body = deleteAll 
        ? { deleteAll: true }
        : { startId: parseInt(deleteStartId), endId: parseInt(deleteEndId) };

      if (!deleteAll && (!deleteStartId || !deleteEndId)) {
        setError('Please provide both Start ID and End ID');
        setDeleteLoading(false);
        return;
      }

      if (!deleteAll && parseInt(deleteStartId) > parseInt(deleteEndId)) {
        setError('Start ID must be less than or equal to End ID');
        setDeleteLoading(false);
        return;
      }

      const response = await fetch('/api/testing', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        setDeleteResults(data);
        setResults(null); // Clear generation results when deleting
        setDeleteStartId('');
        setDeleteEndId('');
      } else {
        setError(data.error || data.message || 'Failed to delete users');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error deleting users: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const markTestCompleted = async () => {
    setMarkTestLoading(true);
    setError(null);
    setMarkTestResults(null);

    try {
      if (!markTestStartId || !markTestEndId) {
        setError('Please provide both Start ID and End ID for marking test completion');
        setMarkTestLoading(false);
        return;
      }

      if (parseInt(markTestStartId) > parseInt(markTestEndId)) {
        setError('Start ID must be less than or equal to End ID');
        setMarkTestLoading(false);
        return;
      }

      const response = await fetch('/api/testing', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_test_completed',
          startId: parseInt(markTestStartId),
          endId: parseInt(markTestEndId)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMarkTestResults(data);
        setMarkTestStartId('');
        setMarkTestEndId('');
      } else {
        setError(data.message || 'Failed to mark test completion');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error marking test completion: ' + error.message);
    } finally {
      setMarkTestLoading(false);
    }
  };

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🗄️ Database User Generator & Manager
          </h1>
          <p className="text-gray-600 mb-6">
            Generate dummy users that are <strong>fully discoverable</strong> in your matching system, or clean up test data
          </p>

          {/* Generation Controls */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">➕ Generate Users</h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Users
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 32)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-32"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeTestData"
                  checked={includeTestData}
                  onChange={(e) => setIncludeTestData(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  disabled={loading}
                />
                <label htmlFor="includeTestData" className="text-sm font-medium text-gray-700">
                  Include Compatibility Test Data
                </label>
              </div>

              <button
                onClick={generateUsers}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Inserting to Database...
                  </span>
                ) : (
                  '🚀 Generate & Insert Users'
                )}
              </button>
            </div>

            {/* Info Banner */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-xl">ℹ️</span>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Users will be discoverable in your matching system!</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>✅ MBTI quiz completion (QUIZ_SEQUENCES)</li>
                    {includeTestData && <li>✅ Compatibility test answers (TEST_PROGRESS)</li>}
                    <li>✅ Complete profiles with education & jobs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Controls */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🗑️ Delete Users</h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start ID
                </label>
                <input
                  type="number"
                  min="1"
                  value={deleteStartId}
                  onChange={(e) => setDeleteStartId(e.target.value)}
                  placeholder="e.g., 1"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-32"
                  disabled={deleteLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End ID
                </label>
                <input
                  type="number"
                  min="1"
                  value={deleteEndId}
                  onChange={(e) => setDeleteEndId(e.target.value)}
                  placeholder="e.g., 50"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-32"
                  disabled={deleteLoading}
                />
              </div>

              <button
                onClick={() => deleteUsers(false)}
                disabled={deleteLoading || !deleteStartId || !deleteEndId}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                  deleteLoading || !deleteStartId || !deleteEndId
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {deleteLoading ? 'Deleting...' : '🗑️ Delete by Range'}
              </button>

              <button
                onClick={() => {
                  if (confirm('⚠️ Are you sure you want to delete ALL users? This cannot be undone!')) {
                    deleteUsers(true);
                  }
                }}
                disabled={deleteLoading}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                  deleteLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 shadow-lg hover:shadow-xl'
                }`}
              >
                ⚠️ Delete All Users
              </button>
            </div>

            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">This permanently deletes:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>User profiles & personal data</li>
                    <li>MBTI quiz completions & test progress</li>
                    <li>Education, jobs, languages, interests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Mark Test Completed Controls */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">✅ Mark Test Completed</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Mark users as having completed the compatibility test. This enables compatibility checking for these users.
            </p>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start ID
                </label>
                <input
                  type="number"
                  min="1"
                  value={markTestStartId}
                  onChange={(e) => setMarkTestStartId(e.target.value)}
                  placeholder="e.g., 1"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-32"
                  disabled={markTestLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End ID
                </label>
                <input
                  type="number"
                  min="1"
                  value={markTestEndId}
                  onChange={(e) => setMarkTestEndId(e.target.value)}
                  placeholder="e.g., 50"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-32"
                  disabled={markTestLoading}
                />
              </div>

              <button
                onClick={markTestCompleted}
                disabled={markTestLoading || !markTestStartId || !markTestEndId}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                  markTestLoading || !markTestStartId || !markTestEndId
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {markTestLoading ? 'Marking...' : '✅ Mark as Completed'}
              </button>
            </div>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-xl">ℹ️</span>
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">This marks test as completed:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Adds QUIZ_COMPLETION entry (test_id = 2, completed = 'yes')</li>
                    <li>Enables compatibility checking for these users</li>
                    <li>Required for /api/users/[id]/compatibility endpoint</li>
                    <li>Automatically done when "Include Test Data" is checked during generation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mark Test Results */}
        {markTestResults && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold text-green-800 mb-2">Test Completion Marked!</h3>
                <p className="text-green-700">{markTestResults.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-600 mb-1">Total</div>
                <div className="text-2xl font-bold text-green-700">{markTestResults.total}</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="text-sm font-medium text-emerald-600 mb-1">Success</div>
                <div className="text-2xl font-bold text-emerald-700">{markTestResults.successCount}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm font-medium text-red-600 mb-1">Failed</div>
                <div className="text-2xl font-bold text-red-700">{markTestResults.failCount}</div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>✓ Users can now be checked for compatibility!</strong><br/>
                Visit any user profile and the compatibility score will be calculated.
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-bold text-red-800 mb-1">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Delete Results */}
        {deleteResults && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold text-green-800 mb-2">Deletion Complete!</h3>
                <p className="text-green-700">{deleteResults.message}</p>
                <p className="text-sm text-gray-600 mt-1">Range: {deleteResults.range}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm font-medium text-red-600 mb-1">Users</div>
                <div className="text-2xl font-bold text-red-700">{deleteResults.deletionStats?.users || 0}</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm font-medium text-orange-600 mb-1">Test Progress</div>
                <div className="text-2xl font-bold text-orange-700">{deleteResults.deletionStats?.testProgress || 0}</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm font-medium text-yellow-600 mb-1">Quiz Sequences</div>
                <div className="text-2xl font-bold text-yellow-700">{deleteResults.deletionStats?.quizSequences || 0}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-600 mb-1">MBTI Assessments</div>
                <div className="text-2xl font-bold text-blue-700">{deleteResults.deletionStats?.mbtiAssessments || 0}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-600 mb-1">Education</div>
                <div className="text-2xl font-bold text-green-700">{deleteResults.deletionStats?.education || 0}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-600 mb-1">Jobs</div>
                <div className="text-2xl font-bold text-purple-700">{deleteResults.deletionStats?.jobs || 0}</div>
              </div>
            </div>

            {deleteResults.deletedUserIds && deleteResults.deletedUserIds.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Deleted User IDs ({deleteResults.deletedUserIds.length}):
                </div>
                <div className="text-xs text-gray-600 font-mono">
                  {deleteResults.deletedUserIds.slice(0, 30).join(', ')}
                  {deleteResults.deletedUserIds.length > 30 && ` ... and ${deleteResults.deletedUserIds.length - 30} more`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generation Success Results */}
        {results && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Total Processed</div>
                <div className="text-3xl font-bold text-purple-600">{results.total}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm font-medium text-gray-500 mb-2">✅ Successful</div>
                <div className="text-3xl font-bold text-green-600">{results.successCount}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm font-medium text-gray-500 mb-2">❌ Failed</div>
                <div className="text-3xl font-bold text-red-600">{results.failCount}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Success Rate</div>
                <div className="text-3xl font-bold text-blue-600">
                  {((results.successCount / results.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">👥 Gender Distribution</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-600 mb-1">Male Users</div>
                  <div className="text-2xl font-bold text-blue-700">{results.genderDistribution.male}</div>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <div className="text-sm font-medium text-pink-600 mb-1">Female Users</div>
                  <div className="text-2xl font-bold text-pink-700">{results.genderDistribution.female}</div>
                </div>
              </div>
            </div>

            {/* MBTI Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🧠 MBTI Type Distribution</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {mbtiTypes.map((type) => (
                  <div key={type} className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-xs font-medium text-purple-600 mb-1">{type}</div>
                    <div className="text-xl font-bold text-purple-700">
                      {results.mbtiDistribution[type] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inserted Users Sample */}
            {results.results && results.results.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📋 Sample Inserted Users (First 10)
                </h2>
                <div className="space-y-3">
                  {results.results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        result.success
                          ? 'bg-green-50 border-green-500'
                          : 'bg-red-50 border-red-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-800">
                            {result.username || 'Unknown'}
                          </span>
                          {result.mbtiType && (
                            <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                              {result.mbtiType}
                            </span>
                          )}
                          {result.userId && (
                            <span className="ml-3 text-sm text-gray-500">
                              ID: {result.userId}
                            </span>
                          )}
                        </div>
                        <div>
                          {result.success ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              ✓ Success
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                              ✗ Failed
                            </span>
                          )}
                        </div>
                      </div>
                      {result.error && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-bold text-green-800 mb-2">
                    Database Insertion Complete!
                  </h3>
                  <p className="text-green-700 mb-4">{results.message}</p>
                  <div className="text-sm text-green-600 space-y-1">
                    <p>✓ Users inserted into USER table</p>
                    <p>✓ MBTI quiz completion (QUIZ_SEQUENCES)</p>
                    {results.includeTestData && (
                      <p>✓ Compatibility test answers (TEST_PROGRESS)</p>
                    )}
                    <p>✓ Complete profile data added</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!results && !loading && !error && !deleteResults && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🗄️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Generate or Delete Users</h2>
            <p className="text-gray-600 mb-6">
              Use the controls above to manage your test users
            </p>
          </div>
        )}
      </div>
    </div>
  );
}