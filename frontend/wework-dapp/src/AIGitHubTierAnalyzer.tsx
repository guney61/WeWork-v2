import { useState } from 'react'
import { useAITierStore } from './store/aiTierStore'
import TierBadge from './components/TierBadge'
import TierAnalysisDetails from './components/TierAnalysisDetails'

export default function AIGitHubTierAnalyzer() {
  const [username, setUsername] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const { analysis, loading, error, analyzeGitHubProfile, clearAnalysis } = useAITierStore()

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    await analyzeGitHubProfile(username)
  }

  const handleClear = () => {
    setUsername('')
    clearAnalysis()
    setShowDetails(false)
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-cyan-500/30 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">AI GitHub Tier Analyzer</h3>
          <p className="text-sm text-gray-400">Advanced AI-powered profile evaluation</p>
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username for AI analysis..."
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-cyan-500/25 disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze with AI'
            )}
          </button>
          {analysis && (
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg mb-6">
          <div className="flex items-center gap-2 text-red-200">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {analysis && (
        <div className="space-y-6 animate-fadeIn">
          {/* Tier Result */}
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm text-gray-400 mb-1">AI Assigned Tier</h4>
                <TierBadge tier={analysis.tier} />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Confidence Level</p>
                <p className="text-2xl font-bold text-cyan-400">{analysis.confidence}%</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-300 leading-relaxed">{analysis.reasoning}</p>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              AI Analysis Breakdown
            </h5>
            
            <div className="space-y-4">
              <ScoreBar
                label="Code Quality"
                score={analysis.detailedAnalysis.codeQuality}
                icon="💎"
                color="cyan"
              />
              <ScoreBar
                label="Activity Level"
                score={analysis.detailedAnalysis.activityLevel}
                icon="⚡"
                color="yellow"
              />
              <ScoreBar
                label="Community Impact"
                score={analysis.detailedAnalysis.communityImpact}
                icon="🌟"
                color="purple"
              />
              <ScoreBar
                label="Project Diversity"
                score={analysis.detailedAnalysis.projectDiversity}
                icon="🎯"
                color="green"
              />
            </div>
          </div>

          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
              <h5 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                <span>✨</span>
                Key Strengths
              </h5>
              <ul className="space-y-2">
                {analysis.strengths.map((strength: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {analysis.improvements.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h5 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                <span>💡</span>
                Growth Opportunities
              </h5>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* View Details Button */}
          <button
            onClick={() => {
              console.log('Button clicked! Setting showDetails to true')
              setShowDetails(true)
            }}
            type="button"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            View Detailed Analysis
          </button>
        </div>
      )}

      {/* Details Modal */}
      {analysis && showDetails && (
        <TierAnalysisDetails
          analysis={analysis}
          username={username}
          onClose={() => {
            console.log('Closing modal')
            setShowDetails(false)
          }}
        />
      )}
    </div>
  )
}

interface ScoreBarProps {
  label: string
  score: number
  icon: string
  color: 'cyan' | 'yellow' | 'purple' | 'green'
}

function ScoreBar({ label, score, icon, color }: ScoreBarProps) {
  const colorClasses = {
    cyan: 'bg-cyan-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  }

  const textColorClasses = {
    cyan: 'text-cyan-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400 flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </span>
        <span className={`text-sm font-bold ${textColorClasses[color]}`}>
          {score}/100
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-1000 ease-out rounded-full shadow-lg`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
