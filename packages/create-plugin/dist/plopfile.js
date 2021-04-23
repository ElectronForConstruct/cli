"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(plop) {
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
            } */
        ],
        actions: (data) => {
            return [{
                    type: 'addMany',
                    destination: 'cyn-plugin-{{ name }}',
                    base: '../template/',
                    templateFiles: '../template/**/*',
                    globOptions: {
                        dot: true
                    }
                }];
        }
    });
}
exports.default = default_1;
