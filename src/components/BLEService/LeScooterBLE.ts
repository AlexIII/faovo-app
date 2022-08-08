import { LeMessage, LeMessageTag, leDecode } from 'LeProtocol';
import * as U from 'Utils';

const RECONNECT_ATTEMPTS = 5;

const requestBLEDeviceAndConnect = async (
    serviceUUID: string,
    characteristicUUIDs: string[],
    onDisconnect: (error: Error) => void,
    cacheDevice?: { current: BluetoothDevice | undefined }
): Promise<{
    disconnect: () => void;
    characteristics: BluetoothRemoteGATTCharacteristic[];
}> => {
    cacheDevice ??= { current: undefined };
    cacheDevice.current ??= await navigator.bluetooth.requestDevice({ filters: [{services: [serviceUUID]}] });
    const device = cacheDevice.current;
    console.log('device requested');

    if(!device.gatt) throw new Error('Device has no GATT service');
    device.gatt.disconnect();
    const handleDisconnect = () => {
        console.log('BLE device disconnected');
        device.removeEventListener('gattserverdisconnected', handleDisconnect);
        onDisconnect(new Error('Device disconnected'));
    };
    device.addEventListener('gattserverdisconnected', handleDisconnect);
    console.log('BLE device listening on disconnect');
    const server = await (async () => {
        if(!device.gatt) throw new Error('Device has no GATT service');
        let lastError: Error | undefined;
        // Silently attempt reconnect 5 times
        for(let i = 0; i < RECONNECT_ATTEMPTS; ++ i) {
            try {
                return await device.gatt.connect();
            } catch(e) {
                lastError = e as Error;
                console.log('BLE device connect failed, retrying...');
                await U.delay(1000);
            }
        }
        throw lastError;
    })();
    console.log('BLE device connected');
    await U.delay(1000);
    const service = await server.getPrimaryService(serviceUUID);
    console.log('BLE device got service');
    const characteristics = await Promise.all(characteristicUUIDs.map(char => service.getCharacteristic(char)));
    console.log('BLE device got characteristics');
    await U.delay(500);

    return { disconnect: () => server.disconnect(), characteristics };
};

type OnReceiveCallbackType = (tag: string, value: string | number) => void;

export class LeScooterBLE {
    static readonly SCOOTER_SERVICE_UUID = '00007777-0000-1000-8000-00805f9b34fb';
    static readonly SCOOTER_CHARACTERISTIC_READ_UUID = '00008888-0000-1000-8000-00805f9b34fb';
    static readonly SCOOTER_CHARACTERISTIC_WRITE_UUID = '00008877-0000-1000-8000-00805f9b34fb';

    private constructor(
        private readonly connection: Awaited<ReturnType<typeof LeScooterBLE.requestScooterBLEDeviceAndConnect>>,
        private readonly onReceive: { current: OnReceiveCallbackType | undefined }
    ) {}

    static async connect(onDisconnect: (error: Error) => void, cacheDevice?: { current: BluetoothDevice | undefined }) {
        const onReceive: { current: OnReceiveCallbackType | undefined } = { current: undefined };
        return new LeScooterBLE(await LeScooterBLE.requestScooterBLEDeviceAndConnect(onDisconnect, data => {
            const res = LeScooterBLE.parse(data);
            if(res) onReceive.current?.(res.tag, res.value);
        }, cacheDevice), onReceive);
    }

    setOnReceive(onReceive: OnReceiveCallbackType | undefined) {
        this.onReceive.current = onReceive;
    }

    requestData() {
        return this.command(LeMessage.REQUEST_STATUS_PREBUILD);
    }

    command(data: Uint8Array): Promise<void>;
    command(tag: LeMessageTag, args?: number[]): Promise<void>;
    async command(tag_or_data: Uint8Array | LeMessageTag, args?: number[]) {
        try {
            tag_or_data = tag_or_data instanceof Uint8Array? tag_or_data : LeMessage.build(tag_or_data, args ?? []);
            return await this.connection.write(tag_or_data);
        } catch(err) {
            console.log(`BLE GATT write error: ${err}`);
            throw err;
        }
    }

    disconnect() {
        this.setOnReceive(undefined);
        this.connection.disconnect();
    }

    static parse(data: Uint8Array): { tag: string; value: string | number; } | undefined{
        const msg = LeMessage.parse(data);
        const value = leDecode(msg);
        if(value === undefined || !(msg.tag in LeMessageTag)) return undefined;
        return { tag: LeMessageTag[msg.tag], value };
    }

    private static async requestScooterBLEDeviceAndConnect(
        onDisconnect: (error: Error) => void,
        onDataReceive: (data: Uint8Array) => void,
        cacheDevice?: { current: BluetoothDevice | undefined }
    ): Promise<{
        disconnect: () => void;
        write: (data: Uint8Array) => Promise<void>;
    }> {
        const { disconnect, characteristics } = await requestBLEDeviceAndConnect(
            LeScooterBLE.SCOOTER_SERVICE_UUID,
            [ LeScooterBLE.SCOOTER_CHARACTERISTIC_READ_UUID, LeScooterBLE.SCOOTER_CHARACTERISTIC_WRITE_UUID ],
            onDisconnect,
            cacheDevice
        );
        characteristics[0].addEventListener('characteristicvaluechanged', event => {
            const data = new Uint8Array((event?.target as any)?.value?.buffer);
            if(data.length) onDataReceive(data);
        });
        characteristics[0].startNotifications();
        return {
            disconnect,
            write: data => characteristics[1].writeValue(data)
        };
    }
}
