import * as request from 'request-promise-native';
import {LoggerInstance} from 'winston';

/* 
    Documentation for vmapi: https://github.com/joyent/sdc-vmapi/blob/master/docs/index.md
*/

export class Vmapi {
    private _baseUrl: string;
    private _logger: LoggerInstance;

    constructor (ipAddress: string, logger: LoggerInstance) {
        this._baseUrl = `http://${ipAddress}/vms`;
        this._logger = logger;
    }

    async getAllVirtualMachines() {
        this._logger.info('Fetching virtual machines from VmApi');
        const options: request.OptionsWithUri = {
            uri: this._baseUrl,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const virtualMachines = JSON.parse(await request(options));
            return virtualMachines;
        } catch (err) {
            this._logger.error('Failed to fetch virtual machines from VmApi');
            this._logger.error(err);
            throw err;
        }
    }

    async getVirtualMachinesByOwnerUuid(ownerId: string) {
        this._logger.info(`Fetching virtual machine from VmApi with owner_uuid: "${ownerId}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}?query=(%26(owner_uuid=${ownerId})(%21(state=destroyed)))`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const virtualMachines = JSON.parse(await request(options));
            return virtualMachines;
        } catch (err) {
            this._logger.error('Failed to fetch virtual machines from VmApi with owner');
            this._logger.error(err);
            throw err;
        }
    }

    async getVirtualMachineByUuid(uuid: string) {
        this._logger.info(`Fetching virtual machine from VmApi with uuid: "${uuid}"`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${uuid}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const virtualMachine = JSON.parse(await request(options));
            return virtualMachine;
        } catch (err) {
            this._logger.error('Failed to fetch virtual machines from VmApi');
            this._logger.error(err);
            throw err;
        }
    }

    async createVirtualMachine(virtualMachine: any) {

        this._logger.info(`Creating new virtual machine: ${JSON.stringify(virtualMachine)}`);
        const options: request.OptionsWithUri = {
            uri: this._baseUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(virtualMachine)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to create vm');
            this._logger.error(err);
            throw err;
        }
    }

    //TODO update virtual machine

    async startVirtualMachine(ownerId: string, vmId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId,
            action: 'start'
        };

        this._logger.info(`Starting virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=start&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to start vm');
            this._logger.error(err);
            throw err;
        }
    }

    async stopVirtualMachine(ownerId: string, vmId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId,
            action: 'stop'
        };

        this._logger.info(`Stopping virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=stop&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to stop vm');
            this._logger.error(err);
            throw err;
        }
    }

    async rebootVirtualMachine(ownerId: string, vmId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId,
            action: 'reboot'
        };

        this._logger.info(`Rebooting virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=reboot&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to reboot vm');
            this._logger.error(err);
            throw err;
        }
    }

    async addVirtualMachineToNetwork(ownerId: string, vmId: string, networkId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId,
            action: 'add_nics',
            networks: [networkId]
        };

        this._logger.info(`Adding virtual machine: ${vmId} to network: ${networkId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=add_nics&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to add vm to network');
            this._logger.error(err);
            throw err;
        }
    }

    async removeNicFromVirtualMachine(ownerId: string, vmId: string, macId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId,
            action: 'remove_nics',
            macs: [macId]
        };

        this._logger.info(`Removing NIC: ${macId} from virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?action=add_nics&sync=true`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to remove NIC from vm');
            this._logger.error(err);
            throw err;
        }
    }

    async deleteVirtualMachine(ownerId: string, vmId: string) {
        const payload = {
            uuid: vmId,
            owner_uuid: ownerId
        };

        this._logger.info(`Deleting virtual machine: ${vmId}`);
        const options: request.OptionsWithUri = {
            uri: `${this._baseUrl}/${vmId}?owner_uuid=${ownerId}&sync=true`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        try {
            const result = JSON.parse(await request(options));
            return result;
        } catch (err) {
            this._logger.error('Failed to delete vm');
            this._logger.error(err);
            throw err;
        }
    }
}