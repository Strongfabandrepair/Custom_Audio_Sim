import { Equipment, InstalledEquipment, UserVehicle, Vehicle } from './supabase';

export interface SystemStats {
  totalPowerDraw: number;
  totalRMS: number;
  estimatedSPL: number;
  electricalEfficiency: number;
  availablePower: number;
  voltageStability: number;
}

export interface FailureCheck {
  hasFailed: boolean;
  failureType?: 'electrical_overload' | 'voltage_drop' | 'structural_failure';
  description?: string;
  splAtFailure?: number;
}

export interface GlassBreakCheck {
  glassBroke: boolean;
  finalSPL: number;
}

export class GameEngine {
  static calculateSPL(
    installedEquipment: Array<InstalledEquipment & { equipment: Equipment }>,
    vehicle: Vehicle
  ): number {
    let baseSPL = 0;
    let totalRMS = 0;
    let subCount = 0;

    installedEquipment.forEach(({ equipment }) => {
      if (equipment.spl_rating > 0) {
        baseSPL += equipment.spl_rating;
        subCount++;
      }
      totalRMS += equipment.rms_watts;
    });

    if (subCount === 0) return 0;

    const avgSPL = baseSPL / subCount;

    const powerBonus = Math.log10(totalRMS / 100) * 3;
    const multiSubBonus = subCount > 1 ? Math.log2(subCount) * 2 : 0;

    const enclosureBonus = this.calculateEnclosureEffect(vehicle, subCount);

    return avgSPL + powerBonus + multiSubBonus + enclosureBonus;
  }

  static calculateEnclosureEffect(vehicle: Vehicle, subCount: number): number {
    const trunkVolume = (vehicle.trunk_width * vehicle.trunk_height * vehicle.trunk_depth) / 1000;
    const idealVolume = subCount * 50;
    const volumeRatio = trunkVolume / idealVolume;

    if (volumeRatio > 0.8 && volumeRatio < 1.5) {
      return 2;
    } else if (volumeRatio > 0.5 && volumeRatio < 2) {
      return 1;
    }
    return 0;
  }

  static calculateSystemStats(
    installedEquipment: Array<InstalledEquipment & { equipment: Equipment }>,
    userVehicle: UserVehicle,
    vehicle: Vehicle
  ): SystemStats {
    let totalPowerDraw = 0;
    let totalRMS = 0;

    installedEquipment.forEach(({ equipment }) => {
      totalPowerDraw += equipment.power_draw_watts;
      totalRMS += equipment.rms_watts;
    });

    const maxPowerAvailable = userVehicle.alternator_amps * 14.4;
    const electricalEfficiency = maxPowerAvailable > 0
      ? Math.min(100, ((maxPowerAvailable - totalPowerDraw) / maxPowerAvailable) * 100)
      : 0;

    const voltageStability = electricalEfficiency > 80 ? 100 :
                             electricalEfficiency > 60 ? 85 :
                             electricalEfficiency > 40 ? 70 :
                             electricalEfficiency > 20 ? 50 : 30;

    const estimatedSPL = this.calculateSPL(installedEquipment, vehicle);

    return {
      totalPowerDraw,
      totalRMS,
      estimatedSPL,
      electricalEfficiency,
      availablePower: maxPowerAvailable,
      voltageStability
    };
  }

  static generateAICompetitors(difficulty: number, count: number = 5): Array<{ name: string; spl: number }> {
    const names = [
      'Bass King', 'Sound Master', 'Thunder Rider', 'Boom Boss', 'SPL Pro',
      'Decibel Demon', 'Sonic Warrior', 'Audio Ace', 'Bass Beast', 'Woofer Wizard'
    ];

    const baseSPL = 85 + (difficulty * 3);
    const variance = 2 + difficulty;

    return names.slice(0, count).map(name => ({
      name,
      spl: baseSPL + (Math.random() * variance * 2) - variance
    }));
  }

  static checkCollision(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    existingEquipment: Array<InstalledEquipment & { equipment: Equipment }>
  ): boolean {
    return existingEquipment.some(installed => {
      const { equipment, position_x, position_y, position_z } = installed;

      const overlapX = Math.abs(x - position_x) < (width + equipment.size_width) / 2;
      const overlapY = Math.abs(y - position_y) < (height + equipment.size_height) / 2;
      const overlapZ = Math.abs(z - position_z) < (depth + equipment.size_depth) / 2;

      return overlapX && overlapY && overlapZ;
    });
  }

  static checkBounds(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    vehicle: Vehicle
  ): boolean {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    return (
      x - halfWidth >= 0 &&
      x + halfWidth <= vehicle.trunk_width &&
      y - halfHeight >= 0 &&
      y + halfHeight <= vehicle.trunk_height &&
      z - halfDepth >= 0 &&
      z + halfDepth <= vehicle.trunk_depth
    );
  }

  static checkForFailure(
    systemStats: SystemStats,
    userVehicle: UserVehicle
  ): FailureCheck {
    if (systemStats.totalPowerDraw > systemStats.availablePower * 1.5) {
      return {
        hasFailed: true,
        failureType: 'electrical_overload',
        description: 'Catastrophic electrical overload! The alternator couldn\'t handle the power draw and started smoking.',
        splAtFailure: systemStats.estimatedSPL * 0.7
      };
    }

    if (systemStats.electricalEfficiency < 10) {
      return {
        hasFailed: true,
        failureType: 'voltage_drop',
        description: 'Severe voltage drop detected! The system shut down to prevent damage.',
        splAtFailure: systemStats.estimatedSPL * 0.5
      };
    }

    if (systemStats.totalRMS > userVehicle.battery_capacity * 50) {
      return {
        hasFailed: true,
        failureType: 'structural_failure',
        description: 'The bass was too powerful! Something in the electrical system gave out.',
        splAtFailure: systemStats.estimatedSPL * 0.8
      };
    }

    return { hasFailed: false };
  }

  static checkGlassBreak(spl: number, systemStats: SystemStats): GlassBreakCheck {
    const glassBreakThreshold = 115;
    const hasMaxUpgrades = systemStats.totalRMS > 5000 && systemStats.electricalEfficiency > 70;

    const glassBroke = spl >= glassBreakThreshold && hasMaxUpgrades;

    return {
      glassBroke,
      finalSPL: spl
    };
  }
}
