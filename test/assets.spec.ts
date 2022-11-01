import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { Asset} from '@umee_crosschain/shared-types'

const ASSET_DIR = './assets'

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

  it(`all assets should conform to the Asset type @umee_crosschain/shared-types`, () => {

    assetList.forEach(asset => {

      const key = Object.keys(asset)[0]

      const assetInfo: Asset = { ...asset[key] }

      const test = isValidAsset(assetInfo)

      if (!test) {
        throw new Error(`Asset ${key} does not adhere to the @umee_crosschain/shared-types.Asset schema`)
      }

      expect(test).toBeTruthy()


    });
  })
})
