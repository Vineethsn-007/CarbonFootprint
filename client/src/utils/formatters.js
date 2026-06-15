import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = date?.toDate ? date.toDate() : new Date(date)
  return format(d, 'MMM dd, yyyy')
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

export const formatMonthYear = (date) => {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  return format(d, 'MMM yyyy')
}

export const formatNumber = (n, decimals = 1) => {
  if (n === undefined || n === null) return '0'
  return Number(n).toFixed(decimals)
}

export const formatKgCO2 = (kg) => {
  if (!kg) return '0 kg'
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} tonnes`
  return `${formatNumber(kg)} kg`
}

export const getChangePercent = (current, previous) => {
  if (!previous || previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export const getCategoryIcon = (category) => {
  const icons = {
    transportation: '🚗',
    energy: '⚡',
    food: '🥗',
    shopping: '🛍️',
    waste: '♻️',
    climate_change: '🌡️',
    renewable_energy: '☀️',
    waste_management: '🗑️',
    sustainable_lifestyle: '🌱',
    carbon_neutrality: '🌍',
  }
  return icons[category] || '🌿'
}

export const getCategoryColor = (category) => {
  const colors = {
    transportation: '#3b82f6',
    energy: '#f59e0b',
    food: '#10b981',
    shopping: '#8b5cf6',
    waste: '#6b7280',
  }
  return colors[category] || '#22c55e'
}

export const BADGE_CONFIG = {
  energy_saver: {
    icon: '⚡',
    label: 'Energy Saver',
    description: 'Kept monthly energy emissions under 50 kg CO₂',
    color: '#f59e0b',
  },
  water_saver: {
    icon: '💧',
    label: 'Water Saver',
    description: 'Reduced water consumption significantly',
    color: '#3b82f6',
  },
  tree_planter: {
    icon: '🌳',
    label: 'Tree Planter',
    description: 'Completed tree planting challenge',
    color: '#22c55e',
  },
  public_transport_hero: {
    icon: '🚌',
    label: 'Public Transport Hero',
    description: 'Used public transport 20+ km/week',
    color: '#8b5cf6',
  },
  recycling_hero: {
    icon: '♻️',
    label: 'Recycling Hero',
    description: 'Actively recycles household waste',
    color: '#14b8a6',
  },
  goal_achiever: {
    icon: '🎯',
    label: 'Goal Achiever',
    description: 'Completed 5 or more eco-goals',
    color: '#ef4444',
  },
  green_beginner: {
    icon: '🌱',
    label: 'Green Beginner',
    description: 'Started your sustainability journey',
    color: '#84cc16',
  },
  eco_warrior: {
    icon: '🛡️',
    label: 'Eco Warrior',
    description: 'Sustainability score above 60',
    color: '#16a34a',
  },
}

export const RANK_CONFIG = {
  champion: { label: 'Sustainability Champion', minScore: 80, color: '#f59e0b', gradient: 'badge-champion' },
  warrior: { label: 'Eco Warrior', minScore: 60, color: '#22c55e', gradient: 'badge-eco-warrior' },
  reducer: { label: 'Carbon Reducer', minScore: 40, color: '#14b8a6', gradient: 'badge-carbon-reducer' },
  beginner: { label: 'Green Beginner', minScore: 0, color: '#84cc16', gradient: 'badge-green-beginner' },
}

export function getRank(score) {
  if (score >= 80) return RANK_CONFIG.champion
  if (score >= 60) return RANK_CONFIG.warrior
  if (score >= 40) return RANK_CONFIG.reducer
  return RANK_CONFIG.beginner
}
