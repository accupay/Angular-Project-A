export interface TsAppVersion {
    version: string;
    name: string;
    description?: string;
    versionLong?: string;
    versionDate: string;
    gitCommitHash?: string;
    gitCommitDate?: string;
    gitTag?: string;
};
export const versions: TsAppVersion = {
    version: 'local',
    name: 'apt',
    versionDate: '2023-03-03T15:56:40.258Z',
    gitCommitHash: 'N/A',
    versionLong: 'local-N/A',
};
export default versions;
