import { AITierAnalysis } from '../aiTierService'
import TierBadge from './TierBadge'

interface TierAnalysisDetailsProps {
  analysis: AITierAnalysis
  username: string
  onClose: () => void
}

export default function TierAnalysisDetails({ analysis, username, onClose }: TierAnalysisDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-cyan-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Detailed Analysis Report</h2>
            <p className="text-gray-400">@{username}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-4xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Tier */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/50 rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">AI Assigned Tier</h3>
                <TierBadge tier={analysis.tier} size="lg" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">Confidence Level</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.confidence / 100)}`}
                        className="text-cyan-500 transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-cyan-400">{analysis.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-cyan-500/30">
              <h4 className="text-lg font-semibold text-white mb-3">Analysis Summary</h4>
              <p className="text-gray-300 leading-relaxed">{analysis.reasoning}</p>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid md:grid-cols-2 gap-4">
            <ScoreCard
              title="Code Quality"
              score={analysis.detailedAnalysis.codeQuality}
              icon="💎"
              color="cyan"
              description="Code standards, documentation, and repository organization"
            />
            <ScoreCard
              title="Activity Level"
              score={analysis.detailedAnalysis.activityLevel}
              icon="⚡"
              color="yellow"
              description="Contribution frequency and consistency"
            />
            <ScoreCard
              title="Community Impact"
              score={analysis.detailedAnalysis.communityImpact}
              icon="🌟"
              color="purple"
              description="Stars, forks, and follower engagement"
            />
            <ScoreCard
              title="Project Diversity"
              score={analysis.detailedAnalysis.projectDiversity}
              icon="🎯"
              color="green"
              description="Range of technologies and project types"
            />
          </div>

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
                <h4 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <span>✨</span>
                  Key Strengths
                </h4>
                <ul className="space-y-3">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1 text-xl">✓</span>
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {analysis.improvements.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                <h4 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <span>💡</span>
                  Growth Opportunities
                </h4>
                <ul className="space-y-3">
                  {analysis.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1 text-xl">→</span>
                      <span className="text-gray-300">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ScoreCardProps {
  title: string
  score: number
  icon: string
  color: 'cyan' | 'yellow' | 'purple' | 'green'
  description: string
}

function ScoreCard({ title, score, icon, color, description }: ScoreCardProps) {
  const colorClasses = {
    cyan: {
      bg: 'from-cyan-900/30 to-cyan-800/30',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      bar: 'bg-cyan-500',
    },
    yellow: {
      bg: 'from-yellow-900/30 to-yellow-800/30',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      bar: 'bg-yellow-500',
    },
    purple: {
      bg: 'from-purple-900/30 to-purple-800/30',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      bar: 'bg-purple-500',
    },
    green: {
      bg: 'from-green-900/30 to-green-800/30',
      border: 'border-green-500/30',
      text: 'text-green-400',
      bar: 'bg-green-500',
    },
  }

  const classes = colorClasses[color]

  return (
    <div className={`bg-gradient-to-br ${classes.bg} border ${classes.border} rounded-xl p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Score</span>
          <span className={`text-2xl font-bold ${classes.text}`}>{score}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full ${classes.bar} transition-all duration-1000 ease-out rounded-full shadow-lg`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  )
}
