// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {NodePlopAPI} from 'plop';

export default function (plop: NodePlopAPI): any {
    const basePath = plop.getPlopfilePath()
    const destBasePath = plop.getDestBasePath()

    console.log('basePath', basePath)
    console.log('destBasePath', destBasePath)
    plop.setGenerator('plugin', {
        description: 'Create a new Cyn plugin',
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'What is the name of your plugin',
            default: 'myPlugin',
        }, /* {
            type: 'confirm',
            name: 'typescript',
            message: 'Use Typescript',
            default: true,
        } */],
        actions: (data) => {
            console.log('data', data)
            return [{
                type: 'addMany',
                destination: 'cyn-plugin-{{ name }}',
                base: '../template/',
                templateFiles: '../template/**/*',
                globOptions: {
                    dot: true
                }
            }]
        }
    });
}