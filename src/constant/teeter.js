export const TeeterLength = 10;
export const PxPerMeter = 100;
export const Torque = .5;

export const FallStartSpeed = 1;
export const FallSpeedAmplifier = .1;
export const FallSpeedMax = 25;

export const WeightType = {
    Rect: 0,
    Triangle: 1,
    Circle: 2
}

export const WeightTypeClassMap = {
    [WeightType.Rect]: '_rect',
    [WeightType.Triangle]: '_triangle',
    [WeightType.Circle]: '_circle',
}