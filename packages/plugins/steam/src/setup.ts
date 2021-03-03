import { createScopedLogger } from '@cyn/utils';

interface AppBuild {
    name: string;
    appid: string;
    desc: string;
    buildoutput: string;
    setlive: string;
    preview: string;
    local: string;
    depots: string[];
}

interface FileMapping {
    LocalPath: string;
    DepotPath: string;
    recursive: string;
}

interface DepotBuild {
    name: string;
    DepotID: string;
    ContentRoot: string;
    FileMapping: FileMapping;
    FileExclusion: string;
}

interface Config {
    appBuild: AppBuild[];
    depotBuild: DepotBuild[];
}

const config: Config = {
    appBuild: [],
    depotBuild: []
};

export default {
    description: 'Description',
    name: 'steam/setup',
    config,
    run({ workingDirectory, taskSettings }: { workingDirectory: any, taskSettings: any }): any {
        const logger = createScopedLogger('steam')

        const settings = taskSettings as any;

        console.log('settings', settings)


        // ./builder/steamcmd.exe +login "account" "password" +run_app_build ..\scripts\[build_script_name].vdf +quit


        return {
            source: workingDirectory,
        };
    },
}