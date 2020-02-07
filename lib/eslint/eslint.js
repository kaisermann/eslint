/**
 * @fileoverview Main API Class
 * @author Kai Cataldo
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { CLIEngine } = require("../cli-engine");

//------------------------------------------------------------------------------
// Typedefs
//------------------------------------------------------------------------------

/**
 * The options with which to configure the main API instance.
 * @typedef {Object} ESLintOptions
 * @property {boolean} allowInlineConfig Enable or disable inline configuration comments.
 * @property {ConfigData} baseConfig Base config object, extended by all configs used with this instance
 * @property {boolean} cache Enable result caching.
 * @property {string} cacheLocation The cache file to use instead of .eslintcache.
 * @property {string} configFile The configuration file to use.
 * @property {string} cwd The value to use for the current working directory.
 * @property {string[]} envs An array of environments to load.
 * @property {string[]} extensions An array of file extensions to check.
 * @property {boolean|Function} fix Execute in autofix mode. If a function, should return a boolean.
 * @property {string[]} fixTypes Array of rule types to apply fixes for.
 * @property {string[]} globals An array of global variables to declare.
 * @property {boolean} globInputPaths Set to false to skip glob resolution of input file paths to lint (default: true). If false, each input file paths is assumed to be a non-glob path to an existing file.
 * @property {boolean} ignore False disables use of .eslintignore.
 * @property {string} ignorePath The ignore file to use instead of .eslintignore.
 * @property {string|string[]} ignorePattern One or more glob patterns to ignore.
 * @property {string} parser The name of the parser to use.
 * @property {ParserOptions} parserOptions An object of parserOption settings to use.
 * @property {string[]} plugins An array of plugins to load.
 * @property {boolean} reportUnusedDisableDirectives `true` adds reports for unused eslint-disable directives.
 * @property {string} resolvePluginsRelativeTo The folder where plugins should be resolved from, defaulting to the CWD.
 * @property {string[]} rulePaths An array of directories to load custom rules from.
 * @property {Record<string,RuleConf>} rules An object of rules to use.
 * @property {boolean} useEslintrc False disables looking for .eslintrc
 */

/**
 * A plugin object.
 * @typedef {Object} PluginElement
 * @property {string} id The plugin ID.
 * @property {Object} definition The plugin definition.
 */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Normalizes an array of plugins to their respective IDs.
 * @param {string[]|PluginElement[]} plugins An array of plugins to normalize.
 * @returns {string[]} The normalized array of plugins.
 */
function normalizePluginIds(plugins) {
    return plugins.map(p => (typeof p === "string" ? p : p.id));
}

class ESLint {

    /**
     * Creates a new instance of the main ESLint API.
     * @param {ESLintOptions} options The options for this instance.
     */
    constructor({
        allowInlineConfig = true,
        baseConfig = null,
        cache = false,
        cacheLocation = ".eslintcache",
        configFile = null,
        cwd = process.cwd(),
        envs = [],
        extensions = null,
        fix = false,
        fixTypes = ["problem", "suggestion", "layout"],
        globals = [],
        globInputPaths = true,
        ignore = true,
        ignorePath = null,
        ignorePattern = [],
        parser = "espree",
        parserOptions = null,
        plugins = [],
        reportUnusedDisableDirectives = false,
        resolvePluginsRelativeTo = cwd,
        rulePaths = [],
        rules = null,
        useEslintrc = true,
        ...unknownOptions
    }) {
        if (Object.keys(unknownOptions).length >= 1) {
            throw new Error(`${
                unknownOptions.includes("cacheFile")
                    ? "cacheFile has been deprecated. Please use the cacheLocation option instead. "
                    : ""
            }Unknown options given: ${unknownOptions.join(", ")}.`);
        }

        if (typeof allowInlineConfig !== "boolean") {
            throw new Error("allowInlineConfig must be a boolean.");
        }

        if (typeof baseConfig !== "object") {
            throw new Error("baseConfig must be an object or null.");
        }

        if (typeof cache !== "boolean") {
            throw new Error("cache must be a boolean.");
        }

        if (typeof cacheLocation !== "string") {
            throw new Error("cacheLocation must be a string.");
        }

        if (typeof configFile !== "string" && cacheLocation !== null) {
            throw new Error("configFile must be a string or null.");
        }

        if (typeof cwd !== "string") {
            throw new Error("cwd must be a string.");
        }

        if (!Array.isArray(envs)) {
            throw new Error("envs must be an array.");
        }

        if (!Array.isArray(extensions) && extensions !== null) {
            throw new Error("extensions must be an array or null.");
        }

        if (typeof fix !== "boolean") {
            throw new Error("fix must be a boolean.");
        }

        if (!Array.isArray(fixTypes)) {
            throw new Error("fixTypes must be an array.");
        }

        if (!Array.isArray(globals)) {
            throw new Error("globals must be an array.");
        }

        if (typeof globInputPaths !== "boolean") {
            throw new Error("globInputPaths must be a boolean.");
        }

        if (typeof ignore !== "boolean") {
            throw new Error("globInputPaths must be a boolean.");
        }

        if (typeof ignorePath !== "string" && ignorePath !== null) {
            throw new Error("ignorePath must be a string or null.");
        }

        if (typeof ignorePattern !== "string" && !Array.isArray(ignorePattern)) {
            throw new Error("ignorePattern must be a string or an array of strings.");
        }

        if (typeof parser !== "string") {
            throw new Error("parser must be a string.");
        }

        if (typeof parserOptions !== "object") {
            throw new Error("parserOptions must be an object or null.");
        }

        if (!Array.isArray(plugins)) {
            throw new Error("plugins must be an array.");
        }

        if (typeof reportUnusedDisableDirectives !== "boolean") {
            throw new Error("reportUnusedDisableDirectives must be a boolean.");
        }

        if (typeof resolvePluginsRelativeTo !== "string") {
            throw new Error("resolvePluginsRelativeTo must be a string.");
        }

        if (!Array.isArray(rulePaths)) {
            throw new Error("plugins must be an array.");
        }

        if (typeof rules !== "object") {
            throw new Error("rules must be an object or null.");
        }

        if (typeof useEslintrc !== "boolean") {
            throw new Error("useElintrc must be a boolean.");
        }

        this._cliEngine = new CLIEngine({
            allowInlineConfig,
            baseConfig,
            cache,
            cacheLocation,
            configFile,
            cwd,
            envs,
            extensions,
            fix,
            fixTypes,
            globInputPaths,
            globals,
            ignore,
            ignorePath,
            ignorePattern,
            parser,
            parserOptions,
            plugins: normalizePluginIds(plugins),
            reportUnusedDisableDirectives,
            resolvePluginsRelativeTo,
            rulePaths,
            rules,
            useEslintrc
        });

        if (plugins.length) {
            for (const plugin of plugins) {
                if (typeof plugin === "object" && plugin !== null) {
                    this._cliEngine.addPlugin(plugin.id, plugin.definition);
                }
            }
        }
    }
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
    ESLint
};
