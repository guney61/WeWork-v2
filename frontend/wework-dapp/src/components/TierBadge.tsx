interface TierBadgeProps {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond'
  size?: 'sm' | 'md' | 'lg'
}

export default function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-xl',
  }

  const tierColors = {
    Bronze: 'from-orange-600 to-orange-800 text-orange-100',
    Silver: 'from-gray-400 to-gray-600 text-gray-100',
    Gold: 'from-yellow-400 to-yellow-600 text-yellow-900',
    Diamond: 'from-cyan-400 to-blue-600 text-white',
  }

  const tierEmojis = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Diamond: '💎',
  }

  return (
    <div
      className={`inline-flex items-center gap-2 bg-gradient-to-r ${tierColors[tier]} ${sizeClasses[size]} rounded-lg font-bold shadow-lg`}
    >
      <span>{tierEmojis[tier]}</span>
      <span>{tier}</span>
    </div>
  )
}
