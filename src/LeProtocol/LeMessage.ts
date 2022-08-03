export enum LeMessageTag {
    REQUEST_STATUS = 0x01,
    SERIAL = 0x02,
    VERSION = 0x03,
    MODEL = 0x04,
    SPEED = 0x0A,
    RIDE_MILAGE = 0x0B,
    TOTAL_MILAGE = 0x0C,
    BATTERY_CHARGE = 0x0D,
    SPEED_MODE = 0x10,          // rate_limiting (ride mode?)
    TEMPERATURE = 0x11,         // ??
    LOCK_MODE = 0x17,
    SPEED_UNITS = 0x18,         // ??
    START_MODE = 0x1A,          // ??
    VOLTAGE_MODE = 0x1B,
    WHEEL_DIAMETER_MODE = 0x1C,
    CRUISE_CONTROL = 0x1D,
    GEAR_MODE = 0x1F,
    RIDE_TIME = 0x22,           // ??
}

export class LeMessage {
    private static readonly PREAMBLE = [0xFF, 0x55];
    static readonly REQUEST_STATUS_PREBUILD = LeMessage.build(LeMessageTag.REQUEST_STATUS, []);
    constructor(readonly tag: LeMessageTag, readonly args: number[]) {}

    static build(tag: LeMessageTag, args: number[]): Uint8Array {
        if(args.length > 127) throw new Error(`LeMessage.build: argument list is too long (${args.length})`);
        const data = [...LeMessage.PREAMBLE, tag, args.length, ...args];
        data.push(data.reduce((a, b) => a + b) & 0xFF);
        return new Uint8Array(data);
    }

    static parse(data: Uint8Array): LeMessage {
        if(data.length < 5) throw new Error(`LeMessage.parse: data is too short (${data.length})`);

        if(data[0] !== 0xFF || data[1] !== 0x55) throw new Error(`LeMessage.parse: data preamble is invalid (${data[0]}, ${data[1]}) !== (0xFF, 0x55)`);

        const checksum = data[data.length - 1];
        const expected = data.slice(0, data.length - 1).reduce((a, b) => a + b) & 0xFF;
        if(checksum !== expected) throw new Error(`LeMessage.parse: checksum mismatch (${checksum} !== ${expected})`);

        const tag = data[2];
        const argLen = data[3];
        if(data.length !== 5 + argLen) throw new Error(`LeMessage.parse: data length is invalid (${data.length}) !== (${5 + argLen})`);
        const args = data.slice(4, 4 + argLen);

        return new LeMessage(tag, Array.from(args));
    }
}
