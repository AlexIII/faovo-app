import { LeMessage, LeMessageTag } from "./LeMessage";
import * as U from 'Utils';

export interface LeDecoder {
    readonly TAG: LeMessageTag;
    decodeArg(args: number[]): string | number;
}

const assertArgsLength = (args: number[], expected: number, tag: LeMessageTag) => {
    if(args.length !== expected)
        throw new Error(`${LeMessageTag[tag]} expected ${expected} arguments, got ${args.length}`);
};

const convertToBigEndian = (args: number[]) => args.reduce((res, byte) => (res << 8) | byte, 0);

const decoderSpeed: LeDecoder = {
    TAG: LeMessageTag.SPEED,
    decodeArg: args => {
        assertArgsLength(args, 2, LeMessageTag.SPEED);
        return convertToBigEndian(args) / 1000.0;
    }
};

const decoderRideMileage: LeDecoder = {
    TAG: LeMessageTag.RIDE_MILAGE,
    decodeArg: args => {
        assertArgsLength(args, 4, LeMessageTag.RIDE_MILAGE);
        return convertToBigEndian(args) / 1000.0;
    }
};

const decoderTotalMileage: LeDecoder = {
    TAG: LeMessageTag.TOTAL_MILAGE,
    decodeArg: args => {
        assertArgsLength(args, 4, LeMessageTag.TOTAL_MILAGE);
        return convertToBigEndian(args) / 1000.0;
    }
};

const decoderBatteryCharge: LeDecoder = {
    TAG: LeMessageTag.BATTERY_CHARGE,
    decodeArg: args => {
        assertArgsLength(args, 1, LeMessageTag.BATTERY_CHARGE);
        return args[0];
    }
};

const decoderSpeedMode: LeDecoder = {
    TAG: LeMessageTag.SPEED_MODE,
    decodeArg: args => {
        throw new Error(`${LeMessageTag[LeMessageTag.SPEED_MODE]} is not implemented`);
    }
};

const decoderTemperature: LeDecoder = {
    TAG: LeMessageTag.TEMPERATURE,
    decodeArg: args => {
        throw new Error(`${LeMessageTag[LeMessageTag.TEMPERATURE]} is not implemented`);
    }
};

const decoderLockMode: LeDecoder = {
    TAG: LeMessageTag.LOCK_MODE,
    decodeArg: args => {
        throw new Error(`${LeMessageTag[LeMessageTag.LOCK_MODE]} is not implemented`);
    }
};

const decoderSpeedUnits: LeDecoder = {
    TAG: LeMessageTag.SPEED_UNITS,
    decodeArg: args => {
        throw new Error(`${LeMessageTag[LeMessageTag.SPEED_UNITS]} is not implemented`);
    }
};

const decoderStartMode: LeDecoder = {
    TAG: LeMessageTag.START_MODE,
    decodeArg: args => {
        throw new Error(`${LeMessageTag[LeMessageTag.START_MODE]} is not implemented`);
    }
};

const decoderVoltageMode: LeDecoder = {
    TAG: LeMessageTag.VOLTAGE_MODE,
    decodeArg: args => {
        throw new Error(`${LeMessageTag[LeMessageTag.VOLTAGE_MODE]} is not implemented`);
    }
};

const decoderWheelDiameterMode: LeDecoder = {
    TAG: LeMessageTag.WHEEL_DIAMETER_MODE,
    decodeArg: args => {
        throw new Error(`${LeMessageTag[LeMessageTag.WHEEL_DIAMETER_MODE]} is not implemented`);
    }
};

const decoderCruiseControl: LeDecoder = {
    TAG: LeMessageTag.CRUISE_CONTROL,
    decodeArg: args => {
        throw new Error(`${LeMessageTag[LeMessageTag.CRUISE_CONTROL]} is not implemented`);
    }
};

const decoderGearMode: LeDecoder = {
    TAG: LeMessageTag.GEAR_MODE,
    decodeArg: args => {
        throw new Error(`${LeMessageTag[LeMessageTag.GEAR_MODE]} is not implemented`);
    }
};

const decoderRideTime: LeDecoder = {
    TAG: LeMessageTag.RIDE_TIME,
    decodeArg: args => {
        assertArgsLength(args, 2, decoderSpeed.TAG);
        return convertToBigEndian(args);
    }
};

const leDecoders = U.index([
    decoderSpeed, decoderRideMileage, decoderTotalMileage, decoderBatteryCharge, decoderRideTime
], x => String(x.TAG));

export const leDecode = (msg: LeMessage): string | number | undefined => leDecoders[msg.tag]?.decodeArg(msg.args);
