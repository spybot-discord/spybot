import { readdir } from 'fs/promises';
export const handler = async ({ client }) => {
    const commandsDir = await readdir('./commands/');
    commandsDir.forEach(async (dir) => {
        const commandsTypeDir = await readdir(`./commands/${dir}/`);
        commandsTypeDir
            .filter(file => file.endsWith('.js'))
            .forEach(async (file) => {
            const { default: pull } = await import(`../commands/${dir}/${file}`);
            client.commands.set(pull.name, pull);
        });
    });
    console.log('-------------------------------------');
    console.log('[INFO]: Commands Loaded!');
};
