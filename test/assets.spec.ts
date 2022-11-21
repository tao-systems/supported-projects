import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { Asset } from '@tabu/shared-types'
import Ajv from 'ajv'


const ajv = new Ajv()
const ASSET_DIR = './assets'

const ASSET_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    address: { type: "string" },
    name: { type: "string" },
    symbol: { type: "string" },
    decimals: { type: "integer" },
    website: { type: "string" },
    shortDescription: { type: 'string'},
    explorer: { type: "string" },
    description: { type: "string" },
    link: { type: "string" },
    coinGeckoId: { type: "string" },
    logo: { type: "string" },
    chainId: {type: "string"}
  },
  required: [
    'type',
    'address',
    'name',
    'symbol',
    'decimals',
    'shortDescription',
    'description',
    'link',
    'coinGeckoId',
    'chainId',
    'logo'],
  additionalProperties: false
}

const validationModel = ajv.compile(ASSET_SCHEMA)

function isValidAsset(obj: any): obj is Asset {
  if ((obj as Asset).type) {
    return true
  }
  return false
}

describe(`Validate supported assets`, () => {
  let assetList;
  beforeAll(async () => {
    const assetDirectories = await readdirSync(ASSET_DIR);

    assetList = await Promise.all(assetDirectories.map((assetName) => {
      return { [assetName]: JSON.parse(readFileSync(path.join(ASSET_DIR, assetName, 'index.json'), 'utf8')) }
    }))
  })

  it(`all assets should conform to the Asset type @tabu/shared-types`, () => {

    assetList.forEach(asset => {

      const key = Object.keys(asset)[0]

      const assetInfo: Asset = { ...asset[key] }

      const testType = isValidAsset(assetInfo)

      const propertyTest = validationModel(assetInfo)

      if (!testType) {
        throw new Error(`Asset ${key} does not adhere to the @tabu/shared-types.Asset schema`)
      }
      if (!propertyTest) console.log(validationModel.errors)
      expect(testType).toBeTruthy()
      console.log(propertyTest)
      expect(propertyTest).toBeTruthy()

    });
  })
})
