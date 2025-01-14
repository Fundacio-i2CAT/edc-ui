import {Injectable} from '@angular/core';
import {UiAsset} from '@sovity.de/edc-client';
import {DataCategorySelectItem} from '../../routes/connector-ui/asset-page/data-category-select/data-category-select-item';
import {DataCategorySelectItemService} from '../../routes/connector-ui/asset-page/data-category-select/data-category-select-item.service';
import {DataSubcategorySelectItem} from '../../routes/connector-ui/asset-page/data-subcategory-select/data-subcategory-select-item';
import {DataSubcategorySelectItemService} from '../../routes/connector-ui/asset-page/data-subcategory-select/data-subcategory-select-item.service';
import {LanguageSelectItem} from '../../routes/connector-ui/asset-page/language-select/language-select-item';
import {LanguageSelectItemService} from '../../routes/connector-ui/asset-page/language-select/language-select-item.service';
import {TransportModeSelectItem} from '../../routes/connector-ui/asset-page/transport-mode-select/transport-mode-select-item';
import {TransportModeSelectItemService} from '../../routes/connector-ui/asset-page/transport-mode-select/transport-mode-select-item.service';
import {AdditionalAssetProperty, UiAssetMapped} from './models/ui-asset-mapped';

/**
 * Maps between EDC Asset and our type safe asset
 */
@Injectable({
  providedIn: 'root',
})
export class AssetBuilder {
  constructor(
    private languageSelectItemService: LanguageSelectItemService,
    private transportModeSelectItemService: TransportModeSelectItemService,
    private dataCategorySelectItemService: DataCategorySelectItemService,
    private dataSubcategorySelectItemService: DataSubcategorySelectItemService,
  ) {}

  buildAsset(asset: UiAsset): UiAssetMapped {
    const {
      customJsonAsString,
      customJsonLdAsString,
      privateCustomJsonAsString,
      privateCustomJsonLdAsString,
      language,
      dataCategory,
      dataSubcategory,
      transportMode,
      ...assetProperties
    } = asset;
    return {
      ...assetProperties,
      language: this.getLanguageItem(language),
      dataCategory: this.getDataCategoryItem(dataCategory),
      dataSubcategory: this.getDataSubcategoryItem(dataSubcategory),
      transportMode: this.getTransportModeItem(transportMode),
      mergedAdditionalProperties: this.buildAdditionalProperties(asset),
    };
  }

  private getTransportModeItem(
    transportMode: string | undefined,
  ): TransportModeSelectItem | null {
    return transportMode == null
      ? null
      : this.transportModeSelectItemService.findById(transportMode);
  }

  private getDataSubcategoryItem(
    dataSubcategory: string | undefined,
  ): DataSubcategorySelectItem | null {
    return dataSubcategory == null
      ? null
      : this.dataSubcategorySelectItemService.findById(dataSubcategory);
  }

  private getDataCategoryItem(
    dataCategory: string | undefined,
  ): DataCategorySelectItem | null {
    return dataCategory == null
      ? null
      : this.dataCategorySelectItemService.findById(dataCategory);
  }

  private getLanguageItem(
    language: string | undefined,
  ): LanguageSelectItem | null {
    return language == null
      ? null
      : this.languageSelectItemService.findById(language);
  }

  private buildAdditionalProperties(asset: UiAsset): AdditionalAssetProperty[] {
    const result: AdditionalAssetProperty[] = [];
    type AssetKey =
      | 'customJsonAsString'
      | 'customJsonLdAsString'
      | 'privateCustomJsonAsString'
      | 'privateCustomJsonLdAsString';

    const propertiesToConvert: AssetKey[] = [
      'customJsonAsString',
      'customJsonLdAsString',
      'privateCustomJsonAsString',
      'privateCustomJsonLdAsString',
    ];

    for (let propName of propertiesToConvert) {
      if (!asset[propName]) {
        continue;
      }

      try {
        const propJson = JSON.parse(asset[propName]!);
        for (let key in propJson) {
          result.push({key: key, value: propJson[key]});
        }
      } catch (e) {
        console.error('Error parsing additional properties', e);
      }
    }
    return result;
  }
}
