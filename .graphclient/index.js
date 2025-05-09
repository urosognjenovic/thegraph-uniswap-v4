"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribe = exports.execute = exports.pollingInterval = exports.rawServeConfig = void 0;
exports.getMeshOptions = getMeshOptions;
exports.createBuiltMeshHTTPHandler = createBuiltMeshHTTPHandler;
exports.getBuiltGraphClient = getBuiltGraphClient;
const tslib_1 = require("tslib");
const utils_1 = require("@graphql-mesh/utils");
const utils_2 = require("@graphql-mesh/utils");
const cache_localforage_1 = tslib_1.__importDefault(require("@graphql-mesh/cache-localforage"));
const fetch_1 = require("@whatwg-node/fetch");
const graphql_1 = tslib_1.__importDefault(require("@graphql-mesh/graphql"));
const merger_bare_1 = tslib_1.__importDefault(require("@graphql-mesh/merger-bare"));
const http_1 = require("@graphql-mesh/http");
const runtime_1 = require("@graphql-mesh/runtime");
const store_1 = require("@graphql-mesh/store");
const cross_helpers_1 = require("@graphql-mesh/cross-helpers");
const importedModule$0 = tslib_1.__importStar(require("./sources/uniswap-v4-ethereum/introspectionSchema.json"));
const baseDir = cross_helpers_1.path.join(typeof __dirname === 'string' ? __dirname : '/', '..');
const importFn = (moduleId) => {
    const relativeModuleId = (cross_helpers_1.path.isAbsolute(moduleId) ? cross_helpers_1.path.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
    switch (relativeModuleId) {
        case ".graphclient/sources/uniswap-v4-ethereum/introspectionSchema.json":
            return Promise.resolve(importedModule$0);
        default:
            return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
    }
};
const rootStore = new store_1.MeshStore('.graphclient', new store_1.FsStoreStorageAdapter({
    cwd: baseDir,
    importFn,
    fileType: "json",
}), {
    readonly: true,
    validate: false
});
exports.rawServeConfig = undefined;
async function getMeshOptions() {
    const pubsub = new utils_1.PubSub();
    const sourcesStore = rootStore.child('sources');
    const logger = new utils_2.DefaultLogger("GraphClient");
    const cache = new cache_localforage_1.default({
        ...{},
        importFn,
        store: rootStore.child('cache'),
        pubsub,
        logger,
    });
    const sources = [];
    const transforms = [];
    const additionalEnvelopPlugins = [];
    const uniswapV4EthereumTransforms = [];
    const additionalTypeDefs = [];
    const uniswapV4EthereumHandler = new graphql_1.default({
        name: "uniswap-v4-ethereum",
        config: { "endpoint": "https://gateway.thegraph.com/api/79736e7c45536370ef208f02703db8ac/subgraphs/id/DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G" },
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child("uniswap-v4-ethereum"),
        logger: logger.child("uniswap-v4-ethereum"),
        importFn,
    });
    sources[0] = {
        name: 'uniswap-v4-ethereum',
        handler: uniswapV4EthereumHandler,
        transforms: uniswapV4EthereumTransforms
    };
    const additionalResolvers = [];
    const merger = new merger_bare_1.default({
        cache,
        pubsub,
        logger: logger.child('bareMerger'),
        store: rootStore.child('bareMerger')
    });
    return {
        sources,
        transforms,
        additionalTypeDefs,
        additionalResolvers,
        cache,
        pubsub,
        merger,
        logger,
        additionalEnvelopPlugins,
        get documents() {
            return [];
        },
        fetchFn: fetch_1.fetch,
    };
}
function createBuiltMeshHTTPHandler() {
    return (0, http_1.createMeshHTTPHandler)({
        baseDir,
        getBuiltMesh: getBuiltGraphClient,
        rawServeConfig: undefined,
    });
}
let meshInstance$;
exports.pollingInterval = null;
function getBuiltGraphClient() {
    if (meshInstance$ == null) {
        if (exports.pollingInterval) {
            setInterval(() => {
                getMeshOptions()
                    .then(meshOptions => (0, runtime_1.getMesh)(meshOptions))
                    .then(newMesh => meshInstance$.then(oldMesh => {
                    oldMesh.destroy();
                    meshInstance$ = Promise.resolve(newMesh);
                })).catch(err => {
                    console.error("Mesh polling failed so the existing version will be used:", err);
                });
            }, exports.pollingInterval);
        }
        meshInstance$ = getMeshOptions().then(meshOptions => (0, runtime_1.getMesh)(meshOptions)).then(mesh => {
            const id = mesh.pubsub.subscribe('destroy', () => {
                meshInstance$ = undefined;
                mesh.pubsub.unsubscribe(id);
            });
            return mesh;
        });
    }
    return meshInstance$;
}
const execute = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));
exports.execute = execute;
const subscribe = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
exports.subscribe = subscribe;
