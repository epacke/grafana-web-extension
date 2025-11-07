// Centralized config module - exports config as a variable
// Loads config.yaml at startup and populates the exported config object
import yaml from 'js-yaml';
import IConfig from '../interfaces/IConfig';

/**
 * Exported config variable - starts as empty object, gets populated when loaded
 * All properties are optional, so accessing them is safe even before loading
 * 
 * Usage:
 *   import { config, configLoaded } from './utils/config';
 *   
 *   // In async code, await first:
 *   await configLoaded;
 *   if (config.alert_buttons) { ... }
 *   
 *   // Or just use optional chaining (config starts as {}):
 *   if (config?.alert_buttons) { ... }
 */
export const config: IConfig = {};

// Promise that resolves when config is loaded
let configPromise: Promise<IConfig> | null = null;

/**
 * Load the config from the YAML file and populate the exported config object
 */
const loadConfig = async (): Promise<IConfig> => {
  if (configPromise) {
    return configPromise; // Already loading
  }

  // Check if already loaded (has properties)
  if (Object.keys(config).length > 0) {
    return config;
  }

  configPromise = (async () => {
    try {
      const configUrl = chrome.runtime.getURL('config/config.yaml');
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        console.error(`HTTP error loading config: ${response.status} ${response.statusText}`);
        return config; // Return empty config
      }
      
      const yamlText = await response.text();
      const loadedConfig = yaml.load(yamlText) as IConfig;
      
      // Populate the exported config object
      Object.assign(config, loadedConfig || {});
      
      return config;
    } catch (error) {
      console.error('Failed to load config:', error);
      return config; // Return empty config
    } finally {
      configPromise = null;
    }
  })();

  return configPromise;
};

/**
 * Promise that resolves when config is loaded
 * Await this in main.ts before initializing scripts to ensure config is ready
 */
export const configLoaded = loadConfig();
