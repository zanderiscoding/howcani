import Conf from 'conf';
import chalk from 'chalk';

const config = new Conf({
    projectName: 'howcani'
});

export function setApiKey(key) {
    config.set('apiKey', key);
    console.log(chalk.green('✓ API key successfully saved!'));
    process.exit(0);
}

export function getApiKey() {
    return config.get('apiKey');
}

export function clearApiKey() {
    config.delete('apiKey');
}

export function setOS(os) {
    config.set('os', os);
    console.log(chalk.green(`✓ OS set to ${os}!`));
    process.exit(0);
}

export function getOS() {
    return config.get('os') || 'windows'; // default to windows if not set
} 