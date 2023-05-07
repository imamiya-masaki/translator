require('dotenv').config()

const definedEnvs = ['STAG_POSTGRES_URI', 'DEV_POSTGRES_URI','PROD_POSTGRES_URI', 'APP_SECRET', 'MODE', 'NODE_ENV'] as const satisfies readonly string[];
export type DefinedEnv = (typeof definedEnvs)[number]; 
export const getEnv = (definedEnv: DefinedEnv): string => {
    const geted = process?.env?.[definedEnv]
    if (geted === undefined) {
        console.error(".envに定義されていません: ", definedEnv)
        return ""
    }
    return geted
}

const nodeModes = ['development', 'production', 'staging'] as const satisfies readonly string[];

export type NodeMode = (typeof nodeModes)[number];

export function assertsNodeMode (value: any): asserts value is NodeMode {
  if (!nodeModes.includes(value)) {
    throw Error(`mode must includes ${nodeModes.join(',')}`)
  }
}

export const getDBURL = (mode: NodeMode): string => {
    switch(mode) {
        case 'development':
            return getEnv("DEV_POSTGRES_URI")
        case 'production':
            return getEnv("PROD_POSTGRES_URI")
        case 'staging':
            return getEnv("STAG_POSTGRES_URI")
    }
}