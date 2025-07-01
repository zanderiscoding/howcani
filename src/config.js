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

export function setModel(model) {
    config.set('model', model);
    
    // Add model to saved models list if it's not already there
    const savedModels = config.get('savedModels') || ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
    if (!savedModels.includes(model)) {
        savedModels.push(model);
        config.set('savedModels', savedModels);
    }
    
    console.log(chalk.green(`✓ Model set to: ${model}`));
    process.exit(0);
}

export function getModel() {
    return config.get('model') || 'gpt-4o'; // default to gpt-4o if not set
}

export function getSavedModels() {
    return config.get('savedModels') || ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
} 