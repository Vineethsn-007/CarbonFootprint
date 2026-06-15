import { describe, it, expect } from 'vitest'
import { calculateCarbonFootprint, getSustainabilityLevel, getBenchmarkComparison } from '../utils/carbonCalculator'

describe('calculateCarbonFootprint', () => {
  const baseInput = {
    transportation: { carKmPerWeek: 0, busKmPerWeek: 0, trainKmPerWeek: 0, flightsShortPerYear: 0, flightsLongPerYear: 0, avgFlightDistanceKm: 800, avgFlightDistanceLongKm: 5000 },
    energy: { electricityKwh: 0, gasKgPerMonth: 0, waterLitersPerDay: 0 },
    food: { dietType: 'mixed' },
    shopping: { clothingItemsPerMonth: 0, electronicsItemsPerYear: 0 },
    waste: { plasticKgPerWeek: 0, recycling: false },
  }

  it('returns zero transportation for no travel', () => {
    const result = calculateCarbonFootprint(baseInput)
    expect(result.transportation).toBe(0)
  })

  it('calculates car emissions correctly (100 km/week)', () => {
    const input = {
      ...baseInput,
      transportation: { ...baseInput.transportation, carKmPerWeek: 100 },
    }
    const result = calculateCarbonFootprint(input)
    // 100 km/week * 4.33 weeks/month * 0.21 kg/km ≈ 90.9 kg
    expect(result.transportation).toBeCloseTo(90.9, 0)
  })

  it('returns correct food emission for vegetarian diet', () => {
    const input = { ...baseInput, food: { dietType: 'vegetarian' } }
    const result = calculateCarbonFootprint(input)
    expect(result.food).toBe(50)
  })

  it('returns correct food emission for non-vegetarian diet', () => {
    const input = { ...baseInput, food: { dietType: 'nonVegetarian' } }
    const result = calculateCarbonFootprint(input)
    expect(result.food).toBe(200)
  })

  it('calculates energy from electricity correctly', () => {
    const input = {
      ...baseInput,
      energy: { ...baseInput.energy, electricityKwh: 100 },
    }
    const result = calculateCarbonFootprint(input)
    // 100 kWh * 0.82 = 82 kg
    expect(result.energy).toBeCloseTo(82, 0)
  })

  it('applies recycling reduction to waste', () => {
    const withRecycling = {
      ...baseInput,
      waste: { plasticKgPerWeek: 1, recycling: true },
    }
    const withoutRecycling = {
      ...baseInput,
      waste: { plasticKgPerWeek: 1, recycling: false },
    }
    const r1 = calculateCarbonFootprint(withRecycling)
    const r2 = calculateCarbonFootprint(withoutRecycling)
    expect(r1.waste).toBeLessThan(r2.waste)
  })

  it('returns all category keys', () => {
    const result = calculateCarbonFootprint(baseInput)
    expect(result).toHaveProperty('transportation')
    expect(result).toHaveProperty('energy')
    expect(result).toHaveProperty('food')
    expect(result).toHaveProperty('shopping')
    expect(result).toHaveProperty('waste')
    expect(result).toHaveProperty('totalKgCO2')
    expect(result).toHaveProperty('sustainabilityScore')
    expect(result).toHaveProperty('breakdown')
  })

  it('sustainability score is between 0 and 100', () => {
    const result = calculateCarbonFootprint(baseInput)
    expect(result.sustainabilityScore).toBeGreaterThanOrEqual(0)
    expect(result.sustainabilityScore).toBeLessThanOrEqual(100)
  })

  it('breakdown percentages sum to 100 or less', () => {
    const input = { ...baseInput, food: { dietType: 'nonVegetarian' } }
    const result = calculateCarbonFootprint(input)
    const total = Object.values(result.breakdown).reduce((a, b) => a + b, 0)
    expect(total).toBeLessThanOrEqual(101) // Allow small rounding
  })
})

describe('getSustainabilityLevel', () => {
  it('returns Excellent for score >= 80', () => {
    expect(getSustainabilityLevel(85).label).toBe('Excellent')
  })

  it('returns Good for score 60-79', () => {
    expect(getSustainabilityLevel(65).label).toBe('Good')
  })

  it('returns Average for score 40-59', () => {
    expect(getSustainabilityLevel(45).label).toBe('Average')
  })

  it('returns High Impact for score < 20', () => {
    expect(getSustainabilityLevel(10).label).toBe('High Impact')
  })
})

describe('getBenchmarkComparison', () => {
  it('shows positive vs global avg for low emissions', () => {
    const { vsGlobalAvg } = getBenchmarkComparison(200)
    expect(vsGlobalAvg).toBeGreaterThan(0)
  })

  it('shows negative vs global avg for high emissions', () => {
    const { vsGlobalAvg } = getBenchmarkComparison(1200)
    expect(vsGlobalAvg).toBeLessThan(0)
  })
})
