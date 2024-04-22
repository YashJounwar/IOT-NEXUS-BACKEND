const oneCubicInch = 0.0163871; // liters(unit)
const pi = 3.14; // pi value
export function mmToInches(heightInMM) {
    // 1 inch = 25.4 millimeters
    const inches = heightInMM / 25.4;
    return inches;
}

export function volumeOfWater(height,diameter){
    let radius;
    diameter = parseInt(diameter);
    radius = diameter / 2;
    radius = mmToInches(radius);
    let volume = pi*radius*radius*height; // volume in cubic inch

    return volume;
}

export function letersOfWater(volume){
    const waterLeters = volume * oneCubicInch; 
    return waterLeters;
}