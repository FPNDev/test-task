import { WeightType } from '../constant/teeter';

export function createRandomWeight() {
  const typeKeys = Object.keys(WeightType);

  return {
    mass: Math.round(Math.random() * 9) + 1,
    type: WeightType[typeKeys[Math.round(Math.random() * (typeKeys.length - 1))]]
  }
}