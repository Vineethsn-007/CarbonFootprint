/**
 * Carbon emission factors (kg CO₂ per unit)
 */
export const EMISSION_FACTORS = {
  transportation: {
    carPerKm: 0.21,         // average petrol car
    bikePerKm: 0.0,         // bicycle = 0
    busPerKm: 0.089,        // public bus
    trainPerKm: 0.041,      // rail
    flightShortHaulPerKm: 0.255,  // < 1500 km
    flightLongHaulPerKm: 0.195,   // > 1500 km
  },
  energy: {
    electricityPerKwh: 0.82,  // India grid average
    gasPerUnit: 2.98,          // LPG per kg
    waterPerLiter: 0.000298,   // water treatment
  },
  food: {
    vegetarian: 50,     // kg CO₂/month
    mixed: 120,         // kg CO₂/month
    nonVegetarian: 200, // kg CO₂/month
  },
  shopping: {
    clothingPerItem: 15,     // kg CO₂ per clothing item
    electronicsPerItem: 70,  // kg CO₂ per device
  },
  waste: {
    recyclingReduction: 0.15,  // 15% reduction if recycling
    plasticPerKg: 6,           // kg CO₂ per kg plastic
  },
}

/**
 * Calculate total carbon footprint from user input
 * @param {Object} data - form data from calculator
 * @returns {Object} - breakdown + total in kg CO₂
 */
export function calculateCarbonFootprint(data) {
  const { transportation, energy, food, shopping, waste } = data

  // Transportation (monthly)
  const carEmissions = (transportation.carKmPerWeek || 0) * 4.33 * EMISSION_FACTORS.transportation.carPerKm
  const busEmissions = (transportation.busKmPerWeek || 0) * 4.33 * EMISSION_FACTORS.transportation.busPerKm
  const trainEmissions = (transportation.trainKmPerWeek || 0) * 4.33 * EMISSION_FACTORS.transportation.trainPerKm
  const flightEmissions =
    (transportation.flightsShortPerYear || 0) * (transportation.avgFlightDistanceKm || 800) *
    EMISSION_FACTORS.transportation.flightShortHaulPerKm / 12 +
    (transportation.flightsLongPerYear || 0) * (transportation.avgFlightDistanceLongKm || 5000) *
    EMISSION_FACTORS.transportation.flightLongHaulPerKm / 12

  const transportationTotal = carEmissions + busEmissions + trainEmissions + flightEmissions

  // Energy (monthly)
  const electricityEmissions = (energy.electricityKwh || 0) * EMISSION_FACTORS.energy.electricityPerKwh
  const gasEmissions = (energy.gasKgPerMonth || 0) * EMISSION_FACTORS.energy.gasPerUnit
  const waterEmissions = (energy.waterLitersPerDay || 0) * 30 * EMISSION_FACTORS.energy.waterPerLiter

  const energyTotal = electricityEmissions + gasEmissions + waterEmissions

  // Food (monthly based on diet type)
  const foodTotal = EMISSION_FACTORS.food[food.dietType || 'mixed']

  // Shopping (monthly)
  const clothingEmissions = (shopping.clothingItemsPerMonth || 0) * EMISSION_FACTORS.shopping.clothingPerItem
  const electronicsEmissions = (shopping.electronicsItemsPerYear || 0) / 12 * EMISSION_FACTORS.shopping.electronicsPerItem

  const shoppingTotal = clothingEmissions + electronicsEmissions

  // Waste (monthly)
  const plasticEmissions = (waste.plasticKgPerWeek || 0) * 4.33 * EMISSION_FACTORS.waste.plasticPerKg
  const recyclingFactor = waste.recycling ? (1 - EMISSION_FACTORS.waste.recyclingReduction) : 1
  const wasteTotal = plasticEmissions * recyclingFactor

  const total = transportationTotal + energyTotal + foodTotal + shoppingTotal + wasteTotal

  return {
    transportation: Math.round(transportationTotal * 10) / 10,
    energy: Math.round(energyTotal * 10) / 10,
    food: Math.round(foodTotal * 10) / 10,
    shopping: Math.round(shoppingTotal * 10) / 10,
    waste: Math.round(wasteTotal * 10) / 10,
    totalKgCO2: Math.round(total * 10) / 10,
    // Sustainability score (0-100)
    sustainabilityScore: calculateScore(total),
    // Category breakdown percentages
    breakdown: {
      transportation: total > 0 ? Math.round((transportationTotal / total) * 100) : 0,
      energy: total > 0 ? Math.round((energyTotal / total) * 100) : 0,
      food: total > 0 ? Math.round((foodTotal / total) * 100) : 0,
      shopping: total > 0 ? Math.round((shoppingTotal / total) * 100) : 0,
      waste: total > 0 ? Math.round((wasteTotal / total) * 100) : 0,
    },
  }
}

function calculateScore(monthlyKgCO2) {
  // Global average: ~800 kg/month. Score is inverted.
  const avg = 800
  const score = Math.max(0, Math.min(100, Math.round(((avg * 2 - monthlyKgCO2) / (avg * 2)) * 100)))
  return score
}

/**
 * Get the sustainability level label
 */
export function getSustainabilityLevel(score) {
  if (score >= 80) return { label: 'Excellent', color: '#22c55e', rank: 'Sustainability Champion' }
  if (score >= 60) return { label: 'Good', color: '#84cc16', rank: 'Eco Warrior' }
  if (score >= 40) return { label: 'Average', color: '#eab308', rank: 'Carbon Reducer' }
  if (score >= 20) return { label: 'Below Average', color: '#f97316', rank: 'Green Beginner' }
  return { label: 'High Impact', color: '#ef4444', rank: 'Awareness Needed' }
}

/**
 * Compare to global benchmarks
 */
export function getBenchmarkComparison(monthlyKgCO2) {
  const globalAvg = 800
  const indiaAvg = 150
  const parisTarget = 83 // ~1 ton/year

  return {
    vsGlobalAvg: Math.round(((globalAvg - monthlyKgCO2) / globalAvg) * 100),
    vsIndiaAvg: Math.round(((indiaAvg - monthlyKgCO2) / indiaAvg) * 100),
    vsParisTarget: Math.round(((parisTarget - monthlyKgCO2) / parisTarget) * 100),
  }
}

/**
 * Check which badges to award based on emissions
 */
export function checkBadgeEligibility(emissionData, goals) {
  const badges = []

  if (emissionData.energy < 50) badges.push('energy_saver')
  if (emissionData.transportation.busKmPerWeek > 20) badges.push('public_transport_hero')
  if (goals?.filter((g) => g.status === 'completed').length >= 5) badges.push('goal_achiever')
  if (emissionData.waste?.recycling) badges.push('recycling_hero')

  return badges
}
